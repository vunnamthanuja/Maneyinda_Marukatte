/* =====================================================================
   MANEYINDA MARUKATTE - PRODUCT CONTROLLER
   Full lifecycle product management: category filtering, full-text search,
   stock adjustments, custom fields, delivery & after-sales specs.
===================================================================== */

const db = require('../models/db');

const productController = {
  // GET /api/products
  getProducts(req, res) {
    const { category, entrepreneurId, status, search } = req.query || {};

    const filter = {
      activeOnly: status !== 'all',
      category: category && category !== 'All' ? category : null,
      entrepreneurId: entrepreneurId || null,
      search: search || null
    };

    const products = db.getProducts(filter);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  },

  // GET /api/products/:id
  getProductById(req, res) {
    const { id } = req.params;
    const product = db.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: `Product with ID '${id}' was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  },

  // POST /api/products
  createProduct(req, res) {
    const body = req.body || {};
    const { name, category, price, stock, entrepreneurId } = body;

    if (!name || !category || price === undefined || stock === undefined || !entrepreneurId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, category, price, stock, and entrepreneurId are required.'
      });
    }

    // Lookup entrepreneur to populate storeName
    const entrepreneur = db.getEntrepreneurById(entrepreneurId);
    const storeName = entrepreneur ? entrepreneur.businessName : 'Local Artisan';

    const newProduct = db.createProduct({
      entrepreneurId,
      storeName,
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      description: body.description || '',
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'
      ],
      attributes: Array.isArray(body.attributes) ? body.attributes : [],
      specifications: body.specifications || {},
      customizationFields: Array.isArray(body.customizationFields) ? body.customizationFields : [],
      deliveryMethod: body.deliveryMethod || {
        homeDelivery: true,
        pickup: true,
        deliveryRadius: 10,
        deliveryCharge: 30,
        estimatedDelivery: '1-2 Days'
      },
      afterSales: body.afterSales || {
        type: 'Return & Replacement',
        supportWindow: '3 Days',
        returnRequired: true
      },
      status: parseInt(stock, 10) > 0 ? 'active' : 'out_of_stock'
    });

    db.addActivityLog(`New product listed: "${newProduct.name}" by ${storeName}`);

    return res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product listed successfully.'
    });
  },

  // PUT /api/products/:id
  updateProduct(req, res) {
    const { id } = req.params;
    const existing = db.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: `Product with ID '${id}' was not found.`
      });
    }

    const updates = { ...req.body };
    // If stock updated, adjust status
    if (updates.stock !== undefined) {
      const stockNum = parseInt(updates.stock, 10);
      updates.stock = Math.max(0, stockNum);
      if (updates.stock === 0) updates.status = 'out_of_stock';
      else if (existing.status === 'out_of_stock') updates.status = 'active';
    }

    const updated = db.updateProduct(id, updates);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Product updated successfully.'
    });
  },

  // PATCH /api/products/:id/stock
  updateStock(req, res) {
    const { id } = req.params;
    const { stock } = req.body || {};

    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STOCK',
        message: 'A valid numeric stock value is required.'
      });
    }

    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: `Product with ID '${id}' was not found.`
      });
    }

    const newStock = Math.max(0, parseInt(stock, 10));
    const newStatus = newStock === 0 ? 'out_of_stock' : 'active';

    const updated = db.updateProduct(id, {
      stock: newStock,
      status: newStatus
    });

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Stock updated to ${newStock}.`
    });
  },

  // DELETE /api/products/:id
  deleteProduct(req, res) {
    const { id } = req.params;
    const deleted = db.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'PRODUCT_NOT_FOUND',
        message: `Product with ID '${id}' was not found.`
      });
    }

    db.addActivityLog(`Product removed: "${deleted.name}"`);

    return res.status(200).json({
      success: true,
      message: 'Product removed successfully.'
    });
  }
};

module.exports = productController;
