import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        unique: true,
        minlength: [2, 'Item name must be at least 2 characters'],
        maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: ['kg', 'g', 'l', 'ml', 'pieces', 'boxes', 'packets']
    },
    supplier: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    minThreshold: {
        type: Number,
        default: 10,
        min: [0, 'Minimum threshold cannot be negative']
    }
}, {
    timestamps: true
});

// Update lastUpdated on save
inventorySchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;