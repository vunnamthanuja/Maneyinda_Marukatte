/* =====================================================================
   MANEYINDA MARUKATTE - ENTREPRENEUR CONTROLLER
   Manages onboarding registrations, document verification submission,
   business availability schedules, store status, and payout profiles.
===================================================================== */

const db = require('../models/db');

const entrepreneurController = {
  // GET /api/entrepreneurs
  getEntrepreneurs(req, res) {
    const { status } = req.query || {};
    const list = db.getEntrepreneurs(status || null);

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  },

  // GET /api/entrepreneurs/:id
  getEntrepreneurById(req, res) {
    const { id } = req.params;
    const entrepreneur = db.getEntrepreneurById(id);

    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        error: 'ENTREPRENEUR_NOT_FOUND',
        message: `Entrepreneur with ID '${id}' was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: entrepreneur
    });
  },

  // POST /api/entrepreneurs/register
  registerEntrepreneur(req, res) {
    const body = req.body || {};
    const { name, businessName, businessCategory, email, phone } = body;

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanBiz = (businessName || '').trim();

    if (!cleanBiz || !cleanEmail) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REGISTRATION_FIELDS',
        message: 'Business name and email address are mandatory.'
      });
    }

    const applicantName = (name || cleanBiz || 'Women Entrepreneur').trim();
    const applicantPhone = (phone || '9876543210').trim();
    const applicantCategory = (businessCategory || 'Bakery & Sweets').trim();

    const existing = db.findEntrepreneur(cleanEmail);
    if (existing) {
      if (existing.status === 'pending' || existing.status === 'correctable_rejection') {
        const updated = db.updateEntrepreneur(existing.id, {
          name: applicantName,
          businessName: cleanBiz,
          businessCategory: applicantCategory,
          phone: applicantPhone,
          address: body.address || existing.address,
          deliveryRadius: parseInt(body.deliveryRadius, 10) || existing.deliveryRadius || 10,
          yearsExp: parseInt(body.yearsExp, 10) || existing.yearsExp || 1,
          documents: body.documents || existing.documents,
          about: body.about || existing.about || '',
          status: 'pending',
          appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        });
        db.addActivityLog(`Updated entrepreneur application: "${cleanBiz}" (${applicantName})`);
        return res.status(200).json({
          success: true,
          data: updated,
          message: 'Entrepreneur application updated successfully and is pending admin verification.'
        });
      }

      return res.status(400).json({
        success: false,
        error: 'EMAIL_ALREADY_REGISTERED',
        message: 'An entrepreneur application with this email already exists and is approved.'
      });
    }

    // Default username if not passed
    const username = body.username || cleanEmail.split('@')[0];

    const newEntrepreneur = db.createEntrepreneur({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      password: body.password || 'password123',
      businessName: businessName.trim(),
      businessCategory: businessCategory.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      address: body.address || { door: '', street: '', city: 'Bangalore', pincode: '560001' },
      deliveryRadius: parseInt(body.deliveryRadius, 10) || 10,
      yearsExp: parseInt(body.yearsExp, 10) || 1,
      documents: body.documents || {
        idType: 'Aadhaar Card',
        idFile: '/uploads/sample_id.pdf',
        businessProof: '/uploads/sample_kitchen.jpg'
      },
      securityAnswers: Array.isArray(body.securityAnswers) ? body.securityAnswers : [
        { question: 'What is your school name?', answer: 'Malleshwaram High' },
        { question: 'What is your village name?', answer: 'Mandya' },
        { question: 'What is your favourite food?', answer: 'Mysore Pak' }
      ],
      bankDetails: body.bankDetails || {
        accountHolder: name.trim(),
        accountNumber: 'XXXX-XXXX-1234',
        ifscCode: 'SBIN0001234',
        upiId: `${username}@upi`
      },
      status: 'pending' // Enters admin verification queue
    });

    // Link to existing customer account if exists
    const user = db.findUserByEmail(cleanEmail);
    if (user) {
      user.entrepreneurId = newEntrepreneur.id;
      db.updateUser(user.id, { entrepreneurId: newEntrepreneur.id });
    }

    db.addActivityLog(`New entrepreneur registered: "${newEntrepreneur.businessName}" (${newEntrepreneur.name})`);

    return res.status(201).json({
      success: true,
      data: newEntrepreneur,
      message: 'Application submitted successfully. It is now pending admin verification.'
    });
  },

  // PATCH /api/entrepreneurs/:id/availability
  updateAvailability(req, res) {
    const { id } = req.params;
    const { isStoreOpen, openingSchedule } = req.body || {};

    const entrepreneur = db.getEntrepreneurById(id);
    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        error: 'ENTREPRENEUR_NOT_FOUND',
        message: `Entrepreneur with ID '${id}' was not found.`
      });
    }

    const updates = {};
    if (typeof isStoreOpen === 'boolean') updates.isStoreOpen = isStoreOpen;
    if (openingSchedule !== undefined) updates.openingSchedule = openingSchedule;

    const updated = db.updateEntrepreneur(id, updates);
    db.addActivityLog(`Store "${entrepreneur.businessName}" updated availability: ${updates.isStoreOpen ? 'OPEN' : 'CLOSED'}`);

    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Store availability settings updated successfully.'
    });
  },

  // PUT /api/entrepreneurs/:id
  updateProfile(req, res) {
    const { id } = req.params;
    const entrepreneur = db.getEntrepreneurById(id);

    if (!entrepreneur) {
      return res.status(404).json({
        success: false,
        error: 'ENTREPRENEUR_NOT_FOUND',
        message: `Entrepreneur with ID '${id}' was not found.`
      });
    }

    const updated = db.updateEntrepreneur(id, req.body);
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Entrepreneur profile updated successfully.'
    });
  }
};

module.exports = entrepreneurController;
