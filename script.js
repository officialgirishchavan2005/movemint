/**
 * MOVEMINT — Client-Side Interactive Logic
 * Vanilla ES6+ JavaScript (No frameworks, no backend, illustrative demo only).
 */

(() => {
  'use strict';

  /* ========================================================================
     1. Transparent Illustrative Pricing Configuration
     ======================================================================== */
  const PRICING_CONFIG = {
    homeTypes: {
      studio: { label: 'Studio', baseFee: 180 },
      '1br': { label: '1 Bedroom', baseFee: 260 },
      '2br': { label: '2 Bedrooms', baseFee: 380 },
      '3br': { label: '3 Bedrooms', baseFee: 520 },
      large_house: { label: 'Large House', baseFee: 740 }
    },
    distances: {
      under_5: { label: 'Under 5 km', fee: 45 },
      '5_15': { label: '5–15 km', fee: 95 },
      '15_30': { label: '15–30 km', fee: 165 },
      above_30: { label: 'Above 30 km', fee: 260 }
    },
    items: {
      sofa: { label: 'Sofa', unitRate: 35, max: 30 },
      bed: { label: 'Bed', unitRate: 40, max: 30 },
      wardrobe: { label: 'Wardrobe', unitRate: 45, max: 30 },
      refrigerator: { label: 'Refrigerator', unitRate: 50, max: 15 },
      washing_machine: { label: 'Washing machine', unitRate: 40, max: 15 },
      dining_table: { label: 'Dining table', unitRate: 35, max: 20 },
      boxes: { label: 'Boxes', unitRate: 4, max: 200 }
    },
    extras: {
      packing_assistance: { label: 'Packing assistance', fee: 110 },
      furniture_dismantling: { label: 'Furniture dismantling', fee: 85 },
      fragile_handling: { label: 'Fragile item handling', fee: 65 },
      unpacking_assistance: { label: 'Unpacking assistance', fee: 95 }
    },
    typicalPresets: {
      studio: { sofa: 1, bed: 1, wardrobe: 0, refrigerator: 1, washing_machine: 0, dining_table: 0, boxes: 8 },
      '1br': { sofa: 1, bed: 1, wardrobe: 1, refrigerator: 1, washing_machine: 1, dining_table: 1, boxes: 14 },
      '2br': { sofa: 1, bed: 2, wardrobe: 2, refrigerator: 1, washing_machine: 1, dining_table: 1, boxes: 24 },
      '3br': { sofa: 2, bed: 3, wardrobe: 3, refrigerator: 1, washing_machine: 1, dining_table: 1, boxes: 38 },
      large_house: { sofa: 2, bed: 4, wardrobe: 4, refrigerator: 2, washing_machine: 1, dining_table: 2, boxes: 55 }
    }
  };

  /* ========================================================================
     2. Shared Utility & Validation Helpers
     ======================================================================== */
  const formatCurrency = (amount) => `$${Number(amount).toLocaleString('en-US')}`;

  const getTodayISO = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const VALIDATORS = {
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    phone: (value) => value.replace(/\D/g, '').length >= 7,
    minText: (value, minLen = 2) => value.trim().length >= minLen,
    futureOrTodayDate: (value) => Boolean(value) && value >= getTodayISO()
  };

  /**
   * Reusable field error setter for accessible form feedback.
   */
  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    if (message) {
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
    } else {
      inputEl.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    }
  }

  /**
   * Pure deterministic estimate calculation.
   * Formula: Total = Home Base + Distance Fee + Sum(Items) + Sum(Extras)
   */
  function calculateMoveEstimate(state) {
    const home = PRICING_CONFIG.homeTypes[state.homeType] || PRICING_CONFIG.homeTypes.studio;
    const distance = PRICING_CONFIG.distances[state.distance] || PRICING_CONFIG.distances.under_5;

    const itemLines = Object.entries(PRICING_CONFIG.items)
      .map(([key, meta]) => {
        const qty = Math.max(0, Number(state.items[key] || 0));
        return {
          key,
          label: meta.label,
          qty,
          unitRate: meta.unitRate,
          subtotal: qty * meta.unitRate
        };
      })
      .filter((line) => line.qty > 0);

    const itemsSubtotal = itemLines.reduce((sum, line) => sum + line.subtotal, 0);

    const extraLines = state.extras
      .filter((extraKey) => Boolean(PRICING_CONFIG.extras[extraKey]))
      .map((extraKey) => ({
        key: extraKey,
        label: PRICING_CONFIG.extras[extraKey].label,
        fee: PRICING_CONFIG.extras[extraKey].fee
      }));

    const extrasSubtotal = extraLines.reduce((sum, line) => sum + line.fee, 0);
    const total = home.baseFee + distance.fee + itemsSubtotal + extrasSubtotal;

    return {
      homeLabel: home.label,
      baseFee: home.baseFee,
      distanceLabel: distance.label,
      distanceFee: distance.fee,
      itemLines,
      itemsSubtotal,
      extraLines,
      extrasSubtotal,
      total
    };
  }

  /* ========================================================================
     3. Navigation & Mobile Drawer
     ======================================================================== */
  function initNavigation() {
    const toggleBtn = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (!toggleBtn || !mobileNav) return;

    const setMenuOpen = (isOpen) => {
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      mobileNav.hidden = !isOpen;
    };

    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!expanded);
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        toggleBtn.focus();
      }
    });
  }

  /* ========================================================================
     4. Multi-Step Moving Cost Estimator
     ======================================================================== */
  function initEstimator() {
    const form = document.getElementById('estimatorForm');
    if (!form) return;

    const TOTAL_STEPS = 5;
    let currentStep = 1;

    // DOM References
    const steps = Array.from(form.querySelectorAll('.wizard-step'));
    const stepPills = Array.from(document.querySelectorAll('.step-pill'));
    const progressBarFill = document.getElementById('progressBarFill');
    const stepCounterText = document.getElementById('stepCounterText');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const finishBtn = document.getElementById('finishEstimateBtn');

    const liveTotalEl = document.getElementById('liveTotalAmount');
    const mobileTotalEl = document.getElementById('mobileTotalAmount');
    const liveBreakdownEl = document.getElementById('liveBreakdownList');

    const summaryScreen = document.getElementById('summaryScreen');
    const summaryGrandTotal = document.getElementById('summaryGrandTotal');
    const summaryDetailsGrid = document.getElementById('summaryDetailsGrid');
    const summaryLineList = document.getElementById('summaryLineList');

    const moveDateInput = document.getElementById('moveDate');
    const timeWindowInput = document.getElementById('timeWindow');
    const estNameInput = document.getElementById('estName');
    const estEmailInput = document.getElementById('estEmail');
    const estPhoneInput = document.getElementById('estPhone');
    const estRouteInput = document.getElementById('estRoute');
    const estNotesInput = document.getElementById('estNotes');
    const estDemoAckInput = document.getElementById('estDemoAck');

    // Set minimum date to today
    if (moveDateInput) {
      const today = getTodayISO();
      moveDateInput.min = today;
      if (!moveDateInput.value) {
        moveDateInput.value = today;
      }
    }

    /**
     * Reads current form values into a normalized state object.
     */
    function readEstimatorState() {
      const homeChecked = form.querySelector('input[name="homeType"]:checked');
      const distanceChecked = form.querySelector('input[name="distance"]:checked');
      const extrasChecked = Array.from(form.querySelectorAll('input[name="extras"]:checked')).map((el) => el.value);

      const items = {};
      Object.keys(PRICING_CONFIG.items).forEach((itemKey) => {
        const input = document.getElementById(`qty-${itemKey}`);
        items[itemKey] = input ? Math.max(0, parseInt(input.value, 10) || 0) : 0;
      });

      return {
        homeType: homeChecked ? homeChecked.value : 'studio',
        distance: distanceChecked ? distanceChecked.value : 'under_5',
        items,
        extras: extrasChecked
      };
    }

    /**
     * Renders the live itemized breakdown and updates total readouts immediately.
     */
    function renderLiveBreakdown() {
      const state = readEstimatorState();
      const estimate = calculateMoveEstimate(state);
      const formattedTotal = formatCurrency(estimate.total);

      if (liveTotalEl) liveTotalEl.textContent = formattedTotal;
      if (mobileTotalEl) mobileTotalEl.textContent = formattedTotal;

      // Highlight item rows with quantity > 0
      Object.keys(PRICING_CONFIG.items).forEach((itemKey) => {
        const row = form.querySelector(`.item-row[data-item-id="${itemKey}"]`);
        if (row) {
          row.classList.toggle('has-qty', state.items[itemKey] > 0);
        }
      });

      if (!liveBreakdownEl) return;

      const fragments = [];

      fragments.push(`
        <div class="receipt-row">
          <span class="receipt-row__label">Base (${estimate.homeLabel})</span>
          <span class="receipt-row__val">${formatCurrency(estimate.baseFee)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-row__label">Distance (${estimate.distanceLabel})</span>
          <span class="receipt-row__val">+${formatCurrency(estimate.distanceFee)}</span>
        </div>
      `);

      fragments.push(`<div class="receipt-subhead">Selected Items</div>`);
      if (estimate.itemLines.length === 0) {
        fragments.push(`<div class="receipt-empty">No items selected yet ($0)</div>`);
      } else {
        estimate.itemLines.forEach((line) => {
          fragments.push(`
            <div class="receipt-row">
              <span class="receipt-row__label">${line.qty} × ${line.label} (${formatCurrency(line.unitRate)})</span>
              <span class="receipt-row__val">+${formatCurrency(line.subtotal)}</span>
            </div>
          `);
        });
      }

      fragments.push(`<div class="receipt-subhead">Extra Services</div>`);
      if (estimate.extraLines.length === 0) {
        fragments.push(`<div class="receipt-empty">None selected ($0)</div>`);
      } else {
        estimate.extraLines.forEach((extra) => {
          fragments.push(`
            <div class="receipt-row">
              <span class="receipt-row__label">${extra.label}</span>
              <span class="receipt-row__val">+${formatCurrency(extra.fee)}</span>
            </div>
          `);
        });
      }

      liveBreakdownEl.innerHTML = fragments.join('');
    }

    /**
     * Switches visible wizard step and syncs progress UI.
     */
    function goToStep(stepNumber) {
      currentStep = Math.min(Math.max(stepNumber, 1), TOTAL_STEPS);

      summaryScreen.hidden = true;
      form.hidden = false;

      steps.forEach((fieldset) => {
        const stepVal = Number(fieldset.dataset.step);
        fieldset.hidden = stepVal !== currentStep;
        fieldset.classList.toggle('is-active', stepVal === currentStep);
      });

      stepPills.forEach((pill) => {
        const target = Number(pill.dataset.stepTarget);
        const isActive = target === currentStep;
        const isCompleted = target < currentStep;
        pill.classList.toggle('is-active', isActive);
        pill.classList.toggle('is-completed', isCompleted);
        if (isActive) {
          pill.setAttribute('aria-current', 'step');
        } else {
          pill.removeAttribute('aria-current');
        }
      });

      const progressPct = (currentStep / TOTAL_STEPS) * 100;
      if (progressBarFill) progressBarFill.style.width = `${progressPct}%`;
      if (stepCounterText) stepCounterText.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;

      if (prevBtn) prevBtn.disabled = currentStep === 1;
      if (nextBtn) nextBtn.hidden = currentStep === TOTAL_STEPS;
      if (finishBtn) finishBtn.hidden = currentStep !== TOTAL_STEPS;
    }

    /**
     * Validates Step 5 inputs before showing the Summary Screen.
     */
    function validateStepFive() {
      let isValid = true;
      let firstInvalid = null;

      const checks = [
        {
          input: moveDateInput,
          error: document.getElementById('moveDateError'),
          valid: VALIDATORS.futureOrTodayDate(moveDateInput.value),
          msg: 'Please select today or a future moving date.'
        },
        {
          input: estNameInput,
          error: document.getElementById('estNameError'),
          valid: VALIDATORS.minText(estNameInput.value, 2),
          msg: 'Please enter your name (at least 2 characters).'
        },
        {
          input: estEmailInput,
          error: document.getElementById('estEmailError'),
          valid: VALIDATORS.email(estEmailInput.value),
          msg: 'Please enter a valid email address.'
        },
        {
          input: estPhoneInput,
          error: document.getElementById('estPhoneError'),
          valid: VALIDATORS.phone(estPhoneInput.value),
          msg: 'Please enter a valid phone number (at least 7 digits).'
        },
        {
          input: estDemoAckInput,
          error: document.getElementById('estDemoAckError'),
          valid: estDemoAckInput.checked,
          msg: 'Please confirm you understand this is an illustrative demo only.'
        }
      ];

      checks.forEach(({ input, error, valid, msg }) => {
        if (!valid) {
          setFieldError(input, error, msg);
          isValid = false;
          if (!firstInvalid) firstInvalid = input;
        } else {
          setFieldError(input, error, '');
        }
      });

      if (firstInvalid) firstInvalid.focus();
      return isValid;
    }

    /**
     * Populates and displays the Summary Screen.
     */
    function showSummaryScreen() {
      const state = readEstimatorState();
      const estimate = calculateMoveEstimate(state);

      summaryGrandTotal.textContent = formatCurrency(estimate.total);

      const safeText = (val, fallback = 'Not specified') => (val && val.trim() ? val.trim() : fallback);

      const detailPairs = [
        ['Home Type', estimate.homeLabel],
        ['Distance Bracket', estimate.distanceLabel],
        ['Moving Date', `${moveDateInput.value} (${timeWindowInput.value})`],
        ['Contact', `${estNameInput.value.trim()} • ${estEmailInput.value.trim()}`],
        ['Phone', estPhoneInput.value.trim()],
        ['Neighborhoods', safeText(estRouteInput.value)]
      ];

      if (estNotesInput.value.trim()) {
        detailPairs.push(['Access Notes', estNotesInput.value.trim()]);
      }

      summaryDetailsGrid.innerHTML = detailPairs
        .map(([label, value]) => {
          const div = document.createElement('div');
          div.className = 'summary-detail-item';
          const span = document.createElement('span');
          span.textContent = label;
          const strong = document.createElement('strong');
          strong.textContent = value;
          div.append(span, strong);
          return div.outerHTML;
        })
        .join('');

      const lineItemsHTML = [
        `<li><span>Base relocation (${estimate.homeLabel})</span><span>${formatCurrency(estimate.baseFee)}</span></li>`,
        `<li><span>Transit distance (${estimate.distanceLabel})</span><span>+${formatCurrency(estimate.distanceFee)}</span></li>`,
        ...estimate.itemLines.map(
          (line) => `<li><span>${line.qty} × ${line.label} (${formatCurrency(line.unitRate)}/ea)</span><span>+${formatCurrency(line.subtotal)}</span></li>`
        ),
        ...estimate.extraLines.map(
          (extra) => `<li><span>Extra: ${extra.label}</span><span>+${formatCurrency(extra.fee)}</span></li>`
        ),
        `<li><span>Illustrative Estimated Total</span><span>${formatCurrency(estimate.total)}</span></li>`
      ];

      summaryLineList.innerHTML = lineItemsHTML.join('');

      form.hidden = true;
      summaryScreen.hidden = false;
      summaryScreen.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Applies typical item quantities based on currently selected home type.
     */
    function applyTypicalItemsForHome(homeKey) {
      const preset = PRICING_CONFIG.typicalPresets[homeKey] || PRICING_CONFIG.typicalPresets.studio;
      Object.entries(preset).forEach(([itemKey, qty]) => {
        const input = document.getElementById(`qty-${itemKey}`);
        if (input) input.value = String(qty);
      });
      renderLiveBreakdown();
    }

    /**
     * Resets item quantities to 0.
     */
    function clearAllItems() {
      Object.keys(PRICING_CONFIG.items).forEach((itemKey) => {
        const input = document.getElementById(`qty-${itemKey}`);
        if (input) input.value = '0';
      });
      renderLiveBreakdown();
    }

    // Event: Home Type, Distance, Extra Services instant live recalculation
    form.addEventListener('change', (event) => {
      if (event.target.matches('input[name="homeType"], input[name="distance"], input[name="extras"]')) {
        renderLiveBreakdown();
      }
      if (event.target === estDemoAckInput) {
        setFieldError(estDemoAckInput, document.getElementById('estDemoAckError'), '');
      }
    });

    // Event: Quantity +/- buttons
    form.addEventListener('click', (event) => {
      const btn = event.target.closest('.qty-btn');
      if (!btn) return;

      const itemKey = btn.dataset.item;
      const action = btn.dataset.action;
      const input = document.getElementById(`qty-${itemKey}`);
      const meta = PRICING_CONFIG.items[itemKey];
      if (!input || !meta) return;

      const currentVal = parseInt(input.value, 10) || 0;
      const nextVal = action === 'increment'
        ? Math.min(meta.max, currentVal + 1)
        : Math.max(0, currentVal - 1);

      input.value = String(nextVal);
      renderLiveBreakdown();
    });

    // Event: Direct numeric quantity typing
    form.addEventListener('input', (event) => {
      const target = event.target;
      if (target.classList.contains('qty-input')) {
        const itemKey = target.id.replace('qty-', '');
        const meta = PRICING_CONFIG.items[itemKey];
        if (!meta) return;
        let val = parseInt(target.value, 10);
        if (Number.isNaN(val) || val < 0) val = 0;
        if (val > meta.max) val = meta.max;
        target.value = String(val);
        renderLiveBreakdown();
      }

      // Clear Step 5 field errors while typing
      const errorMap = {
        moveDate: 'moveDateError',
        estName: 'estNameError',
        estEmail: 'estEmailError',
        estPhone: 'estPhoneError'
      };
      if (errorMap[target.id]) {
        setFieldError(target, document.getElementById(errorMap[target.id]), '');
      }
    });

    // Event: Quick helper buttons in Step 3
    document.getElementById('prefillTypicalBtn')?.addEventListener('click', () => {
      const state = readEstimatorState();
      applyTypicalItemsForHome(state.homeType);
    });

    document.getElementById('clearItemsBtn')?.addEventListener('click', clearAllItems);

    // Event: Step navigation buttons
    prevBtn?.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });

    nextBtn?.addEventListener('click', () => {
      if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
    });

    // Event: Clickable progress pills
    stepPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetStep = Number(pill.dataset.stepTarget);
        goToStep(targetStep);
      });
    });

    // Event: Final Step Submit -> Summary Screen
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (validateStepFive()) {
        showSummaryScreen();
      }
    });

    // Event: Summary actions
    document.getElementById('editEstimateBtn')?.addEventListener('click', () => {
      goToStep(5);
    });

    document.getElementById('printSummaryBtn')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('resetEstimateBtn')?.addEventListener('click', () => {
      form.reset();
      if (moveDateInput) moveDateInput.value = getTodayISO();
      // Reset to Studio starter defaults
      applyTypicalItemsForHome('studio');
      goToStep(1);
    });

    // Event: Service Card Preset Triggers ("Estimate a home move ->")
    document.querySelectorAll('.preset-trigger').forEach((link) => {
      link.addEventListener('click', () => {
        const presetHome = link.dataset.preset;
        const radio = form.querySelector(`input[name="homeType"][value="${presetHome}"]`);
        if (radio) {
          radio.checked = true;
          applyTypicalItemsForHome(presetHome);
          goToStep(1);
        }
      });
    });

    // Initial render
    goToStep(1);
    renderLiveBreakdown();
  }

  /* ========================================================================
     5. Accessible FAQ Accordion
     ======================================================================== */
  function initFaqAccordion() {
    const accordion = document.getElementById('faqAccordion');
    if (!accordion) return;

    const triggers = Array.from(accordion.querySelectorAll('.faq-trigger'));

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const panelId = trigger.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;

        trigger.setAttribute('aria-expanded', String(!isExpanded));
        if (panel) panel.hidden = isExpanded;
      });

      trigger.addEventListener('keydown', (event) => {
        let nextIndex = null;
        if (event.key === 'ArrowDown') nextIndex = (index + 1) % triggers.length;
        if (event.key === 'ArrowUp') nextIndex = (index - 1 + triggers.length) % triggers.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = triggers.length - 1;

        if (nextIndex !== null) {
          event.preventDefault();
          triggers[nextIndex].focus();
        }
      });
    });
  }

  /* ========================================================================
     6. Demo Contact Enquiry Form with Validation
     ======================================================================== */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const successPanel = document.getElementById('contactSuccess');
    const successName = document.getElementById('contactSuccessName');
    const successTopic = document.getElementById('contactSuccessTopic');
    const resetBtn = document.getElementById('resetContactBtn');
    if (!form || !successPanel) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const topicInput = document.getElementById('contactTopic');
    const msgInput = document.getElementById('contactMessage');

    const fields = [
      {
        input: nameInput,
        errorEl: document.getElementById('contactNameError'),
        validate: () => VALIDATORS.minText(nameInput.value, 2),
        msg: 'Please enter your name (at least 2 characters).'
      },
      {
        input: emailInput,
        errorEl: document.getElementById('contactEmailError'),
        validate: () => VALIDATORS.email(emailInput.value),
        msg: 'Please enter a valid email address.'
      },
      {
        input: topicInput,
        errorEl: document.getElementById('contactTopicError'),
        validate: () => Boolean(topicInput.value.trim()),
        msg: 'Please select an enquiry topic.'
      },
      {
        input: msgInput,
        errorEl: document.getElementById('contactMessageError'),
        validate: () => VALIDATORS.minText(msgInput.value, 10),
        msg: 'Please enter at least 10 characters for your demo message.'
      }
    ];

    fields.forEach(({ input, errorEl }) => {
      const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(eventType, () => setFieldError(input, errorEl, ''));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let isValid = true;
      let firstInvalid = null;

      fields.forEach(({ input, errorEl, validate, msg }) => {
        if (!validate()) {
          setFieldError(input, errorEl, msg);
          isValid = false;
          if (!firstInvalid) firstInvalid = input;
        } else {
          setFieldError(input, errorEl, '');
        }
      });

      if (!isValid) {
        firstInvalid?.focus();
        return;
      }

      if (successName) successName.textContent = nameInput.value.trim();
      if (successTopic) successTopic.textContent = topicInput.value;
      form.hidden = true;
      successPanel.hidden = false;
    });

    resetBtn?.addEventListener('click', () => {
      form.reset();
      fields.forEach(({ input, errorEl }) => setFieldError(input, errorEl, ''));
      successPanel.hidden = true;
      form.hidden = false;
      nameInput.focus();
    });
  }

  /* ========================================================================
     7. Lightweight Scroll-Reveal Animations
     ======================================================================== */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ========================================================================
     8. Initialize Modules
     ======================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initEstimator();
    initFaqAccordion();
    initContactForm();
    initScrollReveal();
  });
})();
