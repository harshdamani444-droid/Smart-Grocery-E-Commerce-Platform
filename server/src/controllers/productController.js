import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get all products (with search & filters)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, sort, barcode } = req.query;

    const query = {};

    // Filter by barcode if requested (for instant scanning)
    if (barcode) {
      query.barcode = barcode;
    }

    // Filter by search keyword
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let productsQuery = Product.find(query);

    // Apply sorting
    if (sort === 'priceAsc') {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === 'priceDesc') {
      productsQuery = productsQuery.sort({ price: -1 });
    } else if (sort === 'rating') {
      productsQuery = productsQuery.sort({ rating: -1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 }); // Newest first
    }

    const products = await productsQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock, barcode, unit, storeAvailability, tags } = req.body;

    const product = new Product({
      name,
      price,
      description,
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      category,
      stock,
      barcode,
      unit,
      storeAvailability: storeAvailability || [
        { storeName: 'DMart Powai', stock: Math.floor(stock * 0.4), lat: 19.1176, lng: 72.9060 },
        { storeName: 'DMart Malad', stock: Math.floor(stock * 0.3), lat: 19.1860, lng: 72.8485 },
        { storeName: 'DMart Thane', stock: Math.floor(stock * 0.3), lat: 19.2183, lng: 72.9781 }
      ],
      tags: tags || [category.toLowerCase(), name.toLowerCase()]
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock, barcode, unit, storeAvailability, tags } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.barcode = barcode || product.barcode;
      product.unit = unit || product.unit;
      product.tags = tags || product.tags;
      if (storeAvailability) {
        product.storeAvailability = storeAvailability;
      }

      const updatedProduct = await product.save();

      // Trigger socket event for real-time inventory updates if stock changed
      if (req.app.get('io')) {
        req.app.get('io').emit('stock_update', {
          productId: product._id,
          newStock: updatedProduct.stock
        });
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id
      };

      product.reviews.push(review);
      product.calculateRating();

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI product recommendations
// @route   GET /api/products/recommendations
// @access  Private/Optional (returns fallback popular items if unauthenticated)
export const getRecommendations = async (req, res) => {
  try {
    let userCartCategories = [];
    let userOrderCategories = [];

    // If request contains authorization header, check user preferences
    if (req.user) {
      // 1. Get user cart categories
      if (req.user.cart && req.user.cart.length > 0) {
        const cartProductIds = req.user.cart.map(item => item.product);
        const cartProducts = await Product.find({ _id: { $in: cartProductIds } });
        userCartCategories = cartProducts.map(p => p.category);
      }

      // 2. Get user order history categories
      const orders = await Order.find({ user: req.user._id });
      if (orders && orders.length > 0) {
        const orderedItemIds = orders.flatMap(o => o.orderItems.map(item => item.product));
        const orderedProducts = await Product.find({ _id: { $in: orderedItemIds } });
        userOrderCategories = orderedProducts.map(p => p.category);
      }
    }

    // Merge categories of interest
    const preferredCategories = [...new Set([...userCartCategories, ...userOrderCategories])];

    let recommendations = [];

    if (preferredCategories.length > 0) {
      // Fetch highly-rated items in categories user is interested in
      recommendations = await Product.find({
        category: { $in: preferredCategories },
        rating: { $gte: 3.5 }
      }).limit(8);
    }

    // If we have fewer than 6 items, fill in with overall popular / high-rated items
    if (recommendations.length < 6) {
      const needed = 8 - recommendations.length;
      const alreadyPulledIds = recommendations.map(p => p._id);

      const popularItems = await Product.find({
        _id: { $nin: alreadyPulledIds }
      })
      .sort({ rating: -1, numReviews: -1 })
      .limit(needed);

      recommendations = [...recommendations, ...popularItems];
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
