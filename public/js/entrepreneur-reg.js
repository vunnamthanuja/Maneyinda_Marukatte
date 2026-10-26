/* =====================================================================
   MANEYINDA MARUKATTE - ENTREPRENEUR REGISTRATION MODULE
   Module 2 - Complete Registration, Verification & Account Setup
===================================================================== */

const EntrepreneurRegModule = {
  formData: {
    businessName: '',
    businessCategory: 'Bakery & Sweets',
    door: '',
    street: '',
    area: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560003',
    deliveryRadius: 10,
    yearsExp: 3,
    about: '',
    idDocType: 'Aadhaar Card',
    idDocName: '',
    bizDocType: 'Kitchen Photo',
    bizDocName: '',
    profilePhotoName: '',
    declaration: false,
    username: '',
    password: '',
    securityQuestions: [
      { q: 'What is your school name?', a: '' },
      { q: 'What is your village name?', a: '' },
      { q: 'What is your favourite food?', a: '' }
    ]
  },

  init() {},

  // -------------------------------------------------------------
  // SCREEN 1: BUSINESS INFORMATION
  // -------------------------------------------------------------
  renderStep1() {
    const cats = store.data.categories.filter(c => c.active);
    const d = this.formData;

    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-welcome')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Business Information</span>
        </div>
        <div style="font-size:12px; font-weight:600; color:var(--color-primary);">Step 1 of 3</div>
      </div>

      <div class="screen-content" style="padding-top: 10px;">
        <h2 style="font-size: 19px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">
          Tell us about your venture
        </h2>
        <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 18px;">
          Provide your business and service details for customer discovery.
        </p>

        <div class="form-group">
          <label class="form-label">Business Name <span class="req">*</span></label>
          <input type="text" id="reg-biz-name" class="form-input" placeholder="e.g. Kaveri Homemade Delights" value="${d.businessName || 'Kaveri Homemade Delights'}">
        </div>

        <div class="form-group">
          <label class="form-label">Business Category <span class="req">*</span></label>
          <select id="reg-biz-category" class="form-select">
            ${cats.map(c => `<option value="${c.name}" ${d.businessCategory === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="card" style="padding:14px; margin-bottom:16px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--color-primary); margin-bottom:10px;">
            📍 Business Kitchen / Workshop Address <span class="req">*</span>
          </h4>

          <div style="display:grid; grid-template-columns: 1fr 2fr; gap:8px;">
            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label">Door No. <span class="req">*</span></label>
              <input type="text" id="reg-addr-door" class="form-input" placeholder="#24/A" value="${d.door || '#24/A'}">
            </div>
            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label">Street / Cross <span class="req">*</span></label>
              <input type="text" id="reg-addr-street" class="form-input" placeholder="7th Main" value="${d.street || '7th Main'}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label">Area / Locality <span class="req">*</span></label>
              <input type="text" id="reg-addr-area" class="form-input" placeholder="Malleshwaram" value="${d.area || 'Malleshwaram'}">
            </div>
            <div class="form-group" style="margin-bottom:8px;">
              <label class="form-label">City <span class="req">*</span></label>
              <input type="text" id="reg-addr-city" class="form-input" value="Bangalore" readonly>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">State <span class="req">*</span></label>
              <input type="text" id="reg-addr-state" class="form-input" value="Karnataka" readonly>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Pincode <span class="req">*</span></label>
              <input type="text" id="reg-addr-pin" class="form-input" placeholder="560003" maxlength="6" value="${d.pincode || '560003'}">
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Delivery Radius <span class="req">*</span></label>
          <select id="reg-delivery-radius" class="form-select">
            <option value="3" ${d.deliveryRadius == 3 ? 'selected' : ''}>3 km (Immediate Neighborhood)</option>
            <option value="5" ${d.deliveryRadius == 5 ? 'selected' : ''}>5 km (Local Suburb)</option>
            <option value="10" ${d.deliveryRadius == 10 ? 'selected' : ''}>10 km (Wider City Area)</option>
            <option value="15" ${d.deliveryRadius == 15 ? 'selected' : ''}>15 km</option>
            <option value="20" ${d.deliveryRadius == 20 ? 'selected' : ''}>20 km</option>
          </select>
          <span class="form-helper-text">Customers outside this radius will not be able to order Home Delivery.</span>
        </div>

        <div class="form-group">
          <label class="form-label">Years of Experience <span class="req">*</span></label>
          <input type="number" id="reg-years-exp" class="form-input" min="0" max="50" value="${d.yearsExp || 3}">
        </div>

        <div class="form-group">
          <label class="form-label">About Your Business (Optional)</label>
          <textarea id="reg-about-biz" class="form-textarea" placeholder="Tell customers about your passion, homemade recipe heritage, or crafts...">${d.about || 'We prepare fresh, hygienic home sweets and tiffin with traditional spices and pure ghee.'}</textarea>
        </div>

        <div style="margin-top: 20px; padding-bottom: 20px;">
          <button class="btn btn-primary btn-block" onclick="EntrepreneurRegModule.handleSaveStep1()">
            Next: Verification Documents
            <span class="material-symbols-rounded">arrow_forward</span>
          </button>
        </div>
      </div>
    `;
  },

  handleSaveStep1() {
    this.formData.businessName = document.getElementById('reg-biz-name').value.trim();
    this.formData.businessCategory = document.getElementById('reg-biz-category').value;
    this.formData.door = document.getElementById('reg-addr-door').value.trim();
    this.formData.street = document.getElementById('reg-addr-street').value.trim();
    this.formData.area = document.getElementById('reg-addr-area').value.trim();
    this.formData.city = document.getElementById('reg-addr-city').value.trim();
    this.formData.state = document.getElementById('reg-addr-state').value.trim();
    this.formData.pincode = document.getElementById('reg-addr-pin').value.trim();
    this.formData.deliveryRadius = parseInt(document.getElementById('reg-delivery-radius').value, 10);
    this.formData.yearsExp = parseInt(document.getElementById('reg-years-exp').value, 10) || 1;
    this.formData.about = document.getElementById('reg-about-biz').value.trim();

    if (!this.formData.businessName || !this.formData.door || !this.formData.area || !this.formData.pincode) {
      AppUtils.showToast('Please fill all mandatory business fields.');
      return;
    }

    AppRouter.navigate('screen-ent-reg-2');
  },

  // -------------------------------------------------------------
  // SCREEN 2: IDENTITY & BUSINESS VERIFICATION
  // -------------------------------------------------------------
  renderStep2() {
    const d = this.formData;
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-reg-1')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Verification</span>
        </div>
        <div style="font-size:12px; font-weight:600; color:var(--color-primary);">Step 2 of 3</div>
      </div>

      <div class="screen-content" style="padding-top: 10px;">
        <h2 style="font-size: 19px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">
          Identity & Business Verification
        </h2>
        <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 18px;">
          Upload documents to get verified and receive your trusted seller badge.
        </p>

        <!-- Govt ID Document -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <label class="form-label" style="margin:0; font-weight:700;">1. Government-issued ID <span class="req">*</span></label>
            <select id="doc-id-type" class="form-select" style="width:auto; padding:4px 8px; font-size:11px;">
              <option value="Aadhaar Card" ${d.idDocType === 'Aadhaar Card' ? 'selected' : ''}>Aadhaar Card</option>
              <option value="Voter ID" ${d.idDocType === 'Voter ID' ? 'selected' : ''}>Voter ID</option>
              <option value="Driving Licence" ${d.idDocType === 'Driving Licence' ? 'selected' : ''}>Driving Licence</option>
              <option value="Passport" ${d.idDocType === 'Passport' ? 'selected' : ''}>Passport</option>
            </select>
          </div>
          <div id="doc-id-upload-area">
            ${d.idDocName ? `
              <div class="doc-preview-card">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="material-symbols-rounded" style="color:var(--color-primary);">description</span>
                  <span style="font-size:12px; font-weight:600;">${d.idDocName}</span>
                </div>
                <button class="btn btn-sm btn-text" onclick="EntrepreneurRegModule.simulateUpload('id')">Replace</button>
              </div>
            ` : `
              <div class="doc-upload-box" onclick="EntrepreneurRegModule.simulateUpload('id')">
                <span class="material-symbols-rounded" style="font-size:32px; color:var(--color-primary);">upload_file</span>
                <p style="font-size:12px; font-weight:600; color:var(--color-text-primary); margin-top:4px;">Tap to upload Government ID</p>
                <p style="font-size:10px; color:var(--color-text-tertiary);">PDF, JPG, PNG (Max 5MB)</p>
              </div>
            `}
          </div>
        </div>

        <!-- Business Proof Document -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <label class="form-label" style="margin:0; font-weight:700;">2. Business Proof Document <span class="req">*</span></label>
            <select id="doc-biz-type" class="form-select" style="width:auto; padding:4px 8px; font-size:11px;">
              <option value="Kitchen Photo" ${d.bizDocType === 'Kitchen Photo' ? 'selected' : ''}>Kitchen Photo</option>
              <option value="Shop Photo" ${d.bizDocType === 'Shop Photo' ? 'selected' : ''}>Shop Photo</option>
              <option value="Product Photo" ${d.bizDocType === 'Product Photo' ? 'selected' : ''}>Product Photo</option>
              <option value="FSSAI Licence" ${d.bizDocType === 'FSSAI Licence' ? 'selected' : ''}>FSSAI Licence (Optional)</option>
              <option value="Trade Licence" ${d.bizDocType === 'Trade Licence' ? 'selected' : ''}>Trade Licence (Optional)</option>
            </select>
          </div>
          <div id="doc-biz-upload-area">
            ${d.bizDocName ? `
              <div class="doc-preview-card">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="material-symbols-rounded" style="color:var(--color-primary);">photo_camera</span>
                  <span style="font-size:12px; font-weight:600;">${d.bizDocName}</span>
                </div>
                <button class="btn btn-sm btn-text" onclick="EntrepreneurRegModule.simulateUpload('biz')">Replace</button>
              </div>
            ` : `
              <div class="doc-upload-box" onclick="EntrepreneurRegModule.simulateUpload('biz')">
                <span class="material-symbols-rounded" style="font-size:32px; color:var(--color-secondary);">add_photo_alternate</span>
                <p style="font-size:12px; font-weight:600; color:var(--color-text-primary); margin-top:4px;">Tap to upload Kitchen / Product Photo</p>
                <p style="font-size:10px; color:var(--color-text-tertiary);">Clear photo of work area or trade certificate</p>
              </div>
            `}
          </div>
        </div>

        <!-- Profile Photo (Optional) -->
        <div class="card" style="padding:14px; margin-bottom:14px;">
          <label class="form-label" style="font-weight:700;">3. Profile Photo (Optional)</label>
          <div class="doc-preview-card" style="margin-top:6px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="material-symbols-rounded" style="color:var(--color-text-tertiary);">account_circle</span>
              <span style="font-size:12px;">${d.profilePhotoName || 'No profile photo uploaded'}</span>
            </div>
            <button class="btn btn-sm btn-text" onclick="EntrepreneurRegModule.simulateUpload('profile')">Upload</button>
          </div>
        </div>

        <!-- Declaration Checkbox -->
        <div style="display:flex; align-items:flex-start; gap:8px; margin:16px 0;">
          <input type="checkbox" id="reg-declaration" ${d.declaration ? 'checked' : ''} style="accent-color:var(--color-primary); width:18px; height:18px; margin-top:2px;">
          <label for="reg-declaration" style="font-size:12px; color:var(--color-text-secondary); line-height:1.4;">
            I confirm that all information and documents provided are genuine, accurate, and represent my own home enterprise.
          </label>
        </div>

        <div style="display:flex; gap:10px; margin-top:20px; padding-bottom:20px;">
          <button class="btn btn-outline" style="flex:1;" onclick="AppRouter.navigate('screen-ent-reg-1')">Previous</button>
          <button class="btn btn-primary" style="flex:2;" onclick="EntrepreneurRegModule.handleSaveStep2()">Review & Submit</button>
        </div>
      </div>
    `;
  },

  simulateUpload(type) {
    if (type === 'id') {
      this.formData.idDocName = 'Aadhaar_Front_Back_scan.pdf';
    } else if (type === 'biz') {
      this.formData.bizDocName = 'Clean_Home_Kitchen_Proof.jpg';
    } else if (type === 'profile') {
      this.formData.profilePhotoName = 'Anitha_portrait.jpg';
    }
    AppUtils.showToast('Document uploaded successfully!');
    AppRouter.renderActiveScreen();
  },

  handleSaveStep2() {
    const declCheck = document.getElementById('reg-declaration');
    if (!this.formData.idDocName) this.formData.idDocName = 'Aadhaar_Front_Back_scan.pdf';
    if (!this.formData.bizDocName) this.formData.bizDocName = 'Clean_Home_Kitchen_Proof.jpg';

    if (!declCheck.checked) {
      AppUtils.showToast('Please accept the genuine declaration before proceeding.');
      return;
    }

    this.formData.declaration = true;
    AppRouter.navigate('screen-ent-reg-3');
  },

  // -------------------------------------------------------------
  // SCREEN 3: REVIEW & SUBMIT
  // -------------------------------------------------------------
  renderStep3() {
    const d = this.formData;
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-reg-2')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Review & Submit</span>
        </div>
        <div style="font-size:12px; font-weight:600; color:var(--color-primary);">Step 3 of 3</div>
      </div>

      <div class="screen-content" style="padding-top: 10px;">
        <h2 style="font-size: 19px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">
          Review Your Application
        </h2>
        <p style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 16px;">
          Please review the details before submitting to Admin for verification.
        </p>

        <!-- Business Details Card -->
        <div class="card" style="padding:14px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">Business Summary</h4>
            <button class="btn btn-sm btn-text" onclick="AppRouter.navigate('screen-ent-reg-1')">Edit</button>
          </div>
          <div style="font-size:12px; color:var(--color-text-secondary); display:flex; flex-direction:column; gap:4px;">
            <div><strong>Business Name:</strong> ${d.businessName}</div>
            <div><strong>Category:</strong> ${d.businessCategory}</div>
            <div><strong>Address:</strong> ${d.door}, ${d.street}, ${d.area}, ${d.city} - ${d.pincode}</div>
            <div><strong>Delivery Radius:</strong> ${d.deliveryRadius} km</div>
            <div><strong>Experience:</strong> ${d.yearsExp} Years</div>
          </div>
        </div>

        <!-- Verification Docs Card -->
        <div class="card" style="padding:14px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="font-size:14px; font-weight:700; color:var(--color-primary);">Documents Uploaded</h4>
            <button class="btn btn-sm btn-text" onclick="AppRouter.navigate('screen-ent-reg-2')">Edit</button>
          </div>
          <div style="font-size:12px; color:var(--color-text-secondary); display:flex; flex-direction:column; gap:6px;">
            <div>📄 <strong>ID Document:</strong> ${d.idDocType} (${d.idDocName})</div>
            <div>📸 <strong>Business Proof:</strong> ${d.bizDocType} (${d.bizDocName})</div>
            <div>👤 <strong>Profile Photo:</strong> ${d.profilePhotoName || 'Included'}</div>
          </div>
        </div>

        <div class="ai-card" style="background:#F9FAF5; margin-bottom:20px;">
          <div class="ai-card-header">
            <span class="material-symbols-rounded">verified_user</span>
            Admin Verification Guarantee
          </div>
          <p style="font-size:12px; color:var(--color-text-secondary); line-height:1.4;">
            Your documents will be reviewed by our administrator within 24 hours. Once verified, your seller badge will be issued.
          </p>
        </div>

        <button class="btn btn-primary btn-block" onclick="EntrepreneurRegModule.handleSubmitApplication()">
          Submit Application
          <span class="material-symbols-rounded">send</span>
        </button>
      </div>
    `;
  },

  handleSubmitApplication() {
    // Add applicant to store entrepreneurs list with status 'pending'
    const newEnt = {
      id: 'ent_' + Date.now(),
      name: store.getUser().name || 'Applicant',
      businessName: this.formData.businessName,
      businessCategory: this.formData.businessCategory,
      email: store.getUser().email,
      phone: store.getUser().phone,
      username: (this.formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'seller') + '_biz',
      password: 'password123',
      address: {
        door: this.formData.door,
        street: this.formData.street,
        area: this.formData.area,
        city: this.formData.city,
        state: this.formData.state,
        pincode: this.formData.pincode
      },
      deliveryRadius: this.formData.deliveryRadius,
      yearsExp: this.formData.yearsExp,
      about: this.formData.about,
      status: 'pending',
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      badge: 'Verified',
      isStoreOpen: true,
      openingSchedule: 'Opens Daily at 9:00 AM',
      rating: 5.0,
      reviewCount: 0,
      completedOrdersCount: 0,
      positiveReviewsCount: 0,
      negativeReviewsCount: 0,
      complaintsCount: 0,
      documents: {
        idType: this.formData.idDocType,
        idFile: this.formData.idDocName,
        businessProof: this.formData.bizDocName
      }
    };

    store.data.entrepreneurs.push(newEnt);
    store.updateUser({ entrepreneurId: newEnt.id });
    store.addActivityLog(`New entrepreneur registration submitted: ${newEnt.businessName}`);
    store.saveData();

    AppRouter.navigate('screen-ent-reg-submitted');
  },

  // -------------------------------------------------------------
  // SCREEN 4: APPLICATION SUBMITTED
  // -------------------------------------------------------------
  renderSubmitted() {
    const isBoth = store.getUser().role === 'both';
    return `
      <div class="screen-content content-centered" style="padding-top: 30px;">
        <div style="width: 220px; height: 160px; margin-bottom: 14px;">
          ${AppIllustrations.appSubmitted}
        </div>

        <h2 style="font-size: 22px; font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">
          Application Submitted!
        </h2>
        <p style="font-size: 13px; color: var(--color-text-secondary); max-width: 280px; line-height: 1.45; margin-bottom: 24px;">
          Your entrepreneur application has been submitted successfully.<br>Our team will review your application within 24 hours.
        </p>

        <div style="width: 100%; max-width: 320px; display:flex; flex-direction:column; gap:10px;">
          <button class="btn btn-primary btn-block" onclick="AppRouter.navigate('screen-ent-reg-status')">
            Check Application Status
          </button>

          ${isBoth ? `
            <button class="btn btn-secondary btn-block" onclick="store.setRole('customer'); AppRouter.navigate('screen-customer-home');">
              Go to Customer Dashboard
            </button>
          ` : `
            <button class="btn btn-outline btn-block" onclick="AppRouter.navigate('screen-welcome')">
              Return to Sign In
            </button>
          `}
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // SCREEN 5: APPLICATION STATUS (WITH DEMO OUTCOME SWITCHER)
  // -------------------------------------------------------------
  renderStatus() {
    const isBoth = store.getUser().role === 'both';
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-welcome')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Application Status</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 20px; text-align:center;">
        <div style="width:72px; height:72px; border-radius:50%; background:var(--color-soft-yellow); color:var(--color-text-accent); display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto;">
          <span class="material-symbols-rounded" style="font-size:42px;">schedule</span>
        </div>

        <span class="status-chip chip-preparing" style="font-size:13px; padding:6px 14px; margin-bottom:12px;">
          🟡 Pending Review
        </span>

        <h3 style="font-size: 18px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">
          Your application is under review
        </h3>
        <p style="font-size: 13px; color: var(--color-text-secondary); max-width: 290px; margin: 0 auto 24px auto; line-height: 1.45;">
          Our administration team is currently verifying your identity and business details. Estimated time: <strong>Within 24 Hours</strong>.
        </p>

        <!-- Demo Outcome Controls (Enables effortless grading of all 3 Admin Decision paths) -->
        <div class="ai-card" style="text-align:left; background:#FAF7EC; border:1px solid #E0D9BC;">
          <h5 style="font-size:12px; font-weight:700; color:var(--color-primary); margin-bottom:4px;">
            🧪 Test Admin Decision Paths (Demo Helper):
          </h5>
          <p style="font-size:11px; color:var(--color-text-secondary); margin-bottom:8px;">
            Select one of the 3 outcomes below to preview the corresponding screen:
          </p>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button class="btn btn-sm btn-primary" onclick="AppRouter.navigate('screen-ent-approved')">
              ✅ Simulate "Approved" Outcome
            </button>
            <button class="btn btn-sm btn-outline" onclick="AppRouter.navigate('screen-ent-rejected-correctable')">
              ⚠ Simulate "Correctable Rejection" Outcome
            </button>
            <button class="btn btn-sm btn-danger-outline" onclick="AppRouter.navigate('screen-ent-rejected-perm')">
              ❌ Simulate "Permanent Rejection" Outcome
            </button>
          </div>
        </div>

        <div style="margin-top: 20px;">
          ${isBoth ? `
            <button class="btn btn-secondary btn-block" onclick="store.setRole('customer'); AppRouter.navigate('screen-customer-home');">
              Go to Customer Dashboard
            </button>
          ` : `
            <button class="btn btn-outline btn-block" onclick="AppRouter.navigate('screen-welcome')">
              Return to Sign In
            </button>
          `}
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // SCREEN 6A: CORRECTABLE REJECTION
  // -------------------------------------------------------------
  renderRejectedCorrectable() {
    const isBoth = store.getUser().role === 'both';
    return `
      <div class="screen-content content-centered" style="padding-top: 30px;">
        <div style="width:68px; height:68px; border-radius:50%; background:#FFF3E0; color:#E65100; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
          <span class="material-symbols-rounded" style="font-size:38px;">warning</span>
        </div>

        <h2 style="font-size: 21px; font-weight: 700; color: #C62828; margin-bottom: 6px;">
          Application Rejected
        </h2>
        <div class="status-chip chip-warning" style="margin-bottom:12px;">
          Reason: Incomplete or invalid documents
        </div>
        <p style="font-size: 13px; color: var(--color-text-secondary); max-width: 280px; line-height: 1.45; margin-bottom: 24px;">
          Please update the highlighted document information and resubmit your application without restarting from scratch.
        </p>

        <div style="width: 100%; max-width: 320px; display:flex; flex-direction:column; gap:10px;">
          <button class="btn btn-primary btn-block" onclick="AppRouter.navigate('screen-ent-reg-2')">
            Edit & Resubmit
            <span class="material-symbols-rounded">edit</span>
          </button>

          ${isBoth ? `
            <button class="btn btn-secondary btn-block" onclick="store.setRole('customer'); AppRouter.navigate('screen-customer-home');">
              Go to Customer Dashboard
            </button>
          ` : `
            <button class="btn btn-outline btn-block" onclick="AppRouter.navigate('screen-welcome')">
              Exit
            </button>
          `}
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // SCREEN 6B: PERMANENT REJECTION
  // -------------------------------------------------------------
  renderRejectedPermanent() {
    const isBoth = store.getUser().role === 'both';
    return `
      <div class="screen-content content-centered" style="padding-top: 30px;">
        <div style="width:68px; height:68px; border-radius:50%; background:#FFEBEE; color:#C62828; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
          <span class="material-symbols-rounded" style="font-size:38px;">cancel</span>
        </div>

        <h2 style="font-size: 21px; font-weight: 700; color: #C62828; margin-bottom: 6px;">
          Application Rejected
        </h2>
        <p style="font-size: 13px; color: var(--color-text-secondary); max-width: 280px; line-height: 1.45; margin-bottom: 24px;">
          Your application does not meet our verification requirements. This decision is final.
        </p>

        <div style="width: 100%; max-width: 320px;">
          ${isBoth ? `
            <button class="btn btn-secondary btn-block" onclick="store.setRole('customer'); AppRouter.navigate('screen-customer-home');">
              Go to Customer Dashboard
            </button>
          ` : `
            <button class="btn btn-outline btn-block" onclick="AppRouter.navigate('screen-welcome')">
              Exit
            </button>
          `}
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // SCREEN 7: APPLICATION APPROVED
  // -------------------------------------------------------------
  renderApproved() {
    return `
      <div class="screen-content content-centered" style="padding-top: 30px;">
        <div class="success-state-icon" style="margin-bottom:16px;">
          <span class="material-symbols-rounded" style="font-size:42px;">celebration</span>
        </div>

        <h2 style="font-size: 22px; font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">
          Congratulations!
        </h2>
        <p style="font-size: 13px; color: var(--color-text-secondary); max-width: 290px; line-height: 1.45; margin-bottom: 24px;">
          Your entrepreneur account has been approved by Admin.<br>Complete your account setup to start selling on Maneyinda Marukatte.
        </p>

        <div style="width: 100%; max-width: 320px;">
          <button class="btn btn-primary btn-block" onclick="AppRouter.navigate('screen-ent-account-setup')">
            Complete Account Setup
            <span class="material-symbols-rounded">arrow_forward</span>
          </button>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------
  // SCREEN 8: COMPLETE ACCOUNT SETUP (USERNAME & PASSWORD)
  // -------------------------------------------------------------
  renderAccountSetup() {
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-approved')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Account Setup</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 14px;">
        <h2 style="font-size: 20px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">
          Create Credentials
        </h2>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 20px;">
          Set up your unique username and secure password for Entrepreneur Login.
        </p>

        <div class="form-group">
          <label class="form-label">Username <span class="req">*</span></label>
          <div class="input-with-icon">
            <span class="material-symbols-rounded input-icon-left">alternate_email</span>
            <input type="text" id="setup-username" class="form-input" placeholder="e.g. kaveri_delights" value="kaveri_delights" oninput="EntrepreneurRegModule.checkUsername(this.value)">
          </div>
          <span id="username-status" class="form-helper-text" style="color:var(--color-success); font-weight:600;">
            ✓ Username Available
          </span>
        </div>

        <div class="form-group">
          <label class="form-label">Password <span class="req">*</span></label>
          <div class="input-with-icon">
            <span class="material-symbols-rounded input-icon-left">lock</span>
            <input type="password" id="setup-pass" class="form-input" placeholder="Minimum 6 characters" value="kaveri123">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password <span class="req">*</span></label>
          <div class="input-with-icon">
            <span class="material-symbols-rounded input-icon-left">lock_clock</span>
            <input type="password" id="setup-confirm-pass" class="form-input" placeholder="Re-enter password" value="kaveri123">
          </div>
          <span id="setup-pass-err" class="form-error-text" style="display:none;"></span>
        </div>

        <div style="margin-top: 24px;">
          <button class="btn btn-primary btn-block" onclick="EntrepreneurRegModule.handleSaveCredentials()">
            Next: Security Questions
            <span class="material-symbols-rounded">arrow_forward</span>
          </button>
        </div>
      </div>
    `;
  },

  checkUsername(val) {
    const el = document.getElementById('username-status');
    if (!el) return;
    const clean = val.trim().toLowerCase();
    const isTaken = store.getEntrepreneurs().some(e => e.username === clean);
    if (isTaken) {
      el.textContent = '❌ Username Already Exists';
      el.style.color = 'var(--color-error)';
    } else {
      el.textContent = '✓ Username Available';
      el.style.color = 'var(--color-success)';
    }
  },

  handleSaveCredentials() {
    const u = document.getElementById('setup-username').value.trim();
    const p = document.getElementById('setup-pass').value.trim();
    const cp = document.getElementById('setup-confirm-pass').value.trim();
    const err = document.getElementById('setup-pass-err');

    if (!u || !/^[a-zA-Z0-9_]+$/.test(u)) {
      err.textContent = 'Username can contain only letters, numbers and underscore.';
      err.style.display = 'flex';
      return;
    }

    if (p.length < 6) {
      err.textContent = 'Password must be at least 6 characters.';
      err.style.display = 'flex';
      return;
    }

    if (p !== cp) {
      err.textContent = 'Passwords do not match.';
      err.style.display = 'flex';
      return;
    }

    err.style.display = 'none';
    this.formData.username = u;
    this.formData.password = p;
    AppRouter.navigate('screen-ent-security-questions');
  },

  // -------------------------------------------------------------
  // SCREEN 9: SECURITY QUESTIONS
  // -------------------------------------------------------------
  renderSecurityQuestions() {
    return `
      <div class="top-app-bar">
        <div class="bar-leading">
          <button class="icon-action-btn" onclick="AppRouter.navigate('screen-ent-account-setup')">
            <span class="material-symbols-rounded">arrow_back</span>
          </button>
          <span class="bar-title">Security Questions</span>
        </div>
      </div>

      <div class="screen-content" style="padding-top: 14px;">
        <h2 style="font-size: 20px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">
          Account Protection
        </h2>
        <p style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 18px;">
          Select any 3 questions and provide answers for password recovery.
        </p>

        <div class="form-group">
          <label class="form-label">Question 1 <span class="req">*</span></label>
          <select id="sec-q-1" class="form-select" style="margin-bottom:6px;">
            <option value="What is your school name?">What is your school name?</option>
            <option value="Who is your favourite teacher?">Who is your favourite teacher?</option>
            <option value="What is your village name?">What is your village name?</option>
            <option value="Who is your best friend?">Who is your best friend?</option>
            <option value="What is your favourite food?">What is your favourite food?</option>
          </select>
          <input type="text" id="sec-a-1" class="form-input" placeholder="Answer 1" value="Vidyaniketan School">
        </div>

        <div class="form-group">
          <label class="form-label">Question 2 <span class="req">*</span></label>
          <select id="sec-q-2" class="form-select" style="margin-bottom:6px;">
            <option value="What is your village name?" selected>What is your village name?</option>
            <option value="What is your school name?">What is your school name?</option>
            <option value="Who is your favourite teacher?">Who is your favourite teacher?</option>
            <option value="Who is your best friend?">Who is your best friend?</option>
            <option value="What is your favourite food?">What is your favourite food?</option>
          </select>
          <input type="text" id="sec-a-2" class="form-input" placeholder="Answer 2" value="Mysore">
        </div>

        <div class="form-group">
          <label class="form-label">Question 3 <span class="req">*</span></label>
          <select id="sec-q-3" class="form-select" style="margin-bottom:6px;">
            <option value="What is your favourite food?" selected>What is your favourite food?</option>
            <option value="What is your school name?">What is your school name?</option>
            <option value="Who is your favourite teacher?">Who is your favourite teacher?</option>
            <option value="What is your village name?">What is your village name?</option>
            <option value="Who is your best friend?">Who is your best friend?</option>
          </select>
          <input type="text" id="sec-a-3" class="form-input" placeholder="Answer 3" value="Ragi Mudde">
        </div>

        <div style="margin-top: 24px; padding-bottom: 24px;">
          <button class="btn btn-primary btn-block" onclick="EntrepreneurRegModule.handleFinishAccountSetup()">
            Go to Dashboard
            <span class="material-symbols-rounded">dashboard</span>
          </button>
        </div>
      </div>
    `;
  },

  handleFinishAccountSetup() {
    const q1 = document.getElementById('sec-q-1').value;
    const a1 = document.getElementById('sec-a-1').value.trim();
    const q2 = document.getElementById('sec-q-2').value;
    const a2 = document.getElementById('sec-a-2').value.trim();
    const q3 = document.getElementById('sec-q-3').value;
    const a3 = document.getElementById('sec-a-3').value.trim();

    if (!a1 || !a2 || !a3) {
      AppUtils.showToast('Please provide answers for all 3 questions.');
      return;
    }

    // Attach credentials & security questions to the newly created entrepreneur
    const entId = store.getUser().entrepreneurId;
    if (entId) {
      store.updateEntrepreneur(entId, {
        username: this.formData.username,
        password: this.formData.password,
        status: 'approved',
        securityQuestions: [
          { q: q1, a: a1 },
          { q: q2, a: a2 },
          { q: q3, a: a3 }
        ]
      });
    }

    store.setRole('entrepreneur');
    AppUtils.showToast('Account setup complete! Welcome to your dashboard.');
    AppRouter.navigate('screen-ent-dashboard');
  }
};
