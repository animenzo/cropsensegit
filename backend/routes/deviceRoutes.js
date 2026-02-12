const express = require('express');
const router = express.Router();
const auth= require('../middleware/auth');
const {
  updateBlynkConfig,
  addPin,
  getPins,
  deletePin,
  getLiveData,
  controlDevice,
  getHistoricalData,
  discoverPins
} = require('../controllers/deviceController');

// Configuration
router.post('/config', auth, updateBlynkConfig); // Save Auth Token

// Pin Management
router.post('/pins', auth, addPin);            // Add V-Pin
router.get('/pins/:farmId', auth, getPins);    // Get List
router.delete('/pins/:id', auth, deletePin);   // Delete Pin

// Live Data & Control
router.get('/live/:farmId', auth, getLiveData); // Dashboard Poll
router.post('/control', auth, controlDevice);   // Toggle Switch/Pump

// Graph Data
router.get('/history/:farmId', auth, getHistoricalData); // Recharts Data
router.post('/discover', auth, discoverPins);
module.exports = router;