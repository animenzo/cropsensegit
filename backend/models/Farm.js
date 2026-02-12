const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    // --- NEW FIELD: Link farm to a specific user ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Assuming your User model is named 'User'
    },
    // -----------------------------------------------
    name: {
        type: String,
        required: [true, 'Farm name is required'],
        trim: true
    },
    size_acres: {
        type: Number,
        required: [true, 'Farm size is required'],
        min: [0, 'Size must be positive']
    },
    location: {
        type: String,
        trim: true
    },
    current_crop: {
        type: String,
        required: [true, 'Current crop is required'],
        trim: true
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    tankDetails: {
        type: {
            type: String,
            enum: ['circle', 'rectangle'],
            trim: true
        },
        dimensions: {
            diameter: { type: Number, min: 0 },
            length: { type: Number, min: 0 },
            width: { type: Number, min: 0 }, // Added width for rectangle
            height: { type: Number, min: 0 }
        }
    },
    soilType: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    lastIrrigation: {
        type: Date,
        default: null
    },
    soilMoisture: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Farm', farmSchema);