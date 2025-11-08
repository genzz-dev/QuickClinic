import express from 'express';
import { searchMedicine, getMedicineDetails, getMedicineSuggestions } from '../../Controllers/QuickMed/medicineController.js'

const router = express.Router();

// Search for medicines by name
router.get('/search', searchMedicine);

// Get detailed information about a specific medicine
router.get('/details/:medicineName', getMedicineDetails);

// Get auto-complete suggestions
router.get('/suggestions', getMedicineSuggestions);

export default router;
