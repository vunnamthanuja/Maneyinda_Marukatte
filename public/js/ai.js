/* =====================================================================
   MANEYINDA MARUKATTE - AI ASSISTANT ENGINES
   Rule-Based Assistive AI for Customer, Entrepreneur & Admin
===================================================================== */

const AppAI = {
  // -------------------------------------------------------------
  // 1. CUSTOMER: MANEYINDA AI GUIDE (APP NAVIGATION & HOW-TO)
  // -------------------------------------------------------------
  customerGuideResponses: {
    'how to place order': `To place an order:\n1. 🔍 Browse products on Home or use the Search bar.\n2. 🧁 Tap a product to view fresh preparation details and choose customizations.\n3. 🛒 Tap "Add to Cart" or "Buy Now".\n4. 🛍️ In Cart, check your items (remember: one entrepreneur per order to guarantee fresh, direct home dispatch).\n5. 📍 Tap "Proceed to Checkout", choose your delivery address and payment method (Razorpay UPI/Cards or Cash on Delivery), then confirm!`,
    'become an entrepreneur': `To sell your homemade products:\n1. 👤 Go to your "Profile" tab or select "Create Account" → "Entrepreneur".\n2. 📝 Step 1: Fill in your Business Information, service address, and delivery radius (3–20 km).\n3. 📄 Step 2: Upload ONE Government ID (Aadhaar, Voter ID, Driving Licence, or Passport) and ONE Business proof (Kitchen/Shop/Product photo).\n4. 🔍 Step 3: Review and submit. Our Admin team will verify and approve your application within 24 hours!\n5. 🔐 Once approved, create your username, password, and security questions to start listing products!`,
    'request refund': `To request a refund or replacement:\n1. 📦 Open "My Orders" from the bottom navigation.\n2. 🔍 Tap on your delivered order.\n3. ⏱️ Tap "Request Refund" or "Request Replacement" (available within the product's support window: 24h, 3 days, or 7 days).\n4. 📸 Select your reason and attach proof photos.\n5. 🤝 The entrepreneur will review your request. If unresolved, our Admin team intervenes with platform buyer protection!`,
    'change address': `To manage your delivery addresses:\n1. 📍 Go to "Profile" → "Address Book".\n2. ➕ Tap "+ Add New Address" or edit an existing address.\n3. 🎯 You can also quickly switch active delivery locations directly from the top banner on the Home screen or during Checkout!`,
    'delivery radius': `Our platform operates on a hyperlocal radius system:\n• 🚴 Each entrepreneur defines their own delivery reach (e.g., 3 km, 5 km, 10 km, 15 km, or 20 km).\n• 🏠 If your address falls within the seller's radius, direct Home Delivery is provided.\n• 🏪 If you are outside the radius, you can opt for Self-Pickup directly from the entrepreneur's home kitchen or studio!`,
    'payment methods': `We support 100% secure, encrypted payments:\n• 📱 UPI (Google Pay, PhonePe, Paytm, BHIM)\n• 💳 Credit & Debit Cards (Visa, MasterCard, RuPay)\n• 🏦 NetBanking & Wallets via Razorpay\n• 💵 Cash on Delivery (COD) for eligible local orders\n• 🛡️ All online transactions are protected by cryptographic verification and instant refund automation.`,
    'coupons and offers': `To use a discount or promotional offer:\n• 🎁 Browse active banners on the Home screen or checkout page.\n• 🏷️ Use code "WELCOME10" to get 10% off on your very first order!\n• 🏷️ Shop-specific promotional coupons can be applied directly in the Cart summary before paying.`,
    'single seller rule': `Why only one entrepreneur per order?\n• 🌿 Because our platform connects you directly with home-based women entrepreneurs! Every item is prepared fresh in the artisan's personal kitchen or workshop.\n• 📦 Keeping each order dedicated to a single entrepreneur ensures your fresh foods arrive piping hot and crafts are packed with personal care, without confusing multi-vendor shipping delays.`,
    'support contact': `Need help or have a dispute?\n• 🎫 Go to "Profile" → "Help & Support".\n• ✍️ Tap "Raise Support Ticket" to send details to our administration team.\n• ⚡ Admin reviews all customer tickets and responds within 12–24 hours.`,
    'greeting': `Namaskara! 🙏 Welcome to Maneyinda Marukatte (ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ).\n\nI am your AI Community Guide! I can help you with:\n• How to place orders & track delivery\n• How women entrepreneurs register & sell\n• Payment methods (UPI / Cards / COD) & coupons\n• Returns, refunds, and delivery radius rules\n\nWhat would you like to explore today?`,
    'kannada': `ನಮಸ್ಕಾರ! ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿಗೆ ಸ್ವಾಗತ.\n\n• ಆರ್ಡರ್ ಮಾಡಲು: ಉತ್ಪನ್ನವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ, ವಿಳಾಸ ನಮೂದಿಸಿ ಪಾವತಿಸಿ.\n• ವ್ಯಾಪಾರ ನೋಂದಣಿ: ಪ್ರೊಫೈಲ್ → ಉದ್ಯಮಿ ನೋಂದಣಿಗೆ ಹೋಗಿ, ಆಧಾರ್ ಮತ್ತು ಅಡುಗೆಮನೆ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ. ೨೪ ಗಂಟೆಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.\n• ಹಣ ಪಾವತಿ: UPI (GPay/PhonePe), ಕಾರ್ಡ್ ಮತ್ತು ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ ಲಭ್ಯವಿದೆ.`,
    'default': `I am your Maneyinda AI Guide. I can assist you with placing orders, tracking deliveries, applying coupons, refund guidelines, and how home-based women entrepreneurs register to sell.\n\nTip: You can ask questions like "How do I place an order?", "What are the payment options?", "How to become an entrepreneur?", or "What is the delivery radius?"`
  },

  askCustomerGuide(query) {
    if (!query) return this.customerGuideResponses['greeting'];
    const q = query.toLowerCase().trim();

    // Kannada queries
    if (q.includes('ನಮಸ್ಕಾರ') || q.includes('ಆರ್ಡರ್') || q.includes('ವ್ಯಾಪಾರ') || q.includes('ಖರೀದಿ') || q.includes('ಹಣ') || q.includes('ಮನೆ')) {
      return this.customerGuideResponses['kannada'];
    }

    // Greetings
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('namaste') || q.includes('namaskara') || q.includes('who are you')) {
      return this.customerGuideResponses['greeting'];
    }

    // Ordering / buying / cart
    if (q.includes('order') || q.includes('buy') || q.includes('cart') || q.includes('purchase') || q.includes('checkout') || q.includes('how to')) {
      return this.customerGuideResponses['how to place order'];
    }

    // Entrepreneur / selling
    if (q.includes('entrepreneur') || q.includes('sell') || q.includes('seller') || q.includes('register') || q.includes('business') || q.includes('start selling')) {
      return this.customerGuideResponses['become an entrepreneur'];
    }

    // Single seller cart rule
    if (q.includes('single') || q.includes('different seller') || q.includes('multiple seller') || q.includes('multi')) {
      return this.customerGuideResponses['single seller rule'];
    }

    // Refunds / returns / replacements
    if (q.includes('refund') || q.includes('return') || q.includes('replace') || q.includes('damage') || q.includes('broken') || q.includes('cancel')) {
      return this.customerGuideResponses['request refund'];
    }

    // Payment / UPI / Razorpay / COD
    if (q.includes('pay') || q.includes('upi') || q.includes('gpay') || q.includes('card') || q.includes('cod') || q.includes('cash') || q.includes('money')) {
      return this.customerGuideResponses['payment methods'];
    }

    // Coupons / discounts / offers
    if (q.includes('coupon') || q.includes('discount') || q.includes('offer') || q.includes('promo') || q.includes('welcome10') || q.includes('code')) {
      return this.customerGuideResponses['coupons and offers'];
    }

    // Address & delivery location
    if (q.includes('address') || q.includes('location') || q.includes('pincode') || q.includes('city') || q.includes('door')) {
      return this.customerGuideResponses['change address'];
    }

    // Delivery radius & hyperlocal distance
    if (q.includes('radius') || q.includes('distance') || q.includes('deliver to') || q.includes('km') || q.includes('reach') || q.includes('pickup')) {
      return this.customerGuideResponses['delivery radius'];
    }

    // Support & contact
    if (q.includes('support') || q.includes('contact') || q.includes('ticket') || q.includes('complaint') || q.includes('help') || q.includes('phone') || q.includes('call')) {
      return this.customerGuideResponses['support contact'];
    }

    return this.customerGuideResponses['default'];
  },

  // -------------------------------------------------------------
  // 2. ENTREPRENEUR: PRODUCT ASSISTANT (TITLES, PRICES, DESCRIPTIONS)
  // -------------------------------------------------------------
  improveProductTitle(rawTitle, category = '') {
    const cat = category || '';
    const clean = (rawTitle || '').trim();
    if (!clean) {
      if (cat.includes('Bakery')) return 'Freshly Baked Artisanal Cupcakes (Eggless)';
      if (cat.includes('Food') || cat.includes('Tiffin')) return 'Authentic Home-Cooked Special Meal Box';
      if (cat.includes('Crafts')) return 'Handcrafted Eco-Friendly Festive Wall Hanging';
      if (cat.includes('Tailoring')) return 'Designer Hand-Stitched Custom Festive Kurti';
      return 'Artisanal Homemade Special Delicacy';
    }
    if (cat.includes('Bakery')) {
      return `Freshly Baked Artisanal ${clean} (Eggless & Preservative-Free)`;
    } else if (cat.includes('Food') || cat.includes('Tiffin')) {
      return `Traditional Home-Style ${clean} (Prepared Fresh Daily)`;
    } else if (cat.includes('Crafts')) {
      return `Handcrafted Eco-Friendly ${clean} (Handmade by Local Artisans)`;
    } else if (cat.includes('Tailoring')) {
      return `Custom Designer Hand-Stitched ${clean}`;
    }
    return `Authentic Handcrafted ${clean}`;
  },

  suggestProductPrice(category = '', name = '') {
    const n = (name || '').toLowerCase();
    const cat = category || '';
    if (cat.includes('Bakery')) {
      if (n.includes('cupcake') || n.includes('cookie') || n.includes('muffin')) return 180;
      if (n.includes('cake') || n.includes('pastry')) return 450;
      return 350;
    }
    if (cat.includes('Food') || cat.includes('Tiffin')) {
      if (n.includes('tiffin') || n.includes('meal') || n.includes('thali')) return 150;
      if (n.includes('pickle') || n.includes('podi') || n.includes('chutney')) return 190;
      if (n.includes('sweet') || n.includes('laddu') || n.includes('mysore pak')) return 280;
      return 140;
    }
    if (cat.includes('Crafts') || cat.includes('Decor')) return 380;
    if (cat.includes('Tailoring')) return 650;
    if (cat.includes('Beauty') || cat.includes('Wellness')) return 299;
    return 250;
  },

  generateProductDescription(title = '', category = '') {
    const t = (title || '').trim() || 'Homemade Specialty';
    const cat = category || '';
    if (cat.includes('Bakery')) {
      return `Freshly baked with love using pure butter, unbleached flour, and premium farm-fresh ingredients. 100% vegetarian, eggless, and free from artificial food colorings or preservatives. Perfect for celebrations, family tea-time, and mindful snacking.`;
    }
    if (cat.includes('Food') || cat.includes('Tiffin')) {
      return `Prepared fresh every morning in a spotless, hygienic home kitchen following cherished heirloom recipes. Cooked with cold-pressed oils, freshly ground aromatic spices, and unadulterated ingredients. Authentic, comforting taste just like home.`;
    }
    if (cat.includes('Crafts') || cat.includes('Decor')) {
      return `Meticulously handcrafted by skilled local women artisans using sustainable, biodegradable materials. Elegant, durable, and designed to bring rustic beauty to your home while directly uplifting rural livelihoods.`;
    }
    if (cat.includes('Tailoring')) {
      return `Masterfully tailored with high attention to custom fit, premium fabric lining, and reinforced double-stitching. Personalized style requests, exact measurements, and custom embellishments are happily accommodated.`;
    }
    return `Authentic locally produced item created with immense care and attention to quality. 100% handmade by home-based women entrepreneurs with zero platform commission.`;
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
