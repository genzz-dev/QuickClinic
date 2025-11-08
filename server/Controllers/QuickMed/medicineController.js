import axios from 'axios';

// Search for medicine suggestions by name
export const searchMedicine = async (req, res) => {
  try {
    const { medicineName } = req.query;

    if (!medicineName || medicineName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required'
      });
    }

    // RxNorm API - Get spelling suggestions and search
    const rxNormUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(medicineName)}&search=1`;
    
    const rxResponse = await axios.get(rxNormUrl);
    const medicines = [];

    if (rxResponse.data.idGroup && rxResponse.data.idGroup.rxList) {
      for (const drug of rxResponse.data.idGroup.rxList) {
        const rxcui = drug.rxcui;
        const name = drug.name;

        // Get detailed properties for each medicine
        const detailsUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json?propCategories=all`;
        const detailsResponse = await axios.get(detailsUrl);
        
        let medicineDetails = {
          rxcui: rxcui,
          name: name,
          genericName: name,
          brandNames: [],
          strength: 'N/A',
          dosageForm: 'N/A'
        };

        if (detailsResponse.data.propConceptGroup) {
          for (const group of detailsResponse.data.propConceptGroup) {
            if (group.propConcept) {
              for (const prop of group.propConcept) {
                if (prop.propName === 'DOSE_FORM') {
                  medicineDetails.dosageForm = prop.propValue;
                }
                if (prop.propName === 'STRENGTH') {
                  medicineDetails.strength = prop.propValue;
                }
              }
            }
          }
        }

        // Get brand names
        const brandUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?rela=tradename_of`;
        try {
          const brandResponse = await axios.get(brandUrl);
          if (brandResponse.data.relatedGroup && brandResponse.data.relatedGroup.length > 0) {
            const conceptGroup = brandResponse.data.relatedGroup[0].conceptGroup;
            if (conceptGroup) {
              medicineDetails.brandNames = conceptGroup.map(group => 
                group.conceptProperties ? group.conceptProperties[0].name : ''
              ).filter(name => name);
            }
          }
        } catch (err) {
          console.log('Error fetching brand names');
        }

        medicines.push(medicineDetails);
      }
    }

    res.status(200).json({
      success: true,
      data: medicines,
      count: medicines.length
    });

  } catch (error) {
    console.error('Error searching medicine:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching for medicine',
      error: error.message
    });
  }
};

// Get detailed medicine information including side effects
export const getMedicineDetails = async (req, res) => {
  try {
    const { medicineName } = req.params;

    if (!medicineName || medicineName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required'
      });
    }

    // Step 1: Search in RxNorm for the medicine
    const rxNormUrl = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(medicineName)}&search=1`;
    const rxResponse = await axios.get(rxNormUrl);

    if (!rxResponse.idGroup || !rxResponse.idGroup.rxList || rxResponse.idGroup.rxList.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    const drug = rxResponse.idGroup.rxList[0];
    const rxcui = drug.rxcui;
    const name = drug.name;
    
    // Step 2: Get all RxNorm properties
    const propertiesUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json?propCategories=all`;
    const propertiesResponse = await axios.get(propertiesUrl);

    let medicineData = {
      name: name,
      rxcui: rxcui,
      genericName: name,
      brandNames: [],
      strength: 'N/A',
      dosageForm: 'N/A',
      properties: {}
    };

    if (propertiesResponse.data.propConceptGroup) {
      for (const group of propertiesResponse.data.propConceptGroup) {
        if (group.propConcept) {
          for (const prop of group.propConcept) {
            medicineData.properties[prop.propName] = prop.propValue;
            if (prop.propName === 'DOSE_FORM') {
              medicineData.dosageForm = prop.propValue;
            }
            if (prop.propName === 'STRENGTH') {
              medicineData.strength = prop.propValue;
            }
          }
        }
      }
    }

    // Step 3: Get brand names and related drugs
    const relatedUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json`;
    try {
      const relatedResponse = await axios.get(relatedUrl);
      if (relatedResponse.data.relatedGroup) {
        for (const group of relatedResponse.data.relatedGroup) {
          if (group.rela === 'tradename_of' && group.conceptGroup) {
            medicineData.brandNames = group.conceptGroup.map(cg => 
              cg.conceptProperties ? cg.conceptProperties[0].name : ''
            ).filter(n => n);
          }
        }
      }
    } catch (err) {
      console.log('Error fetching related information');
    }

    // Step 4: Get side effects and adverse events from OpenFDA
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=generic_name:"${encodeURIComponent(name)}"&limit=1`;
    let sideEffects = [];
    let warnings = [];
    let dosageInfo = {};
    let indications = [];

    try {
      const fdaResponse = await axios.get(fdaUrl);
      if (fdaResponse.data.results && fdaResponse.data.results.length > 0) {
        const label = fdaResponse.data.results[0];
        
        sideEffects = label.adverse_reactions || [];
        warnings = label.warnings || [];
        dosageInfo = {
          dosage_and_administration: label.dosage_and_administration ? label.dosage_and_administration[0] : 'N/A',
          directions_for_use: label.directions_for_use ? label.directions_for_use[0] : 'N/A'
        };
        indications = label.indications_and_usage || [];
      }
    } catch (err) {
      console.log('FDA data not found for this medicine, attempting alternative search');
      
      // Try alternative FDA search using brand name
      try {
        const altFdaUrl = `https://api.fda.gov/drug/label.json?search=brand_name:"${encodeURIComponent(name)}"&limit=1`;
        const altFdaResponse = await axios.get(altFdaUrl);
        if (altFdaResponse.data.results && altFdaResponse.data.results.length > 0) {
          const label = altFdaResponse.data.results[0];
          sideEffects = label.adverse_reactions || [];
          warnings = label.warnings || [];
          dosageInfo = {
            dosage_and_administration: label.dosage_and_administration ? label.dosage_and_administration[0] : 'N/A',
            directions_for_use: label.directions_for_use ? label.directions_for_use[0] : 'N/A'
          };
          indications = label.indications_and_usage || [];
        }
      } catch (altErr) {
        console.log('Alternative FDA search also failed');
      }
    }

    // Step 5: Get adverse event reports
    let adverseEvents = [];
    const adverseEventsUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.generic_name:"${encodeURIComponent(name)}"&count=patient.reaction.reactionmeddrapt.exact&limit=10`;
    
    try {
      const adverseResponse = await axios.get(adverseEventsUrl);
      if (adverseResponse.data.results) {
        adverseEvents = adverseResponse.data.results.map(result => ({
          event: result.term,
          count: result.count
        }));
      }
    } catch (err) {
      console.log('Error fetching adverse events');
    }

    // Combine all data
    const completeDetails = {
      ...medicineData,
      sideEffects: sideEffects,
      commonAdverseReactions: adverseEvents.slice(0, 10),
      warnings: warnings,
      indications: indications,
      dosageInfo: dosageInfo
    };

    res.status(200).json({
      success: true,
      data: completeDetails
    });

  } catch (error) {
    console.error('Error fetching medicine details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine details',
      error: error.message
    });
  }
};

// Auto-complete suggestions as user types
export const getMedicineSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '' || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters'
      });
    }

    // RxNorm spelling suggestions
    const suggestUrl = `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`;
    const suggestResponse = await axios.get(suggestUrl);

    const suggestions = suggestResponse.data.suggestionGroup && suggestResponse.data.suggestionGroup[0]
      ? suggestResponse.data.suggestionGroup[0].suggestionList.suggestion
      : [];

    res.status(200).json({
      success: true,
      suggestions: suggestions,
      count: suggestions.length
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message
    });
  }
};
