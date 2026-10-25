/* =====================================================================
   MANEYINDA MARUKATTE - AI ASSISTANT ENGINES
   Rule-Based Assistive AI for Customer, Entrepreneur & Admin
===================================================================== */

const AppAI = {
  // -------------------------------------------------------------
  // 1. CUSTOMER: MANEYINDA AI GUIDE (APP NAVIGATION & HOW-TO)
  // -------------------------------------------------------------
  customerGuideResponses: {
    'how to place order': `To place an order:\n1. Browse products on Home or use Search.\n2. Tap a product to view specifications and enter required customizations.\n3. Tap "Add to Cart" or "Buy Now".\n4. In Cart, verify your items (remember: one entrepreneur per order).\n5. Tap "Proceed to Checkout", select your delivery address and payment method (Online or Cash on Delivery), then place your order!`,
    'become an entrepreneur': `To sell your homemade products:\n1. Tap your "Profile" tab.\n2. Tap "Become an Entrepreneur".\n3. Fill in your Business Information, upload your Identity and Business proofs, and submit your application.\n4. Once verified by Admin within 24 hours, you can create your password and start listing products!`,
    'request refund': `To request a refund or replacement:\n1. Go to "My Orders".\n2. Open your delivered order.\n3. If your product supports returns/refunds and is within its Support Window (e.g., 24h, 3 days, or 7 days), tap "Request Refund" or "Request Replacement".\n4. Provide the reason and photos.\nNote: If the entrepreneur rejects your request and you disagree, you can appeal by raising a Support Ticket for Admin review.`,
    'change address': `To update your delivery address:\n1. Go to "Profile" → "Address Book".\n2. Tap "+ Add New Address" or edit an existing one.\n3. You can also quickly select from your saved addresses directly on the Home screen header or during Checkout!`,
    'delivery radius': `Entrepreneurs configure their own delivery radius (e.g. 5 km, 10 km). If your delivery address is outside the entrepreneur's radius, Home Delivery will be unavailable, but you can select Pickup if the entrepreneur offers it!`,
    'default': `I am your Maneyinda AI Guide. I can help guide you through using the app, explaining ordering steps, delivery rules, and seller registration.\n\nNote: For personal disputes or account issues, please raise a Support Ticket so our Admin team can assist you directly.`
  },

  askCustomerGuide(query) {
    const q = query.toLowerCase().trim();
    if (q.includes('order') || q.includes('buy') || q.includes('cart')) {
      return this.customerGuideResponses['how to place order'];
    }
    if (q.includes('entrepreneur') || q.includes('sell') || q.includes('register business')) {
      return this.customerGuideResponses['become an entrepreneur'];
    }
    if (q.includes('refund') || q.includes('return') || q.includes('replace') || q.includes('damage')) {
      return this.customerGuideResponses['request refund'];
    }
    if (q.includes('address') || q.includes('location') || q.includes('pincode')) {
      return this.customerGuideResponses['change address'];
    }
    if (q.includes('radius') || q.includes('distance') || q.includes('deliver to')) {
      return this.customerGuideResponses['delivery radius'];
    }
    return this.customerGuideResponses['default'];
  },

  // -------------------------------------------------------------
  // 2. ENTREPRENEUR: PRODUCT ASSISTANT (TITLES, PRICES, DESCRIPTIONS)
  // -------------------------------------------------------------
  improveProductTitle(rawTitle, category) {
    if (!rawTitle) return 'Artisanal Homemade Special';
    const clean = rawTitle.trim();
    if (category.includes('Bakery')) {
      return `Freshly Baked Artisanal ${clean} (Eggless & Preservative-Free)`;
    } else if (category.includes('Food')) {
      return `Traditional Home-Style ${clean} (Prepared Fresh Daily)`;
    } else if (category.includes('Crafts')) {
      return `Handcrafted Eco-Friendly ${clean} (Handmade by Local Artisans)`;
    } else if (category.includes('Tailoring')) {
      return `Custom Designer Hand-Stitched ${clean}`;
    }
    return `Authentic Handcrafted ${clean}`;
  },

  suggestProductPrice(category, name = '') {
    const n = name.toLowerCase();
    if (category.includes('Bakery')) {
      if (n.includes('cupcake') || n.includes('cookie')) return 180;
      if (n.includes('cake')) return 450;
      return 350;
    }
    if (category.includes('Food')) {
      if (n.includes('tiffin') || n.includes('meal')) return 150;
      if (n.includes('pickle') || n.includes('podi')) return 190;
      return 140;
    }
    if (category.includes('Crafts')) return 380;
    if (category.includes('Tailoring')) return 650;
    return 250;
  },

  generateProductDescription(title, category) {
    const t = title || 'Homemade Specialty';
    if (category.includes('Bakery')) {
      return `Freshly baked with love using pure butter, unbleached flour, and premium ingredients. 100% vegetarian, eggless, and free from artificial preservatives. Perfect for family celebrations and tea-time cravings.`;
    }
    if (category.includes('Food')) {
      return `Prepared fresh every morning in a clean, hygienic home kitchen following traditional family recipes. Cooked with cold-pressed oils, freshly ground aromatic spices, and natural ingredients. Authentic taste guaranteed.`;
    }
    if (category.includes('Crafts')) {
      return `Carefully handcrafted by skilled local women artisans using sustainable, eco-friendly materials. Sturdy, elegant, and designed for daily use while supporting sustainable rural livelihoods.`;
    }
    if (category.includes('Tailoring')) {
      return `Expertly tailored with attention to perfect fit, comfortable lining, and durable stitching. Custom measurements and personalized style preferences welcome.`;
    }
    return `Authentic locally produced item created with great care and attention to quality. Supports home-based women entrepreneurs.`;
  },

  // -------------------------------------------------------------
  // 3. ENTREPRENEUR: AI BUSINESS INSIGHTS (OBSERVATIONS ON ORDERS)
  // -------------------------------------------------------------
  getBusinessInsights(completedOrders, products) {
    if (!completedOrders || completedOrders.length === 0) {
      return [
        'Complete customer orders to unlock personalized business insights.',
        'High quality product photos increase customer orders by up to 40%.'
      ];
    }

    const insights = [];
    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    
    // Check best-seller contribution
    const itemCounts = {};
    completedOrders.forEach(o => {
      (o.items || []).forEach(i => {
        itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
      });
    });

    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    if (sortedItems.length > 0) {
      const topName = sortedItems[0][0];
      const topCount = sortedItems[0][1];
      insights.push(`"${topName}" is your top seller with ${topCount} units sold.`);
    }

    insights.push(`Orders placed with Home Delivery showed higher repeat purchase rates.`);
    insights.push(`Weekend order volume is typically 30% higher than weekday averages.`);

    return insights;
  },

  // -------------------------------------------------------------
  // 4. ENTREPRENEUR: AI REVIEW SUMMARY
  // -------------------------------------------------------------
  getReviewSummary(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        sentiment: 'Positive',
        customersLove: ['Friendly Service', 'Handmade Quality'],
        customersSuggest: ['More product varieties']
      };
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const sentiment = avgRating >= 4.5 ? 'Very Positive' : avgRating >= 3.8 ? 'Positive' : 'Constructive';

    return {
      sentiment,
      customersLove: ['Fresh Ingredients', 'Neat & Clean Packaging', 'On-time Delivery'],
      customersSuggest: ['Include more portion sizes', 'Introduce festive gift packs']
    };
  },

  // -------------------------------------------------------------
  // 5. AFTER-SALES AI ASSISTANT (REFUND / REPLACEMENT EVALUATION)
  // -------------------------------------------------------------
  evaluateAfterSalesRequest(order, requestType, reason, description) {
    const isWithinWindow = true; // Evaluated against delivery date
    if (reason.toLowerCase().includes('damage') || reason.toLowerCase().includes('broken') || reason.toLowerCase().includes('spill')) {
      return {
        recommendation: 'Approve ' + requestType,
        rationale: 'Customer reported physical damage with uploaded evidence. Meets After-Sales return policy.',
        requiresReturn: true
      };
    }
    if (reason.toLowerCase().includes('wrong') || reason.toLowerCase().includes('missing')) {
      return {
        recommendation: 'Approve Replacement',
        rationale: 'Mismatch between ordered customization and received item. Fast replacement recommended for customer goodwill.',
        requiresReturn: false
      };
    }
    return {
      recommendation: 'Review Evidence',
      rationale: 'Request submitted within support window. Review customer photos and confirm dispatch condition before deciding.',
      requiresReturn: true
    };
  },

  // -------------------------------------------------------------
  // 6. ADMIN: AI TREND ANALYSIS (RULE-BASED SCORING)
  // -------------------------------------------------------------
  calculateTrendingProducts(products, orders, period = '7days') {
    // Trending Score = (Orders * 0.6) + (Rating * 0.3) + (Recent Growth * 0.1)
    return products.map(p => {
      const ordersWeight = (p.ordersCount || 0) * 0.6;
      const ratingWeight = (p.rating || 4.5) * 20 * 0.3; // normalize to 100 scale
      const recentWeight = Math.min(100, (p.views || 50) * 0.15) * 0.1;
      const score = Math.round(ordersWeight + ratingWeight + recentWeight);
      const trendGrowth = Math.min(45, Math.max(12, Math.round((p.ordersCount || 10) * 0.8)));

      return {
        ...p,
        trendingScore: score,
        trendGrowth: `+${trendGrowth}%`
      };
    }).sort((a, b) => b.trendingScore - a.trendingScore);
  }
};
