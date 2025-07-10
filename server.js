const express = require('express');
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

// Mock Data Storage
let users = [
    {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        _id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    },
    {
        _id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
    },
    {
        _id: '4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'user',
        isActive: false,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04')
    }
];

let products = [
    {
        _id: '1',
        name: 'Laptop',
        price: 999.99,
        description: 'High-performance laptop',
        category: 'Electronics',
        quantity: 15,
        inStock: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        _id: '2',
        name: 'Smartphone',
        price: 599.99,
        description: 'Latest smartphone',
        category: 'Electronics',
        quantity: 25,
        inStock: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    },
    {
        _id: '3',
        name: 'Book',
        price: 19.99,
        description: 'Programming book',
        category: 'Books',
        quantity: 0,
        inStock: false,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
    },
    {
        _id: '4',
        name: 'Headphones',
        price: 149.99,
        description: 'Wireless headphones',
        category: 'Electronics',
        quantity: 8,
        inStock: true,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04')
    },
    {
        _id: '5',
        name: 'Coffee Mug',
        price: 12.99,
        description: 'Ceramic coffee mug',
        category: 'Home',
        quantity: 50,
        inStock: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05')
    }
];

// ID counter for new items
let nextUserId = 5;
let nextProductId = 6;

// Utility function for async error handling
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper function to filter and paginate data
const filterAndPaginate = (data, query, searchFields) => {
    const { page = 1, limit = 10, search } = query;
    let filteredData = [...data];

    // Apply search filter
    if (search) {
        filteredData = filteredData.filter(item =>
            searchFields.some(field =>
                item[field] && item[field].toString().toLowerCase().includes(search.toLowerCase())
            )
        );
    }

    // Apply other filters
    Object.keys(query).forEach(key => {
        if (key !== 'page' && key !== 'limit' && key !== 'search') {
            if (query[key] === 'true') {
                filteredData = filteredData.filter(item => item[key] === true);
            } else if (query[key] === 'false') {
                filteredData = filteredData.filter(item => item[key] === false);
            } else if (query[key]) {
                filteredData = filteredData.filter(item => item[key] === query[key]);
            }
        }
    });

    // Sort by createdAt (newest first)
    filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
        currentPage: parseInt(page)
    };
};

// User Routes
app.get('/api/users', asyncHandler(async (req, res) => {
    const result = filterAndPaginate(users, req.query, ['name', 'email']);

    res.json({
        users: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        total: result.total
    });
}));

app.get('/api/users/:id', asyncHandler(async (req, res) => {
    const user = users.find(u => u._id === req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
}));

app.post('/api/users', asyncHandler(async (req, res) => {
    const { name, email, role } = req.body;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = {
        _id: nextUserId.toString(),
        name,
        email,
        role: role || 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    users.push(newUser);
    nextUserId++;
    res.status(201).json(newUser);
}));

app.put('/api/users/:id', asyncHandler(async (req, res) => {
    const { name, email, role, isActive } = req.body;
    const userIndex = users.findIndex(u => u._id === req.params.id);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = {
        ...users[userIndex],
        name: name || users[userIndex].name,
        email: email || users[userIndex].email,
        role: role || users[userIndex].role,
        isActive: isActive !== undefined ? isActive : users[userIndex].isActive,
        updatedAt: new Date()
    };

    users[userIndex] = updatedUser;
    res.json(updatedUser);
}));

app.delete('/api/users/:id', asyncHandler(async (req, res) => {
    const userIndex = users.findIndex(u => u._id === req.params.id);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
}));

// Product Routes
app.get('/api/products', asyncHandler(async (req, res) => {
    const result = filterAndPaginate(products, req.query, ['name', 'description']);

    res.json({
        products: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        total: result.total
    });
}));

app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const product = products.find(p => p._id === req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
}));

app.post('/api/products', asyncHandler(async (req, res) => {
    const { name, price, description, category, quantity } = req.body;

    const newProduct = {
        _id: nextProductId.toString(),
        name,
        price,
        description,
        category,
        quantity: quantity || 0,
        inStock: quantity > 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    products.push(newProduct);
    nextProductId++;
    res.status(201).json(newProduct);
}));

app.put('/api/products/:id', asyncHandler(async (req, res) => {
    const { name, price, description, category, quantity, inStock } = req.body;
    const productIndex = products.findIndex(p => p._id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = {
        ...products[productIndex],
        name: name || products[productIndex].name,
        price: price !== undefined ? price : products[productIndex].price,
        description: description || products[productIndex].description,
        category: category || products[productIndex].category,
        quantity: quantity !== undefined ? quantity : products[productIndex].quantity,
        inStock: quantity !== undefined ? quantity > 0 : products[productIndex].inStock,
        updatedAt: new Date()
    };

    products[productIndex] = updatedProduct;
    res.json(updatedProduct);
}));

app.delete('/api/products/:id', asyncHandler(async (req, res) => {
    const productIndex = products.findIndex(p => p._id === req.params.id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Product deleted successfully' });
}));

// Stats endpoint for dashboard
app.get('/api/stats', asyncHandler(async (req, res) => {
    const userCount = users.length;
    const productCount = products.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inStockProducts = products.filter(p => p.inStock).length;

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

// Reset data endpoint (replaces seed)
app.post('/api/reset', asyncHandler(async (req, res) => {
    // Reset to initial mock data
    users = [
        {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
        },
        {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            isActive: true,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02')
        },
        {
            _id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'user',
            isActive: true,
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03')
        },
        {
            _id: '4',
            name: 'Alice Brown',
            email: 'alice@example.com',
            role: 'user',
            isActive: false,
            createdAt: new Date('2024-01-04'),
            updatedAt: new Date('2024-01-04')
        }
    ];

    products = [
        {
            _id: '1',
            name: 'Laptop',
            price: 999.99,
            description: 'High-performance laptop',
            category: 'Electronics',
            quantity: 15,
            inStock: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
        },
        {
            _id: '2',
            name: 'Smartphone',
            price: 599.99,
            description: 'Latest smartphone',
            category: 'Electronics',
            quantity: 25,
            inStock: true,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02')
        },
        {
            _id: '3',
            name: 'Book',
            price: 19.99,
            description: 'Programming book',
            category: 'Books',
            quantity: 0,
            inStock: false,
            createdAt: new Date('2024-01-03'),
            updatedAt: new Date('2024-01-03')
        },
        {
            _id: '4',
            name: 'Headphones',
            price: 149.99,
            description: 'Wireless headphones',
            category: 'Electronics',
            quantity: 8,
            inStock: true,
            createdAt: new Date('2024-01-04'),
            updatedAt: new Date('2024-01-04')
        },
        {
            _id: '5',
            name: 'Coffee Mug',
            price: 12.99,
            description: 'Ceramic coffee mug',
            category: 'Home',
            quantity: 50,
            inStock: true,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-05')
        }
    ];

    nextUserId = 5;
    nextProductId = 6;

    res.json({ message: 'Data reset successfully', users: users.length, products: products.length });
}));

// CRUD API routes from your second example
const router = express.Router();

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/post
 **/
router.post('/post', (req, res) => {
    res.json({
        message: 'POST API for MERN Boilerplate',
    });
});

/**
 * @method GET
 * @access public
 * @endpoint /api/v1/get
 **/
router.get('/get', (req, res) => {
    res.json({
        message: 'GET API for MERN Boilerplate',
        APIs: 'Other Endpoints',
        create: '/api/v1/post',
        read: '/api/v1/get',
        update: '/api/v1/put/<ID>',
        delete: '/api/v1/delete/<ID>',
    });
});

/**
 * @method PUT
 * @access public
 * @endpoint /api/v1/put/32323
 **/
router.put('/put/:id', (req, res) => {
    res.json({
        message: `PUT ${req.params.id} API for MERN Boilerplate`,
    });
});

/**
 * @method DELETE
 * @access public
 * @endpoint /api/v1/delete/424
 **/
router.delete('/delete/:id', (req, res) => {
    res.json({
        message: `DELETE ${req.params.id} API for MERN Boilerplate`,
    });
});

// Mount the router
app.use('/api/v1', router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Using mock data instead of MongoDB');
});

module.exports = app;