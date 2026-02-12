const User = require('../models/User');
const PinConfig = require('../models/PinConfig');
const DeviceLog = require('../models/DeviceLog');
const blynkService = require('../utils/blynkService');
const axios = require('axios');

// @desc    Update User's Blynk Token
// @route   POST /api/device/config
const updateBlynkConfig = async (req, res) => {
  try {
    const { authToken } = req.body;
    if (!authToken) return res.status(400).json({ message: 'Auth Token is required' });

    const user = await User.findById(req.user.id);
    user.blynk.authToken = authToken;
    user.blynk.isConfigured = true;
    await user.save();

    res.json({ message: 'Blynk configuration saved', isConfigured: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new Virtual Pin to track
// @route   POST /api/device/pins
const addPin = async (req, res) => {
  try {
    const { farmId, pin, label, type, dataType, min, max } = req.body;

    // Check if pin already exists for this farm
    const exists = await PinConfig.findOne({ farmId, pin });
    if (exists) return res.status(400).json({ message: 'Pin already configured' });

    const newPin = await PinConfig.create({
      user: req.user.id,
      farmId,
      pin,
      label,
      type,
      dataType,
      min,
      max
    });

    res.status(201).json(newPin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pins configured for a farm
// @route   GET /api/device/pins/:farmId
const getPins = async (req, res) => {
  try {
    const pins = await PinConfig.find({ farmId: req.params.farmId });
    res.json(pins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a pin configuration
// @route   DELETE /api/device/pins/:id
const deletePin = async (req, res) => {
  try {
    await PinConfig.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pin removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Real-Time Data from Blynk for Dashboard
// @route   GET /api/device/live/:farmId
const getLiveData = async (req, res) => {
  try {
    const { farmId } = req.params;
    
    // 1. Get Token
    const user = await User.findById(req.user.id);
    if (!user || !user.blynk || !user.blynk.authToken) {
        return res.status(400).json({ message: "No Auth Token" });
    }
    const token = user.blynk.authToken;

    // 2. Get Configured Pins
    const pinConfigs = await PinConfig.find({ farmId });

    // --- NEW: CHECK ONLINE STATUS ---
    let isDeviceOnline = false;
    try {
        const statusUrl = `https://blynk.cloud/external/api/isHardwareConnected?token=${token}`;
        const statusResponse = await axios.get(statusUrl);
        // Blynk returns true or false
        isDeviceOnline = statusResponse.data === true;
    } catch (e) {
        console.error("Failed to check status:", e.message);
        isDeviceOnline = false; 
    }

    // 3. Fetch Sensor Values
    const liveDataPromises = pinConfigs.map(async (config) => {
        try {
            const url = `https://blynk.cloud/external/api/get?token=${token}&${config.pin}`;
            const response = await axios.get(url);
            return {
                ...config.toObject(),
                value: response.data
            };
        } catch (e) {
            return { ...config.toObject(), value: 0 };
        }
    });

    const sensors = await Promise.all(liveDataPromises);

    // 4. Send EVERYTHING back
    res.json({
        online: isDeviceOnline, // <--- The Real Status
        sensors: sensors
    });

  } catch (error) {
    console.error("Live Data Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Control an Actuator (Pump/Switch)
// @route   POST /api/device/control
const controlDevice = async (req, res) => {
  try {
    const { pin, value } = req.body;
    const user = await User.findById(req.user.id);

    await blynkService.setPinValue(user.blynk.authToken, pin, value);
    res.json({ success: true, pin, value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Historical Data for Graphs
// @route   GET /api/device/history/:farmId
const getHistoricalData = async (req, res) => {
  try {
    const { duration = 24 } = req.query; // hours
    const cutoff = new Date(Date.now() - duration * 60 * 60 * 1000);

    const logs = await DeviceLog.find({ 
      farmId: req.params.farmId,
      timestamp: { $gte: cutoff }
    }).sort({ timestamp: 1 });

    // Format for Recharts: array of objects
    // [ { timestamp: '10:00', v0: 23, v1: 55 }, ... ]
    const graphData = logs.map(log => {
      const entry = { timestamp: log.timestamp };
      // Convert Map to Object properties
      if (log.readings) {
        for (let [key, val] of log.readings) {
          entry[key] = val;
        }
      }
      return entry;
    });

    res.json(graphData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// backend/controllers/deviceController.js

const discoverPins = async (req, res) => {
  try {
    const { farmId } = req.body;
    const user = await User.findById(req.user.id);
    const token = user.blynk?.authToken;

    if (!token) {
        console.log("❌ Scan Failed: No Token Found");
        return res.status(400).json({ message: "No Blynk Token configured." });
    }

    console.log(`\n🔍 STARTING SCAN...`);
    console.log(`🔹 Farm ID: ${farmId}`);
    console.log(`🔹 Token: ${token.substring(0, 5)}...`);

    // Scan V0 to V10 (Reduced range for speed debugging)
    const pinsToScan = Array.from({ length: 10 }, (_, i) => `v${i}`);
    const foundPins = [];

    for (const pin of pinsToScan) {
        try {
            const url = `https://blynk.cloud/external/api/get?token=${token}&${pin}`;
            // console.log(`   Testing ${pin}...`); // Uncomment if you want to see every check

            const response = await axios.get(url);
            const val = response.data;

            // Debug Log: Show exactly what Blynk replied
            if (val !== undefined && val !== null && val !== "") {
                console.log(`   ✅ FOUND ${pin}: Value = ${val}`);
                
                // Check database
                const exists = await PinConfig.findOne({ farmId, pin });
                if (!exists) {
                    const newPin = await PinConfig.create({
                        user: req.user.id,
                        farmId,
                        pin,
                        label: `New Sensor ${pin.toUpperCase()}`,
                        dataType: 'generic',
                        type: 'SENSOR'
                    });
                    foundPins.push(newPin);
                    console.log(`      -> Saved to DB`);
                } else {
                    console.log(`      -> Already mapped (Skipping)`);
                }
            }
        } catch (e) {
            // Usually 400 error if pin is invalid, just ignore
            // console.log(`   ❌ ${pin}: No data or Error`);
        }
    }

    console.log(`🏁 SCAN COMPLETE. New Pins: ${foundPins.length}\n`);
    
    res.json({ 
        message: `Scan complete. Found ${foundPins.length} new sensors.`, 
        newPins: foundPins 
    });

  } catch (error) {
    console.error("🔥 SYSTEM ERROR:", error.message);
    res.status(500).json({ message: "Scan failed" });
  }
};
module.exports = {
  updateBlynkConfig,
  addPin,
  getPins,
  deletePin,
  getLiveData,
  controlDevice,
  getHistoricalData,
  discoverPins
};