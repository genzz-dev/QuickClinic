import axios from 'axios';

/**
 * MEDICINE BACKEND CONTROLLER
 * Free APIs Used:
 * 1. RxNorm API (NIH) - Medicine info, names, properties (No API key required)
 * 2. OpenFDA API - Side effects, warnings, dosage, usage info (No API key required)
 */

// ============================================
// 1. AUTO-SUGGESTION ENDPOINT
// ============================================
// GET /api/medicines/suggestions?query=aspir
export const getMedicineSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    // Validate input
    if (!query || query.trim() === '' || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters',
      });
    }

    // RxNorm spelling suggestions API
    const suggestUrl = `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`;
    const suggestResponse = await axios.get(suggestUrl);

    const suggestions =
      suggestResponse.data.suggestionGroup?.suggestionGroup?.[0]?.suggestionList?.suggestion || [];

    res.status(200).json({
      success: true,
      suggestions: suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error.message);
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
// GET /api/medicines/search?medicineName=aspirin
export const searchMedicine = async (req, res) => {
  try {
    const { medicineName } = req.query;

    // Validate input
    if (!medicineName || medicineName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required',
      });
    }

    // Search RxNorm for medicines
    const rxNormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(medicineName)}`;
    const rxResponse = await axios.get(rxNormUrl);

    const medicines = [];

    // Check if results exist
    if (rxResponse.data.drugGroup?.conceptGroup) {
      for (const group of rxResponse.data.drugGroup.conceptGroup) {
        if (group.conceptProperties) {
          for (const drug of group.conceptProperties) {
            const rxcui = drug.rxcui;
            const name = drug.name;

            // Get detailed properties
            try {
              const detailsUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`;
              const detailsResponse = await axios.get(detailsUrl);

              let medicineDetails = {
                rxcui: rxcui,
                name: name,
                genericName: detailsResponse.data.properties?.genericName || name,
                synonym: detailsResponse.data.properties?.synonym || 'N/A',
                strength: detailsResponse.data.properties?.strength || 'N/A',
                doseForm: detailsResponse.data.properties?.doseForm || 'N/A',
              };

              medicines.push(medicineDetails);
            } catch (err) {
              console.log('Error fetching details for:', name);
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: medicines,
      count: medicines.length,
    });
  } catch (error) {
    console.error('Error searching medicine:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching for medicine',
      error: error.message,
    });
  }
};

// ============================================
// 3. GET DETAILED MEDICINE INFO ENDPOINT
// ============================================
// GET /api/medicines/details/:medicineName
export const getMedicineDetails = async (req, res) => {
  try {
    const { medicineName } = req.params;

    // Validate input
    if (!medicineName || medicineName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required',
      });
    }

    // Step 1: Search in RxNorm for the medicine
    const rxNormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(medicineName)}`;
    const rxResponse = await axios.get(rxNormUrl);

    // Check if medicine exists
    if (!rxResponse.data.drugGroup?.conceptGroup) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    // Get first match
    let drug = null;
    for (const group of rxResponse.data.drugGroup.conceptGroup) {
      if (group.conceptProperties && group.conceptProperties.length > 0) {
        drug = group.conceptProperties[0];
        break;
      }
    }

    if (!drug) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found',
      });
    }

    const rxcui = drug.rxcui;
    const name = drug.name;

    // Step 2: Get RxNorm properties
    const propertiesUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`;
    const propertiesResponse = await axios.get(propertiesUrl);

    let medicineData = {
      name: name,
      rxcui: rxcui,
      genericName: propertiesResponse.data.properties?.genericName || name,
      brandName: propertiesResponse.data.properties?.brandName || 'N/A',
      strength: propertiesResponse.data.properties?.strength || 'N/A',
      doseForm: propertiesResponse.data.properties?.doseForm || 'N/A',
      synonym: propertiesResponse.data.properties?.synonym || 'N/A',
    };

    // Step 3: Get related drugs (brand names)
    const relatedUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=BN+SBD`;
    let brandNames = [];
    try {
      const relatedResponse = await axios.get(relatedUrl);
      if (relatedResponse.data.relatedGroup?.conceptGroup) {
        for (const group of relatedResponse.data.relatedGroup.conceptGroup) {
          if (group.conceptProperties) {
            brandNames = group.conceptProperties.map((cp) => cp.name);
          }
        }
      }
    } catch (err) {
      console.log('Error fetching related information');
    }
    medicineData.brandNames = brandNames;

    // Step 4: Get side effects and usage from OpenFDA
    let sideEffects = [];
    let warnings = [];
    let dosageInfo = 'N/A';
    let indications = [];
    let contraindications = [];
    let interactions = [];

    // Try generic name search
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`;
    try {
      const fdaResponse = await axios.get(fdaUrl);

      if (fdaResponse.data.results && fdaResponse.data.results.length > 0) {
        const label = fdaResponse.data.results[0];

        // Side effects
        sideEffects = label.adverse_reactions || [];

        // Warnings
        warnings = label.warnings || label.boxed_warning || label.warnings_and_cautions || [];

        // Dosage information
        dosageInfo = label.dosage_and_administration ? label.dosage_and_administration[0] : 'N/A';

        // Indications (uses)
        indications = label.indications_and_usage || [];

        // Contraindications
        contraindications = label.contraindications || [];

        // Drug interactions
        interactions = label.drug_interactions || [];
      }
    } catch (err) {
      console.log('FDA generic name search failed, trying brand name...');

      // Try brand name search
      try {
        const altFdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(name)}"&limit=1`;
        const altFdaResponse = await axios.get(altFdaUrl);

        if (altFdaResponse.data.results && altFdaResponse.data.results.length > 0) {
          const label = altFdaResponse.data.results[0];

          sideEffects = label.adverse_reactions || [];
          warnings = label.warnings || label.boxed_warning || label.warnings_and_cautions || [];
          dosageInfo = label.dosage_and_administration ? label.dosage_and_administration[0] : 'N/A';
          indications = label.indications_and_usage || [];
          contraindications = label.contraindications || [];
          interactions = label.drug_interactions || [];
        }
      } catch (altErr) {
        console.log('Alternative FDA search also failed');
      }
    }

    // Step 5: Get adverse event reports (common side effects reported by patients)
    let adverseEvents = [];
    const adverseEventsUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.generic_name:"${encodeURIComponent(name)}"&count=patient.reaction.reactionmeddrapt.exact&limit=10`;
    try {
      const adverseResponse = await axios.get(adverseEventsUrl);

      if (adverseResponse.data.results) {
        adverseEvents = adverseResponse.data.results.map((result) => ({
          reaction: result.term,
          count: result.count,
        }));
      }
    } catch (err) {
      console.log('Error fetching adverse events');
    }

    // Combine all data
    const completeDetails = {
      ...medicineData,
      usage: {
        indications: indications,
        dosageInfo: dosageInfo,
      },
      sideEffects: {
        adverseReactions: sideEffects,
        commonReportedReactions: adverseEvents.slice(0, 10),
      },
      warnings: warnings,
      contraindications: contraindications,
      interactions: interactions,
    };

    res.status(200).json({
      success: true,
      data: completeDetails,
    });
  } catch (error) {
    console.error('Error fetching medicine details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine details',
      error: error.message,
    });
  }
};

// ============================================
// 4. GET DRUG INTERACTIONS ENDPOINT (BONUS)
// ============================================
// GET /api/medicines/interactions?rxcui=rxcui1,rxcui2
export const getDrugInteractions = async (req, res) => {
  try {
    const { rxcui } = req.query;

    if (!rxcui || rxcui.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'RxCUI is required',
      });
    }

    // RxNorm drug interactions API
    const interactionUrl = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${encodeURIComponent(rxcui)}`;
    const interactionResponse = await axios.get(interactionUrl);

    const interactions = [];
    if (interactionResponse.data.fullInteractionTypeGroup) {
      for (const group of interactionResponse.data.fullInteractionTypeGroup) {
        if (group.fullInteractionType) {
          for (const interactionType of group.fullInteractionType) {
            if (interactionType.interactionPair) {
              for (const pair of interactionType.interactionPair) {
                interactions.push({
                  drug1: pair.interactionConcept[0]?.minConceptItem?.name || 'Unknown',
                  drug2: pair.interactionConcept[1]?.minConceptItem?.name || 'Unknown',
                  severity: pair.severity || 'N/A',
                  description: pair.description || 'N/A',
                });
              }
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: interactions,
      count: interactions.length,
    });
  } catch (error) {
    console.error('Error fetching interactions:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching drug interactions',
      error: error.message,
    });
  }
};
