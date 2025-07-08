const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/redux-learning', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    quantity: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// Utility function for async error handling
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// User Routes
app.get('/api/users', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    });
}));

app.get('/api/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
}));

app.post('/api/users', asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({ name, email, role });
    await user.save();
    res.status(201).json(user);
}));

app.put('/api/users/:id', asyncHandler(async (req, res) => {
    const { name, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role, isActive, updatedAt: Date.now() },
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
}));

app.delete('/api/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
}));

// Product Routes
app.get('/api/products', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, search, inStock } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    if (inStock !== undefined) query.inStock = inStock === 'true';

    const products = await Product.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
    });
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
}));

app.post('/api/products', asyncHandler(async (req, res) => {
    const { name, price, description, category, quantity } = req.body;

    const product = new Product({
        name,
        price,
        description,
        category,
        quantity,
        inStock: quantity > 0
    });

    await product.save();
    res.status(201).json(product);
}));

app.put('/api/products/:id', asyncHandler(async (req, res) => {
    const { name, price, description, category, quantity, inStock } = req.body;

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name,
            price,
            description,
            category,
            quantity,
            inStock: quantity > 0,
            updatedAt: Date.now()
        },
        { new: true, runValidators: true }
    );

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
}));

app.delete('/api/products/:id', asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
}));

// Stats endpoint for dashboard
app.get('/api/stats', asyncHandler(async (req, res) => {
    const [userCount, productCount, activeUsers, inStockProducts] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        User.countDocuments({ isActive: true }),
        Product.countDocuments({ inStock: true })
    ]);

    res.json({
        users: {
            total: userCount,
            active: activeUsers
        },
        products: {
            total: productCount,
            inStock: inStockProducts
        }
    });
}));

// Seed data endpoint (for development)
app.post('/api/seed', asyncHandler(async (req, res) => {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Seed users
    const users = await User.insertMany([
        { name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        { name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
        { name: 'Alice Brown', email: 'alice@example.com', role: 'user', isActive: false }
    ]);

    // Seed products
    const products = await Product.insertMany([
        { name: 'Laptop', price: 999.99, description: 'High-performance laptop', category: 'Electronics', quantity: 15 },
        { name: 'Smartphone', price: 599.99, description: 'Latest smartphone', category: 'Electronics', quantity: 25 },
        { name: 'Book', price: 19.99, description: 'Programming book', category: 'Books', quantity: 0 },
        { name: 'Headphones', price: 149.99, description: 'Wireless headphones', category: 'Electronics', quantity: 8 },
        { name: 'Coffee Mug', price: 12.99, description: 'Ceramic coffee mug', category: 'Home', quantity: 50 }
    ]);

    res.json({ message: 'Database seeded successfully', users: users.length, products: products.length });
}));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

module.exports = app;