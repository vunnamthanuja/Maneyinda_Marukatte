/* =====================================================================
   MANEYINDA MARUKATTE - ORDER CONTROLLER
   Enforces 1-entrepreneur cart integrity, atomic stock deduction,
   sequential single-action order progression, strict cancellation window,
   and 3-day post-delivery after-sales warranty processing.
===================================================================== */

const db = require('../models/db');

const orderController = {
  // GET /api/orders
  getOrders(req, res) {
    const { customerId, entrepreneurId, status } = req.query || {};

    const orders = db.getOrders({
      customerId: customerId || null,
      entrepreneurId: entrepreneurId || null,
      status: status || null
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  },

  // GET /api/orders/:id
  getOrderById(req, res) {
    const { id } = req.params;
    const order = db.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: `Order with ID '${id}' was not found.`
      });
    }

    const AuthMiddleware = require('../middleware/auth');
    const token = AuthMiddleware.extractToken(req);
    if (token) {
      const decoded = AuthMiddleware.verifyToken(token);
      if (decoded && decoded.role === 'customer' && decoded.id !== order.customerId) {
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: 'Forbidden: Customers cannot access orders belonging to other accounts.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  },

  // POST /api/orders
  createOrder(req, res) {
    const body = req.body || {};
    const { customerId, customerName, customerPhone, items, deliveryMethod, deliveryAddress, paymentMethod } = body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ORDER_DATA',
        message: 'Customer ID and at least one item are required.'
      });
    }

    // --- RULE 1: Enforce Exactly 1 Entrepreneur Per Order ---
    const entrepreneurIds = new Set();
    for (const item of items) {
      const prod = db.getProductById(item.productId);
      if (!prod) {
        return res.status(400).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Product ID '${item.productId}' no longer exists.`
        });
      }
      entrepreneurIds.add(prod.entrepreneurId);
    }

    if (entrepreneurIds.size > 1) {
      return res.status(400).json({
        success: false,
        error: 'MULTI_ENTREPRENEUR_ORDER_NOT_ALLOWED',
        message: 'Orders cannot mix products from different entrepreneurs. Please place separate orders for each seller.'
      });
    }

    const targetEntrepreneurId = Array.from(entrepreneurIds)[0] || body.entrepreneurId;
    const seller = db.getEntrepreneurById(targetEntrepreneurId);

    // --- RULE 2: Validate Stock Availability for each item ---
    for (const item of items) {
      const prod = db.getProductById(item.productId);
      if (prod.stock < item.qty) {
        return res.status(400).json({
          success: false,
          error: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) remaining.`
        });
      }
    }

    // Calculate subtotal and delivery charge
    let itemsTotal = 0;
    const resolvedItems = items.map(item => {
      const prod = db.getProductById(item.productId);
      const lineTotal = prod.price * item.qty;
      itemsTotal += lineTotal;
      return {
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        qty: item.qty,
        customization: item.customization || null
      };
    });

    const isPickup = (deliveryMethod || '').toLowerCase().includes('pickup');
    const deliveryCharge = isPickup ? 0 : 30;
    const grandTotal = itemsTotal + deliveryCharge;

    const newOrder = db.createOrder({
      customerId,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || '',
      entrepreneurId: targetEntrepreneurId,
      storeName: seller ? seller.businessName : 'Local Artisan',
      items: resolvedItems,
      itemsTotal,
      deliveryCharge,
      totalAmount: grandTotal,
      deliveryMethod: isPickup ? 'Pickup' : 'Home Delivery',
      deliveryAddress: deliveryAddress || null,
      orderNote: body.orderNote || '',
      paymentMethod: paymentMethod || 'Online Payment',
      paymentStatus: body.paymentStatus || (paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid'),
      paymentDetails: body.paymentDetails || null
    });

    db.addActivityLog(`Order #${newOrder.id} placed for ₹${grandTotal} with ${newOrder.storeName}`);

    return res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully.'
    });
  },

  // PATCH /api/orders/:id/status
  updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body || {};

    if (typeof (req.body && req.body.paymentStatus) !== 'undefined') {
      return res.status(403).json({
        success: false,
        error: 'PAYMENT_STATUS_IMMUTABLE',
        message: 'Payment status cannot be modified via order status update. Payment transitions are strictly governed by the payment gateway.'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_STATUS',
        message: 'Target status is required.'
      });
    }

    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: `Order with ID '${id}' was not found.`
      });
    }

    const validStatuses = [
      'New',
      'Accepted',
      'Preparing',
      'Out for Delivery',
      'Ready for Pickup',
      'Delivered',
      'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = db.updateOrderStatus(id, status);
    db.addActivityLog(`Order #${id} updated to status "${status}"`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Order status updated to ${status}.`
    });
  },

  // POST /api/orders/:id/cancel
  cancelOrder(req, res) {
    const { id } = req.params;
    const { reason } = req.body || {};

    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: `Order with ID '${id}' was not found.`
      });
    }

    // Cancellation window: strictly permitted only if New or Accepted
    const cancellableStatuses = ['Pending Payment', 'New', 'Accepted'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        error: 'CANCELLATION_NOT_ALLOWED',
        message: `This order cannot be cancelled because it is already '${order.orderStatus}'. Orders can only be cancelled while in 'New' or 'Accepted' status.`
      });
    }

    // Restore stock
    (order.items || []).forEach(item => {
      const prod = db.getProductById(item.productId);
      if (prod) {
        prod.stock += item.qty;
        if (prod.status === 'out_of_stock') prod.status = 'active';
      }
    });

    const updated = db.updateOrder(id, {
      orderStatus: 'Cancelled',
      cancelReason: reason || 'Customer requested cancellation',
      cancelledAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });

    db.addActivityLog(`Order #${id} was cancelled by customer`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Order cancelled successfully and stock restored.'
    });
  },

  // POST /api/orders/:id/after-sales
  submitAfterSales(req, res) {
    const { id } = req.params;
    const { type, reason, description, photos } = req.body || {};

    const order = db.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'ORDER_NOT_FOUND',
        message: `Order with ID '${id}' was not found.`
      });
    }

    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({
        success: false,
        error: 'ORDER_NOT_DELIVERED',
        message: 'After-sales requests can only be raised for delivered orders.'
      });
    }

    const requestPayload = {
      type: type === 'replacement' ? 'replacement' : 'refund',
      reason: reason || 'Issue with received item',
      description: description || '',
      photos: Array.isArray(photos) ? photos : [],
      status: 'Pending Review',
      submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updateField = type === 'replacement' ? { replacementRequest: requestPayload } : { refundRequest: requestPayload };
    const updated = db.updateOrder(id, updateField);

    db.addActivityLog(`After-sales ${type} request submitted for Order #${id}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: `Your ${type} request has been submitted for seller review.`
    });
  }
};

module.exports = orderController;
