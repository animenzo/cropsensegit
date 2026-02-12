const Farm = require('../models/Farm');

// @desc    Create a new farm
// @route   POST /api/farms
// @access  Private
const createFarm = async (req, res) => {
    try {
        // 1. Get data from frontend form
        const { 
            name, size_acres, location, current_crop, 
            coordinates, tankDetails, soilType, pincode 
        } = req.body;

        if (!name || !size_acres || !current_crop) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // 2. Create the farm and link it to the logged-in user (req.user.id)
        const farm = await Farm.create({
            user: req.user.id, // This comes from your Auth Middleware
            name,
            size_acres,
            location,
            current_crop,
            coordinates,
            tankDetails,
            soilType,
            pincode
        });

        res.status(201).json(farm);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all farms for the logged-in user
// @route   GET /api/farms
// @access  Private
const getMyFarms = async (req, res) => {
    try {
        // Find farms where the 'user' field matches the logged-in user's ID
        const farms = await Farm.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(farms);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get a single farm by ID
// @route   GET /api/farms/:id
// @access  Private
const getFarmById = async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);

        if (!farm) {
            return res.status(404).json({ message: 'Farm not found' });
        }

        // Security Check: Ensure the user accessing the farm actually owns it
        if (farm.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.status(200).json(farm);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update farm details
// @route   PUT /api/farms/:id
// @access  Private
const updateFarm = async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);

        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        // Check user ownership
        if (farm.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedFarm = await Farm.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return the updated object
        );

        res.status(200).json(updatedFarm);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a farm
// @route   DELETE /api/farms/:id
// @access  Private
const deleteFarm = async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.id);

        if (!farm) return res.status(404).json({ message: 'Farm not found' });

        // Check user ownership
        if (farm.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await farm.deleteOne();

        res.status(200).json({ id: req.params.id, message: 'Farm removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createFarm,
    getMyFarms,
    getFarmById,
    updateFarm,
    deleteFarm
};