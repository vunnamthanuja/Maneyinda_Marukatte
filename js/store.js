/* =====================================================================
   MANEYINDA MARUKATTE - CENTRAL DATA STORE & PERSISTENCE
   Persistent LocalStorage Store for Customer, Entrepreneur & Admin
===================================================================== */

const STORAGE_KEY = 'MANEYINDA_DATA_V2';

const defaultSeedData = {
  currentRole: 'customer', // 'customer' | 'entrepreneur' | 'admin'
  currentUser: {
    id: 'cust_01',
    name: 'Thanuja Gowda',
    email: 'thanuja@example.com',
    phone: '9845123456',
    role: 'both', // 'customer' | 'entrepreneur' | 'both'
    entrepreneurId: 'ent_01',
    selectedAddressId: 'addr_01',
    savedAddresses: [
      {
        id: 'addr_01',
        label: 'Home',
        door: '#12, MG Road',
        street: '8th Cross, Malleshwaram',
        area: 'Malleshwaram',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560003',
        isDefault: true
      },
      {
        id: 'addr_02',
        label: 'Hostel',
        door: 'Room 204, Ganga Hostel',
        street: 'IISc Campus Road',
        area: 'Yeshwanthpur',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560012',
        isDefault: false
      },
      {
        id: 'addr_03',
        label: 'Office',
        door: 'Unit 402, ABC Tech Park',
        street: 'Outer Ring Road',
        area: 'Hebbal',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560024',
        isDefault: false
      }
    ],
    wishlist: ['prod_01', 'prod_02'],
    cart: [
      {
        productId: 'prod_01',
        qty: 2,
        customization: { 'Cake Message': 'Happy Birthday Thanuja!' },
        entrepreneurId: 'ent_01'
      },
      {
        productId: 'prod_04',
        qty: 1,
        customization: {},
        entrepreneurId: 'ent_01'
      }
    ]
  },

  // Categories managed by Admin
  categories: [
    { id: 'cat_01', name: 'Bakery & Sweets', active: true, icon: 'cake' },
    { id: 'cat_02', name: 'Food & Tiffin', active: true, icon: 'restaurant' },
    { id: 'cat_03', name: 'Tailoring & Alterations', active: true, icon: 'styler' },
    { id: 'cat_04', name: 'Handmade Crafts', active: true, icon: 'palette' },
    { id: 'cat_05', name: 'Home Decor', active: true, icon: 'chair' },
    { id: 'cat_06', name: 'Beauty & Wellness', active: true, icon: 'spa' }
  ],

  // Entrepreneurs
  entrepreneurs: [
    {
      id: 'ent_01',
      name: 'Anitha Ramesh',
      businessName: "Anita's Bakery",
      businessCategory: 'Bakery & Sweets',
      email: 'anitha@bakery.com',
      phone: '9845011223',
      username: 'anitha_bakery',
      password: 'password123',
      address: {
        door: '#45',
        street: 'Temple Road',
        area: 'Malleshwaram',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560003'
      },
      deliveryRadius: 10,
      yearsExp: 4,
      about: 'Fresh, 100% homemade eggless cakes and traditional Karnataka sweets made with pure ghee and no preservatives.',
      status: 'approved', // 'approved' | 'pending' | 'rejected'
      rejectionReason: '',
      badge: 'Rising Star', // 'Best Entrepreneur' | 'Rising Star' | 'Top Rated' | 'Verified'
      isStoreOpen: true,
      openingSchedule: 'Opens Daily at 9:00 AM - Closes 8:00 PM',
      rating: 4.8,
      reviewCount: 185,
      completedOrdersCount: 245,
      positiveReviewsCount: 220,
      negativeReviewsCount: 10,
      complaintsCount: 0,
      paymentSettings: {
        accountHolder: 'Anitha Ramesh',
        bankName: 'State Bank of India',
        accountNumber: '38192847192',
        ifsc: 'SBIN0004128',
        upiId: 'anithabakery@okaxis'
      },
      notificationPreferences: {
        orders: true,
        reviews: true,
        account: true
      },
      securityQuestions: [
        { q: 'What is your school name?', a: 'Malleshwaram High' },
        { q: 'What is your village name?', a: 'Mandya' },
        { q: 'What is your favourite food?', a: 'Mysore Pak' }
      ]
    },
    {
      id: 'ent_02',
      name: 'Lakshmi Devi',
      businessName: 'Lakshmi Crafts',
      businessCategory: 'Handmade Crafts',
      email: 'lakshmi@crafts.com',
      phone: '9845022334',
      username: 'lakshmi_crafts',
      password: 'password123',
      address: {
        door: '#18',
        street: 'Pottery Road',
        area: 'Frazer Town',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560005'
      },
      deliveryRadius: 15,
      yearsExp: 6,
      about: 'Handcrafted jute bags, banana fibre runners, and terracotta artifacts crafted by local women artisans.',
      status: 'approved',
      rejectionReason: '',
      badge: 'Top Rated',
      isStoreOpen: true,
      openingSchedule: 'Opens Daily at 10:00 AM',
      rating: 4.6,
      reviewCount: 98,
      completedOrdersCount: 140,
      positiveReviewsCount: 92,
      negativeReviewsCount: 4,
      complaintsCount: 1,
      paymentSettings: {
        accountHolder: 'Lakshmi Devi',
        bankName: 'Canara Bank',
        accountNumber: '10293847561',
        ifsc: 'CNRB0001045',
        upiId: 'lakshmicrafts@upi'
      },
      notificationPreferences: { orders: true, reviews: true, account: true },
      securityQuestions: [
        { q: 'What is your school name?', a: 'St Ann Convent' },
        { q: 'Who is your favourite teacher?', a: 'Shanthala Maam' },
        { q: 'What is your favourite food?', a: 'Bisi Bele Bath' }
      ]
    },
    {
      id: 'ent_03',
      name: 'Priya Sharma',
      businessName: 'Priya Home Foods',
      businessCategory: 'Food & Tiffin',
      email: 'priya@foods.com',
      phone: '9845033445',
      username: 'priya_foods',
      password: 'password123',
      address: {
        door: '#7',
        street: 'Subbarama Chetty Road',
        area: 'Basavanagudi',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560004'
      },
      deliveryRadius: 5,
      yearsExp: 3,
      about: 'Authentic South Indian Brahmin style meals, preservative-free pickles, and fresh breakfast idli/dosa batter.',
      status: 'approved',
      rejectionReason: '',
      badge: 'Best Entrepreneur',
      isStoreOpen: true,
      openingSchedule: 'Opens Daily at 7:30 AM',
      rating: 4.7,
      reviewCount: 82,
      completedOrdersCount: 180,
      positiveReviewsCount: 78,
      negativeReviewsCount: 3,
      complaintsCount: 2,
      paymentSettings: {
        accountHolder: 'Priya Sharma',
        bankName: 'Bank of Baroda',
        accountNumber: '56123478901',
        ifsc: 'BARB0BASAVA',
        upiId: 'priyafoods@okicici'
      },
      notificationPreferences: { orders: true, reviews: true, account: true },
      securityQuestions: [
        { q: 'What is your village name?', a: 'Udupi' },
        { q: 'Who is your favourite teacher?', a: 'Narasimha Rao' },
        { q: 'What is your favourite food?', a: 'Rava Idli' }
      ]
    },
    {
      id: 'ent_04',
      name: 'Savitha Gowda',
      businessName: 'Savitha Designer Tailors',
      businessCategory: 'Tailoring & Alterations',
      email: 'savitha@tailors.com',
      phone: '9845044556',
      username: 'savitha_tailor',
      password: 'password123',
      address: {
        door: '#92',
        street: 'Pipeline Road',
        area: 'Vijayanagar',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560040'
      },
      deliveryRadius: 10,
      yearsExp: 8,
      about: 'Custom blouse designing, maggam embroidery, and bridal wear stitching with express 48hr delivery.',
      status: 'pending', // Pending review for admin queue demo!
      rejectionReason: '',
      badge: '',
      isStoreOpen: true,
      openingSchedule: 'Opens Daily at 10:00 AM',
      rating: 4.9,
      reviewCount: 45,
      completedOrdersCount: 60,
      positiveReviewsCount: 45,
      negativeReviewsCount: 0,
      complaintsCount: 0,
      appliedDate: '24 Oct 2026',
      documents: {
        idType: 'Aadhaar Card',
        idFile: 'aadhaar_savitha_verified.pdf',
        businessProof: 'Boutique_Kitchen_Photo.jpg'
      }
    }
  ],

  // Products
  products: [
    {
      id: 'prod_01',
      entrepreneurId: 'ent_01',
      storeName: "Anita's Bakery",
      name: 'Homemade Dutch Chocolate Cake (Eggless)',
      category: 'Bakery & Sweets',
      price: 450,
      stock: 8,
      description: 'Fresh homemade chocolate cake prepared with premium cocoa and pure butter. Melt-in-the-mouth texture, 100% vegetarian & eggless.',
      images: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80'
      ],
      attributes: ['Eggless', 'Freshly Baked', 'No Preservatives'],
      specifications: {
        Weight: '1 Kg',
        Sweetness: 'Medium',
        Egg: '100% Eggless',
        'Shelf Life': '3 Days'
      },
      customizationFields: [
        { name: 'Cake Message', type: 'text', placeholder: 'e.g. Happy Birthday!', required: false },
        { name: 'Sweetness Level', type: 'select', options: ['Low Sweetness', 'Regular', 'Extra Sweet'], required: true }
      ],
      deliveryMethod: {
        homeDelivery: true,
        pickup: true,
        deliveryRadius: 10,
        deliveryCharge: 30,
        freeDelivery: false,
        estimatedDelivery: 'Today before 5:30 PM'
      },
      afterSales: {
        type: 'Return & Replacement', // 'Not Available' | 'Replacement Only' | 'Return & Replacement'
        supportWindow: '3 Days',
        returnRequired: true,
        instructions: 'Please take a photo and keep the cake chilled if requesting replacement.'
      },
      additionalInfo: 'Keep refrigerated. Consume within 48 hours for best flavour.',
      status: 'active', // 'active' | 'hidden' | 'removed'
      rating: 4.8,
      reviewCount: 235,
      views: 780,
      ordersCount: 240,
      reportsCount: 0
    },
    {
      id: 'prod_02',
      entrepreneurId: 'ent_02',
      storeName: 'Lakshmi Crafts',
      name: 'Handcrafted Eco-Friendly Jute Tote Bag',
      category: 'Handmade Crafts',
      price: 350,
      stock: 14,
      description: 'Durable, stylish hand-stitched jute tote bag crafted by rural women artisans. Features brass rivets, cotton inner lining, and sturdy zipper.',
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80'
      ],
      attributes: ['Eco-Friendly', 'Handmade', 'Natural Fibre'],
      specifications: {
        Material: 'Natural Golden Jute',
        Dimensions: '15 x 14 x 5 inches',
        Closure: 'Zipper',
        Handle: 'Braided Cotton'
      },
      customizationFields: [
        { name: 'Embroidery Initial', type: 'text', placeholder: 'Letter A-Z (Optional)', required: false },
        { name: 'Strap Color', type: 'select', options: ['Natural Beige', 'Forest Green', 'Rust Orange'], required: true }
      ],
      deliveryMethod: {
        homeDelivery: true,
        pickup: true,
        deliveryRadius: 15,
        deliveryCharge: 40,
        freeDelivery: false,
        estimatedDelivery: 'Tomorrow by 4:00 PM'
      },
      afterSales: {
        type: 'Replacement Only',
        supportWindow: '7 Days',
        returnRequired: false,
        instructions: 'Upload a picture of any stitch flaw or zipper damage.'
      },
      additionalInfo: 'Spot clean with damp cloth. Do not soak.',
      status: 'active',
      rating: 4.6,
      reviewCount: 98,
      views: 420,
      ordersCount: 98,
      reportsCount: 0
    },
    {
      id: 'prod_03',
      entrepreneurId: 'ent_03',
      storeName: 'Priya Home Foods',
      name: 'Home Style South Indian Meals Tiffin',
      category: 'Food & Tiffin',
      price: 160,
      stock: 20,
      description: 'Hot, hygienic home-cooked meal packed in eco-friendly foil containers: Steamed Rice, Sambar, Rasam, Palya (Poriyal), Curd, Papad & Pickle.',
      images: [
        'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
      ],
      attributes: ['Fresh Daily', 'Traditional Recipe', 'No Palm Oil'],
      specifications: {
        Serves: '1 Person',
        MealType: 'Pure Vegetarian',
        Packaging: 'Leakproof Hot-Pack',
        Included: 'Rice, Sambar, Rasam, Sabzi, Curd'
      },
      customizationFields: [
        { name: 'Spice Level', type: 'select', options: ['Mild', 'Medium', 'Spicy'], required: true },
        { name: 'Rice Preference', type: 'select', options: ['Sona Masoori', 'Brown Rice (+₹20)'], required: true }
      ],
      deliveryMethod: {
        homeDelivery: true,
        pickup: true,
        deliveryRadius: 5,
        deliveryCharge: 20,
        freeDelivery: false,
        estimatedDelivery: 'Today 1:00 PM - 2:00 PM'
      },
      afterSales: {
        type: 'Replacement Only',
        supportWindow: '24 Hours',
        returnRequired: false,
        instructions: 'Report any temperature or spill issue immediately upon receipt.'
      },
      additionalInfo: 'Cooked fresh at 11:30 AM every morning in small batches.',
      status: 'active',
      rating: 4.7,
      reviewCount: 145,
      views: 650,
      ordersCount: 180,
      reportsCount: 0
    },
    {
      id: 'prod_04',
      entrepreneurId: 'ent_01',
      storeName: "Anita's Bakery",
      name: 'Assorted Gourmet Cupcakes (Box of 4)',
      category: 'Bakery & Sweets',
      price: 240,
      stock: 12,
      description: 'Four freshly baked soft sponge cupcakes with silky buttercream swirls: 2 Vanilla Velvet and 2 Dark Cocoa.',
      images: [
        'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&auto=format&fit=crop&q=80'
      ],
      attributes: ['Eggless', 'Soft Centered'],
      specifications: {
        Quantity: '4 Pieces',
        Flavours: 'Vanilla & Chocolate',
        'Shelf Life': '2 Days'
      },
      customizationFields: [],
      deliveryMethod: {
        homeDelivery: true,
        pickup: true,
        deliveryRadius: 10,
        deliveryCharge: 30,
        freeDelivery: false,
        estimatedDelivery: 'Today before 5:30 PM'
      },
      afterSales: {
        type: 'Return & Replacement',
        supportWindow: '24 Hours',
        returnRequired: true,
        instructions: 'Inspect upon delivery.'
      },
      additionalInfo: 'Hand-packed in food-safe craft boxes.',
      status: 'active',
      rating: 4.9,
      reviewCount: 65,
      views: 310,
      ordersCount: 85,
      reportsCount: 0
    },
    {
      id: 'prod_05',
      entrepreneurId: 'ent_03',
      storeName: 'Priya Home Foods',
      name: 'Authentic Avakkai Mango Pickle (500g Jar)',
      category: 'Food & Tiffin',
      price: 190,
      stock: 25,
      description: 'Traditional home-made raw mango pickle seasoned with cold-pressed sesame oil, freshly ground mustard, and Guntur chili powder.',
      images: [
        'https://images.unsplash.com/photo-1589135233689-d56d68b8159b?w=600&auto=format&fit=crop&q=80'
      ],
      attributes: ['Handcrafted', 'Cold Pressed Oil'],
      specifications: {
        Weight: '500 Grams',
        Oil: 'Pure Sesame Gingelly Oil',
        'Shelf Life': '9 Months'
      },
      customizationFields: [],
      deliveryMethod: {
        homeDelivery: true,
        pickup: true,
        deliveryRadius: 10,
        deliveryCharge: 30,
        freeDelivery: false,
        estimatedDelivery: 'Today before 6:00 PM'
      },
      afterSales: {
        type: 'Replacement Only',
        supportWindow: '7 Days',
        returnRequired: false,
        instructions: 'Report if safety seal or jar is damaged.'
      },
      additionalInfo: 'Use dry spoon always. Stays aromatic and fresh naturally.',
      status: 'active',
      rating: 4.8,
      reviewCount: 112,
      views: 480,
      ordersCount: 140,
      reportsCount: 0
    }
  ],

  // Orders
  orders: [
    {
      id: 'ORD-12345',
      customerId: 'cust_01',
      customerName: 'Thanuja Gowda',
      customerPhone: '9845123456',
      entrepreneurId: 'ent_01',
      storeName: "Anita's Bakery",
      date: '25 Oct 2026',
      items: [
        {
          productId: 'prod_01',
          name: 'Homemade Dutch Chocolate Cake (Eggless)',
          price: 450,
          qty: 1,
          customization: { 'Cake Message': 'Happy Birthday Anita!', 'Sweetness Level': 'Regular' },
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
          afterSales: {
            type: 'Return & Replacement',
            supportWindow: '3 Days',
            returnRequired: true
          }
        }
      ],
      subtotal: 450,
      deliveryCharge: 30,
      grandTotal: 480,
      deliveryMethod: 'Home Delivery',
      deliveryAddress: {
        label: 'Home',
        door: '#12, MG Road',
        street: '8th Cross, Malleshwaram',
        area: 'Malleshwaram',
        city: 'Bangalore',
        pincode: '560003'
      },
      orderNote: 'Please keep extra napkins if possible, thank you!',
      paymentMethod: 'Online Payment',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered', // 'New' | 'Accepted' | 'Preparing' | 'Out for Delivery' | 'Ready for Pickup' | 'Delivered' | 'Cancelled'
      expectedDelivery: 'Today before 5:30 PM',
      deliveredDate: '25 Oct 2026',
      supportWindowExpiresDate: '28 Oct 2026',
      reviewSubmitted: true,
      refundRequest: null,
      replacementRequest: null
    },
    {
      id: 'ORD-12346',
      customerId: 'cust_01',
      customerName: 'Thanuja Gowda',
      customerPhone: '9845123456',
      entrepreneurId: 'ent_01',
      storeName: "Anita's Bakery",
      date: '25 Oct 2026',
      items: [
        {
          productId: 'prod_04',
          name: 'Assorted Gourmet Cupcakes (Box of 4)',
          price: 240,
          qty: 2,
          customization: {},
          image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=600&auto=format&fit=crop&q=80',
          afterSales: {
            type: 'Return & Replacement',
            supportWindow: '24 Hours',
            returnRequired: true
          }
        }
      ],
      subtotal: 480,
      deliveryCharge: 30,
      grandTotal: 510,
      deliveryMethod: 'Home Delivery',
      deliveryAddress: {
        label: 'Home',
        door: '#12, MG Road',
        street: '8th Cross, Malleshwaram',
        area: 'Malleshwaram',
        city: 'Bangalore',
        pincode: '560003'
      },
      orderNote: '',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Preparing', // Active in progress
      expectedDelivery: 'Today before 6:30 PM',
      deliveredDate: null,
      reviewSubmitted: false,
      refundRequest: null,
      replacementRequest: null
    }
  ],

  // Verified Reviews
  reviews: [
    {
      id: 'rev_01',
      orderId: 'ORD-12345',
      productId: 'prod_01',
      customerId: 'cust_01',
      customerName: 'Thanuja Gowda',
      rating: 5,
      qualityRating: 5,
      deliveryRating: 5,
      comment: 'Absolutely heavenly chocolate cake! Soft, moist, and not overly sweet. Delivered right on time in pristine packaging.',
      date: '25 Oct 2026',
      photos: []
    },
    {
      id: 'rev_02',
      orderId: 'ORD-12100',
      productId: 'prod_01',
      customerId: 'cust_02',
      customerName: 'Ravi Kumar',
      rating: 5,
      qualityRating: 5,
      deliveryRating: 4,
      comment: 'Ordered for our anniversary. The personalized cake message was written with so much care. Everyone in our family loved it!',
      date: '23 Oct 2026',
      photos: []
    },
    {
      id: 'rev_03',
      orderId: 'ORD-12050',
      productId: 'prod_02',
      customerId: 'cust_03',
      customerName: 'Deepa Hegde',
      rating: 4,
      qualityRating: 5,
      deliveryRating: 4,
      comment: 'Very sturdy jute bag. Love that it supports local women weavers. Would appreciate longer strap options next time!',
      date: '21 Oct 2026',
      photos: []
    }
  ],

  // Notifications
  notifications: [
    {
      id: 'notif_01',
      userId: 'cust_01',
      role: 'customer',
      title: 'Order Delivered',
      message: 'Your order #ORD-12345 from Anita\'s Bakery has been delivered. Enjoy!',
      type: 'order',
      targetScreen: 'order_details',
      targetId: 'ORD-12345',
      timeGroup: 'Today',
      timeFormatted: '10:30 AM • Today',
      isRead: false
    },
    {
      id: 'notif_02',
      userId: 'cust_01',
      role: 'customer',
      title: 'Preparing Order',
      message: 'Anita\'s Bakery is now preparing your fresh Cupcakes (#ORD-12346).',
      type: 'order',
      targetScreen: 'order_details',
      targetId: 'ORD-12346',
      timeGroup: 'Today',
      timeFormatted: '11:45 AM • Today',
      isRead: false
    },
    {
      id: 'notif_03',
      userId: 'cust_01',
      role: 'customer',
      title: 'How was your order?',
      message: 'How was your order from Anita\'s Bakery? Tap to rate and review.',
      type: 'review_reminder',
      targetScreen: 'rate_review',
      targetId: 'ORD-12345',
      timeGroup: 'Yesterday',
      timeFormatted: 'Yesterday • 4:15 PM',
      isRead: true
    }
  ],

  // Support Tickets
  supportTickets: [
    {
      id: 'SUP-1023',
      customerId: 'cust_01',
      customerName: 'Thanuja Gowda',
      customerPhone: '9845123456',
      issueType: 'Payment Issue',
      description: 'Double debit occurred during UPI checkout on an earlier attempt. Bank reference UTR is 4098129381.',
      status: 'Open', // 'Open' | 'In Progress' | 'Resolved' | 'Closed'
      adminNotes: 'Verified with payment gateway logs. Refund batch initiated to user bank.',
      date: '24 Oct 2026'
    },
    {
      id: 'SUP-1024',
      customerId: 'cust_02',
      customerName: 'Ravi Kumar',
      customerPhone: '9845987654',
      issueType: 'Refund Appeal',
      description: 'Dispute regarding damaged container during transit. Entrepreneur rejected replacement request.',
      status: 'In Progress',
      adminNotes: 'Investigating courier notes and entrepreneur dispatch photos.',
      date: '23 Oct 2026'
    }
  ],

  // Admin Activity Logs (Read-only audit trail)
  activityLogs: [
    { id: 'act_01', text: 'Approved Anita Bakery verification application', time: 'Today • 9:15 AM' },
    { id: 'act_02', text: 'Assigned "Rising Star" badge to Anita\'s Bakery', time: 'Today • 9:30 AM' },
    { id: 'act_03', text: 'Resolved Support Ticket #SUP-1020 (Account Phone Update)', time: 'Yesterday • 4:20 PM' },
    { id: 'act_04', text: 'Added new Category "Beauty & Wellness" to platform', time: '22 Oct 2026' }
  ],

  // Reported Products Queue (Admin Moderation)
  reportedProducts: [
    {
      productId: 'prod_03',
      productName: 'Home Style South Indian Meals Tiffin',
      storeName: 'Priya Home Foods',
      reportsCount: 1,
      reason: 'Wrong delivery radius stated on card',
      status: 'reported', // 'reported' | 'hidden' | 'removed' | 'dismissed'
      adminActionReason: ''
    }
  ],

  // Recent Searches
  recentSearches: ['Chocolate Cake', 'Pickles', 'Tailoring', 'Jute Bags']
};

class AppStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load localStorage data', e);
    }
    this.saveData(defaultSeedData);
    return JSON.parse(JSON.stringify(defaultSeedData));
  }

  saveData(customData = null) {
    if (customData) this.data = customData;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }

  resetToSeed() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = JSON.parse(JSON.stringify(defaultSeedData));
    this.saveData();
    window.location.reload();
  }

  // Role management
  getRole() {
    return this.data.currentRole || 'customer';
  }

  setRole(role) {
    this.data.currentRole = role;
    this.saveData();
  }

  getUser() {
    return this.data.currentUser;
  }

  updateUser(updates) {
    this.data.currentUser = { ...this.data.currentUser, ...updates };
    this.saveData();
  }

  // Address book
  getAddresses() {
    return this.data.currentUser.savedAddresses || [];
  }

  getSelectedAddress() {
    const list = this.getAddresses();
    return list.find(a => a.id === this.data.currentUser.selectedAddressId) || list[0] || null;
  }

  setSelectedAddress(id) {
    this.data.currentUser.selectedAddressId = id;
    this.saveData();
  }

  addAddress(address) {
    const newId = 'addr_' + Date.now();
    const newAddr = { ...address, id: newId, isDefault: this.data.currentUser.savedAddresses.length === 0 };
    this.data.currentUser.savedAddresses.push(newAddr);
    this.data.currentUser.selectedAddressId = newId;
    this.saveData();
    return newAddr;
  }

  updateAddress(id, updates) {
    const idx = this.data.currentUser.savedAddresses.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.currentUser.savedAddresses[idx] = { ...this.data.currentUser.savedAddresses[idx], ...updates };
      this.saveData();
    }
  }

  deleteAddress(id) {
    this.data.currentUser.savedAddresses = this.data.currentUser.savedAddresses.filter(a => a.id !== id);
    if (this.data.currentUser.selectedAddressId === id && this.data.currentUser.savedAddresses.length > 0) {
      this.data.currentUser.selectedAddressId = this.data.currentUser.savedAddresses[0].id;
    }
    this.saveData();
  }

  // Wishlist
  getWishlist() {
    return this.data.currentUser.wishlist || [];
  }

  isInWishlist(productId) {
    return (this.data.currentUser.wishlist || []).includes(productId);
  }

  toggleWishlist(productId) {
    let list = this.data.currentUser.wishlist || [];
    const exists = list.includes(productId);
    if (exists) {
      list = list.filter(id => id !== productId);
    } else {
      list.push(productId);
    }
    this.data.currentUser.wishlist = list;
    this.saveData();
    return !exists;
  }

  // Cart Management
  getCart() {
    return this.data.currentUser.cart || [];
  }

  addToCart(productId, qty = 1, customization = {}) {
    const product = this.getProductById(productId);
    if (!product) return { success: false, message: 'Product not found' };

    let cart = this.getCart();
    
    // Check if item already exists with matching customization
    const existingIndex = cart.findIndex(item => 
      item.productId === productId && 
      JSON.stringify(item.customization || {}) === JSON.stringify(customization || {})
    );

    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        productId,
        qty,
        customization,
        entrepreneurId: product.entrepreneurId
      });
    }

    this.data.currentUser.cart = cart;
    this.saveData();
    return { success: true, cartCount: this.getCartCount() };
  }

  updateCartQty(productId, newQty, customization = {}) {
    let cart = this.getCart();
    const index = cart.findIndex(item => 
      item.productId === productId && 
      JSON.stringify(item.customization || {}) === JSON.stringify(customization || {})
    );

    if (index > -1) {
      if (newQty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].qty = newQty;
      }
      this.data.currentUser.cart = cart;
      this.saveData();
    }
  }

  removeFromCart(productId, customization = {}) {
    let cart = this.getCart();
    cart = cart.filter(item => 
      !(item.productId === productId && 
        JSON.stringify(item.customization || {}) === JSON.stringify(customization || {}))
    );
    this.data.currentUser.cart = cart;
    this.saveData();
  }

  getCartCount() {
    return (this.data.currentUser.cart || []).reduce((acc, item) => acc + item.qty, 0);
  }

  // Products
  getProducts(filter = {}) {
    let prods = this.data.products || [];
    if (filter.activeOnly) {
      prods = prods.filter(p => p.status === 'active');
    }
    if (filter.category) {
      prods = prods.filter(p => p.category === filter.category);
    }
    if (filter.entrepreneurId) {
      prods = prods.filter(p => p.entrepreneurId === filter.entrepreneurId);
    }
    return prods;
  }

  getProductById(id) {
    return (this.data.products || []).find(p => p.id === id);
  }

  addProduct(product) {
    const newProd = {
      ...product,
      id: 'prod_' + Date.now(),
      views: 0,
      ordersCount: 0,
      rating: 5.0,
      reviewCount: 0,
      status: 'active'
    };
    this.data.products.push(newProd);
    this.saveData();
    return newProd;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates };
      this.saveData();
      return this.data.products[idx];
    }
    return null;
  }

  deleteProduct(id) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.saveData();
  }

  // Entrepreneurs
  getEntrepreneurs() {
    return this.data.entrepreneurs || [];
  }

  getEntrepreneurById(id) {
    return (this.data.entrepreneurs || []).find(e => e.id === id);
  }

  updateEntrepreneur(id, updates) {
    const idx = this.data.entrepreneurs.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.entrepreneurs[idx] = { ...this.data.entrepreneurs[idx], ...updates };
      this.saveData();
      return this.data.entrepreneurs[idx];
    }
    return null;
  }

  // Orders
  getOrders(filter = {}) {
    let orders = this.data.orders || [];
    if (filter.customerId) {
      orders = orders.filter(o => o.customerId === filter.customerId);
    }
    if (filter.entrepreneurId) {
      orders = orders.filter(o => o.entrepreneurId === filter.entrepreneurId);
    }
    if (filter.status) {
      orders = orders.filter(o => o.orderStatus.toLowerCase() === filter.status.toLowerCase());
    }
    return orders;
  }

  getOrderById(id) {
    return (this.data.orders || []).find(o => o.id === id);
  }

  createOrder(orderData) {
    const newOrder = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      orderStatus: 'New',
      reviewSubmitted: false,
      refundRequest: null,
      replacementRequest: null,
      ...orderData
    };
    this.data.orders.unshift(newOrder);

    // Remove ordered items from cart
    const purchasedIds = newOrder.items.map(i => i.productId);
    this.data.currentUser.cart = this.data.currentUser.cart.filter(c => !purchasedIds.includes(c.productId));

    // Deduct stock
    newOrder.items.forEach(item => {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.qty);
        prod.ordersCount = (prod.ordersCount || 0) + item.qty;
      }
    });

    // Notify entrepreneur
    this.addNotification({
      userId: newOrder.entrepreneurId,
      role: 'entrepreneur',
      title: 'New Order Received',
      message: `You received a new order ${newOrder.id} from ${newOrder.customerName} (₹${newOrder.grandTotal}).`,
      type: 'order',
      targetScreen: 'orders',
      targetId: newOrder.id
    });

    this.saveData();
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.getOrderById(orderId);
    if (!order) return;

    order.orderStatus = newStatus;
    if (newStatus === 'Delivered') {
      order.deliveredDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      // Calculate support window expiration (e.g. 3 days)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 3);
      order.supportWindowExpiresDate = expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      
      // Send Review Reminder
      this.addNotification({
        userId: order.customerId,
        role: 'customer',
        title: 'How was your order?',
        message: `How was your order from ${order.storeName}? Write a review.`,
        type: 'review_reminder',
        targetScreen: 'rate_review',
        targetId: order.id
      });
    }

    // Customer Notification
    let msg = `Your order ${order.id} status is now: ${newStatus}`;
    if (newStatus === 'Accepted') msg = 'Your order has been confirmed.';
    if (newStatus === 'Preparing') msg = 'Your order is now being prepared.';
    if (newStatus === 'Out for Delivery') msg = 'Your order is out for delivery.';
    if (newStatus === 'Ready for Pickup') msg = 'Your order is ready for pickup.';
    if (newStatus === 'Delivered') msg = 'Your order has been delivered.';
    if (newStatus === 'Cancelled') msg = 'Your order has been cancelled.';

    this.addNotification({
      userId: order.customerId,
      role: 'customer',
      title: 'Order Update',
      message: msg,
      type: 'order',
      targetScreen: 'order_details',
      targetId: order.id
    });

    this.saveData();
    return order;
  }

  // Reviews
  getReviewsForProduct(productId) {
    return (this.data.reviews || []).filter(r => r.productId === productId);
  }

  getReviewsForEntrepreneur(entrepreneurId) {
    const prods = this.getProducts({ entrepreneurId }).map(p => p.id);
    return (this.data.reviews || []).filter(r => prods.includes(r.productId));
  }

  addReview(reviewData) {
    const newRev = {
      id: 'rev_' + Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      photos: [],
      ...reviewData
    };
    this.data.reviews.unshift(newRev);

    // Mark order as reviewed
    const order = this.getOrderById(reviewData.orderId);
    if (order) order.reviewSubmitted = true;

    // Recalculate product rating
    const prodReviews = this.getReviewsForProduct(reviewData.productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    // Notify entrepreneur
    if (order) {
      this.addNotification({
        userId: order.entrepreneurId,
        role: 'entrepreneur',
        title: 'New Customer Review',
        message: `${newRev.customerName} left a ${newRev.rating}-star review on "${prod ? prod.name : 'your product'}".`,
        type: 'review',
        targetScreen: 'reviews',
        targetId: newRev.id
      });
    }

    this.saveData();
    return newRev;
  }

  deleteReview(reviewId) {
    const rev = (this.data.reviews || []).find(r => r.id === reviewId);
    if (rev) {
      const prodId = rev.productId;
      this.data.reviews = this.data.reviews.filter(r => r.id !== reviewId);
      
      // Update order
      const order = this.getOrderById(rev.orderId);
      if (order) order.reviewSubmitted = false;

      // Recalculate
      const prodReviews = this.getReviewsForProduct(prodId);
      const prod = this.getProductById(prodId);
      if (prod) {
        prod.reviewCount = prodReviews.length;
        prod.rating = prodReviews.length > 0 
          ? parseFloat((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1))
          : 5.0;
      }
      this.saveData();
    }
  }

  // Notifications
  getNotifications(userId, role) {
    return (this.data.notifications || []).filter(n => n.role === role);
  }

  getUnreadNotificationsCount(userId, role) {
    return this.getNotifications(userId, role).filter(n => !n.isRead).length;
  }

  addNotification(notif) {
    const newNotif = {
      id: 'notif_' + Date.now(),
      isRead: false,
      timeGroup: 'Today',
      timeFormatted: 'Just now',
      ...notif
    };
    this.data.notifications.unshift(newNotif);
    this.saveData();
    return newNotif;
  }

  markNotificationRead(id) {
    const n = (this.data.notifications || []).find(notif => notif.id === id);
    if (n) {
      n.isRead = true;
      this.saveData();
    }
  }

  deleteNotification(id) {
    this.data.notifications = (this.data.notifications || []).filter(n => n.id !== id);
    this.saveData();
  }

  clearAllNotifications(role) {
    this.data.notifications = (this.data.notifications || []).filter(n => n.role !== role);
    this.saveData();
  }

  // Support Tickets
  getSupportTickets(customerId = null) {
    if (customerId) {
      return (this.data.supportTickets || []).filter(t => t.customerId === customerId);
    }
    return this.data.supportTickets || [];
  }

  createSupportTicket(ticketData) {
    const newTicket = {
      id: 'SUP-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Open',
      adminNotes: '',
      ...ticketData
    };
    this.data.supportTickets.unshift(newTicket);
    this.saveData();
    return newTicket;
  }

  updateTicketStatus(ticketId, status, adminNotes = '') {
    const t = (this.data.supportTickets || []).find(ticket => ticket.id === ticketId);
    if (t) {
      t.status = status;
      if (adminNotes) t.adminNotes = adminNotes;
      this.saveData();
    }
  }

  // Admin Activity Log
  addActivityLog(text) {
    const log = {
      id: 'act_' + Date.now(),
      text,
      time: 'Just now'
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 50) {
      this.data.activityLogs.pop();
    }
    this.saveData();
  }

  getActivityLogs() {
    return this.data.activityLogs || [];
  }
}

// Global Store Instance
const store = new AppStore();
