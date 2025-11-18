import axios from 'axios';

/**
 * MEDICINE BACKEND CONTROLLER - OpenFDA API
 *
 * API Used (FREE and NO API KEY required):
 * - OpenFDA Drug Label API - Clean drug names and complete FDA-approved information
 *
 * This provides better search results with simpler drug names
 */

// ============================================
// 1. AUTO-SUGGESTION ENDPOINT
// ============================================
export const getMedicineSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '' || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters',
      });
    }

    console.log('Fetching suggestions for:', query);

    // Using OpenFDA drug label API for suggestions
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"*+openfda.generic_name:"${encodeURIComponent(query)}"*&limit=10`;

    try {
      const response = await axios.get(url, { timeout: 10000 });

      const suggestions = new Set();

      if (response.data && response.data.results) {
        response.data.results.forEach((result) => {
          // Add brand names
          if (result.openfda && result.openfda.brand_name) {
            result.openfda.brand_name.forEach((name) => {
              if (name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(name);
              }
            });
          }
          // Add generic names
          if (result.openfda && result.openfda.generic_name) {
            result.openfda.generic_name.forEach((name) => {
              if (name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(name);
              }
            });
          }
        });
      }

      res.status(200).json({
        success: true,
        suggestions: Array.from(suggestions).slice(0, 10),
        count: suggestions.size,
      });
    } catch (err) {
      // If no results, return empty
      res.status(200).json({
        success: true,
        suggestions: [],
        count: 0,
      });
    }
  } catch (error) {
    console.error('Suggestions error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message,
    });
  }
};

// ============================================
// 2. SEARCH MEDICINE ENDPOINT
// ============================================
export const searchMedicine = async (req, res) => {
  try {
    const { medicineName } = req.query;

    if (!medicineName || medicineName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required',
      });
    }

    console.log('Searching for:', medicineName);

    // Search in OpenFDA using brand name or generic name
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(medicineName)}"+openfda.generic_name:"${encodeURIComponent(medicineName)}"&limit=20`;

    try {
      const response = await axios.get(url, { timeout: 10000 });

      const medicines = [];
      const seenNames = new Set();

      if (response.data && response.data.results) {
        response.data.results.forEach((result) => {
          const brandName = result.openfda?.brand_name?.[0] || 'Unknown';
          const genericName = result.openfda?.generic_name?.[0] || '';
          const manufacturer = result.openfda?.manufacturer_name?.[0] || '';

          // Use brand name as primary identifier
          const primaryName = brandName !== 'Unknown' ? brandName : genericName;

          // Avoid duplicates
          if (!seenNames.has(primaryName.toLowerCase())) {
            seenNames.add(primaryName.toLowerCase());

            medicines.push({
              id: result.id || primaryName,
              name: primaryName,
              genericName: genericName,
              manufacturer: manufacturer,
              productType: result.openfda?.product_type?.[0] || 'N/A',
            });
          }
        });
      }

      res.status(200).json({
        success: true,
        data: medicines,
        count: medicines.length,
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching medicine',
      error: error.message,
    });
  }
};

// Helper function to clean and extract text from arrays
const extractText = (dataArray) => {
  if (!dataArray || !Array.isArray(dataArray)) return [];
  return dataArray.filter((text) => text && text.trim().length > 0);
};

// ============================================
// 3. GET DETAILED MEDICINE INFORMATION
// ============================================
export const getMedicineDetails = async (req, res) => {
  try {
    const { medicineName } = req.params;

    if (!medicineName || medicineName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required',
      });
    }

    console.log('Getting details for:', medicineName);

    // Search OpenFDA for exact match
    const searchUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(medicineName)}"+openfda.generic_name:"${encodeURIComponent(medicineName)}"&limit=1`;

    const response = await axios.get(searchUrl, { timeout: 15000 });

    if (!response.data || !response.data.results || response.data.results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    const drug = response.data.results[0];

    // Extract all relevant information
    const medicineDetails = {
      // Basic Information
      name: drug.openfda?.brand_name?.[0] || medicineName,
      genericName: drug.openfda?.generic_name?.[0] || 'N/A',
      manufacturer: drug.openfda?.manufacturer_name?.[0] || 'N/A',
      productType: drug.openfda?.product_type?.[0] || 'N/A',
      route: drug.openfda?.route?.[0] || 'N/A',

      // Description
      description: extractText(drug.description || drug.purpose),

      // Usage Information
      indications: extractText(drug.indications_and_usage),
      dosage: extractText(drug.dosage_and_administration),
      purpose: extractText(drug.purpose),

      // Safety Information
      warnings: extractText(drug.warnings || drug.warnings_and_cautions),
      sideEffects: extractText(drug.adverse_reactions),
      contraindications: extractText(drug.contraindications),

      // Additional Safety Info
      boxedWarning: extractText(drug.boxed_warning),
      precautions: extractText(drug.precautions),

      // Drug Interactions
      interactions: extractText(drug.drug_interactions),

      // Additional Information
      overdosage: extractText(drug.overdosage),
      storage: extractText(drug.storage_and_handling),

      // Pregnancy and Nursing
      pregnancy: extractText(drug.pregnancy),
      nursing: extractText(drug.nursing_mothers),

      // Pediatric and Geriatric
      pediatric: extractText(drug.pediatric_use),
      geriatric: extractText(drug.geriatric_use),

      // Active Ingredients
      activeIngredients: extractText(drug.active_ingredient),
      inactiveIngredients: extractText(drug.inactive_ingredient),
    };

    res.status(200).json({
      success: true,
      data: medicineDetails,
    });
  } catch (error) {
    console.error('Details error:', error.message);

    if (error.response && error.response.status === 404) {
      res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error fetching medicine details',
        error: error.message,
      });
    }
  }
};
