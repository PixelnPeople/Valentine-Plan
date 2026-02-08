// script.js
// Lightweight script for the splash screen.
// Currently minimal — kept for future interactions and progressive enhancements.

document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('.splash-title');
  const splash = document.querySelector('.splash-card');
  const main = document.querySelector('.main-screen');

  if (title) {
    console.debug('Splash ready:', title.textContent.trim());
  }

  // Tab system
  function initializeTabs() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) return;

    const tabs = Array.from(tabsContainer.querySelectorAll('.tab'));
    const underline = tabsContainer.querySelector('.tab-underline');
    const panels = Array.from(document.querySelectorAll('.tab-panel'));

    function updateUnderline(el) {
      const rect = el.getBoundingClientRect();
      const containerRect = tabsContainer.getBoundingClientRect();
      const left = rect.left - containerRect.left;
      const width = rect.width;
      tabsContainer.style.setProperty('--underline-left', `${left}px`);
      tabsContainer.style.setProperty('--underline-width', `${width}px`);
    }

    function activateTab(tabEl, setFocus = false) {
      // Temporarily disable card animations to avoid glitches during tab switch
      document.body.classList.add('disable-card-anim');

      // Standard tab activation (instant switch)
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tabEl.setAttribute('aria-selected', 'true');
      if (setFocus) tabEl.focus();

      const target = tabEl.getAttribute('data-tab');
      panels.forEach(p => {
        // Show target panel, hide others instantly
        p.hidden = p.getAttribute('data-panel') !== target;
        // ensure animation classes aren't left on panels
        p.classList.remove('anim-in', 'anim-out');
      });

      updateUnderline(tabEl);

      // Re-enable card animations shortly after the switch
      setTimeout(() => {
        document.body.classList.remove('disable-card-anim');
      }, 80);
    }

    // Initial activation (first tab with aria-selected=true)
    const initial = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    activateTab(initial, false);

    // Click handlers
    tabs.forEach(tab => {
      tab.addEventListener('click', () => activateTab(tab, false));
      tab.addEventListener('keydown', (e) => {
        // Left/Right arrow navigation
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const idx = tabs.indexOf(tab);
          const nextIdx = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
          activateTab(tabs[nextIdx], true);
        }
      });
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
      const active = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
      updateUnderline(active);
    });
  }

  // After 2 seconds, transition from the splash to the main planner screen.
  // Sequence:
  // 1. Add .exit to splash to trigger fade-out + slide-up
  // 2. When splash animation ends, mark it hidden and show main screen with fade-in
  const TRANSITION_DELAY = 2000; // ms
  const SPLASH_EXIT_ANIM_TIME = 600; // matches CSS

  setTimeout(() => {
    if (splash) {
      splash.classList.add('exit');
      // After the exit animation completes, hide the splash and reveal main
      setTimeout(() => {
        // hide splash visually and from assistive tech
        splash.setAttribute('aria-hidden', 'true');
        // remove splash-active state so page layout/padding returns to normal
        document.body.classList.remove('splash-active');
        splash.style.display = 'none';

        if (main) {
          main.setAttribute('aria-hidden', 'false');
          main.classList.add('show');
          // initialize tabs once main is visible so measurements are correct
          initializeTabs();
        }
      }, SPLASH_EXIT_ANIM_TIME);
    } else if (main) {
      // Fallback: if no splash, just show main and init tabs
      main.classList.add('show');
      initializeTabs();
    }
  }, TRANSITION_DELAY);

  // --- Modal component logic ---
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalSheet = modalOverlay && modalOverlay.querySelector('.modal-sheet');
  const modalTitle = modalOverlay && modalOverlay.querySelector('.modal-title');
  const modalClose = modalOverlay && modalOverlay.querySelector('.modal-close');
  const modalDone = modalOverlay && modalOverlay.querySelector('.modal-done');
  const modalBody = modalOverlay && modalOverlay.querySelector('.modal-body .modal-list');
  let lastFocused = null;

  function openModal(titleText, triggerBtn) {
    if (!modalOverlay) return;
    lastFocused = triggerBtn || document.activeElement;
    if (modalTitle) modalTitle.textContent = titleText;
    // keep existing list content or populate as needed
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    // focus the close button for keyboard users
    setTimeout(() => { if (modalClose) modalClose.focus(); }, 120);
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // --- Selection data for all categories ---
  const CATEGORIES = {
    together_movie_time: {
      title: 'Movie Time',
      items: ['Before Sunrise','La La Land','The Notebook','About Time','Jab We Met','Yeh Jawaani Hai Deewani']
    },
    together_cook_together: {
      title: 'Cook Together',
      items: ['Pasta Alfredo','Homemade Pizza','Chocolate Fondue','Pancakes & Berries','Sushi Rolls','Garlic Bread & Dip']
    },
    together_outdoor_activity: {
      title: 'Outdoor Activity',
      items: ['Sunset Walk','Picnic in the Park','Long Drive','Cafe Hopping','Beach Walk','Morning Tea Date']
    },
    together_spa_time: {
      title: 'Spa Time',
      items: ['Couple Massage','Aromatherapy Session','Hot Shower + Music','Face Mask & Chill','Foot Massage','Oil Head Massage']
    },
    virtual_watch_together: {
      title: 'Watch Together',
      items: ['Netflix Party Movie','Late-night YouTube Watch','Anime Episode Together','Old Movie Rewatch','Comfort Movie Call','Series First Episode']
    },
    virtual_order_dinner: {
      title: 'Order Dinner',
      items: ['Pizza Surprise','Dessert Delivery','Coffee & Cake','Comfort Indian Meal','Midnight Snack','Breakfast Order']
    },
    virtual_game_night: {
      title: 'Game Night',
      items: ['Truth or Dare','Online Ludo','Quiz About Us','Would You Rather','Guess the Song','Online Card Game']
    },
    virtual_love_letter: {
      title: 'Love Letter / Message',
      items: ['Long Love Email','Voice Note Message','WhatsApp Letter','Instagram DM Note','Old Memories Text','Gratitude Message']
    },
    metime_movie_marathon: {
      title: 'Movie Marathon',
      items: ['Rom-com Night','Comfort Movie','Studio Ghibli Film','Old Bollywood','Feel-Good Movie','Sad → Happy Movie']
    },
    metime_self_care_spa: {
      title: 'Self-Care Spa',
      items: ['Face Mask Routine','Hair Care Day','Long Shower','Skincare Reset','Body Massage','Nail Care']
    },
    metime_indulgent_treat: {
      title: 'Indulgent Treat',
      items: ['Chocolate Box','Ice Cream Tub','Wine / Mocktail','Cheesecake Slice','Cookies & Milk','Favorite Snack']
    },
    metime_manifest_reflect: {
      title: 'Manifest & Reflect',
      items: ['Write 5 Gratitudes','Letter to Self','Vision for Love','Journaling Session','Quiet Music + Notes','10-minute Reflection']
    }
  };

  // store selected items per category
  const selectedPlan = {};
  // initialize empty arrays
  Object.keys(CATEGORIES).forEach(k => selectedPlan[k] = []);

  let currentCategory = null;

  function updateCardCount(catKey) {
    // Intentionally left blank to remove numeric selection labels from cards.
    // Selection is indicated visually via pills, checkmark, and border color.
    return;
  }

  function renderModalForCategory(catKey) {
    if (!modalBody) return;
    currentCategory = catKey;
    const data = CATEGORIES[catKey];
    if (!data) return;
    if (modalTitle) modalTitle.textContent = data.title;
    modalBody.innerHTML = '';
    data.items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'modal-item';
      itemEl.tabIndex = 0;
      itemEl.textContent = item;
      itemEl.dataset.value = item;
      const isSelected = selectedPlan[catKey] && selectedPlan[catKey].includes(item);
      if (isSelected) {
        itemEl.classList.add('selected');
        const ck = document.createElement('span');
        ck.className = 'check';
        ck.textContent = '✓';
        itemEl.appendChild(ck);
      }
      itemEl.addEventListener('click', () => {
        toggleSelection(catKey, item, itemEl);
      });
      itemEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSelection(catKey, item, itemEl);
        }
      });
      modalBody.appendChild(itemEl);
    });
    // Add "Add your choice" entry at the end
    const addEl = document.createElement('div');
    addEl.className = 'modal-item add-choice';
    addEl.tabIndex = 0;
    const spanLabel = document.createElement('span');
    spanLabel.textContent = 'Add your choice';
    const plus = document.createElement('span');
    plus.className = 'plus';
    plus.textContent = '+';
    addEl.appendChild(spanLabel);
    addEl.appendChild(plus);
    modalBody.appendChild(addEl);

    function showAddInput() {
      // Replace addEl content with input + add button
      addEl.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'modal-add-input';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Type your choice';
      input.autocapitalize = 'off';
      input.autocomplete = 'off';
      input.spellcheck = false;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'modal-add-btn';
      btn.textContent = 'Add';
      container.appendChild(input);
      container.appendChild(btn);
      addEl.appendChild(container);
      input.focus();

      function confirmAdd() {
        const val = input.value;
        if (!val) {
          // Cancel if empty: restore original
          restoreAddEl();
          return;
        }
        // Create a new modal item for this custom choice and mark selected
        const newItem = document.createElement('div');
        newItem.className = 'modal-item';
        newItem.tabIndex = 0;
        newItem.textContent = val;
        newItem.dataset.value = val;
        // attach same handlers
        newItem.addEventListener('click', () => toggleSelection(catKey, val, newItem));
        newItem.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSelection(catKey, val, newItem);
          }
        });
        // insert before addEl
        modalBody.insertBefore(newItem, addEl);
        // immediately select it
        toggleSelection(catKey, val, newItem);
        // restore addEl to original state
        restoreAddEl();
      }

      function restoreAddEl() {
        addEl.innerHTML = '';
        addEl.appendChild(spanLabel);
        addEl.appendChild(plus);
      }

      btn.addEventListener('click', confirmAdd);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); confirmAdd(); }
        if (e.key === 'Escape') { e.preventDefault(); restoreAddEl(); }
      });
      // clicking outside the input but on addEl won't close — acceptable per spec
    }

    addEl.addEventListener('click', () => {
      showAddInput();
    });
    // Only trigger add input when the addEl itself is focused (ignore events from the inner input)
    addEl.addEventListener('keydown', (e) => {
      if (e.target !== addEl) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showAddInput(); }
    });
  }

  function toggleSelection(catKey, item, el) {
    const arr = selectedPlan[catKey];
    const idx = arr.indexOf(item);
    if (idx === -1) {
      arr.push(item);
      el.classList.add('selected');
      const ck = document.createElement('span');
      ck.className = 'check';
      ck.textContent = '✓';
      el.appendChild(ck);
    } else {
      arr.splice(idx, 1);
      el.classList.remove('selected');
      const ck = el.querySelector('.check');
      if (ck) ck.remove();
    }
    // soft animation feedback
    el.animate([{ transform: 'scale(0.995)' }, { transform: 'scale(1)' }], { duration: 120 });
    // update card pills live while modal open
    updateCardPills(catKey);
  }

  // render pills and visual state on the corresponding card
  function updateCardPills(catKey) {
    const selected = selectedPlan[catKey] || [];
    // find card by button data-category
    const btn = document.querySelector(`.card-button[data-category="${catKey}"]`);
    if (!btn) return;
    const card = btn.closest('.card');
    if (!card) return;
    const cardContent = card.querySelector('.card-content');
    if (!cardContent) return;

    // ensure pill container exists
    let pillsContainer = cardContent.querySelector('.card-pills');
    if (!pillsContainer) {
      pillsContainer = document.createElement('div');
      pillsContainer.className = 'card-pills';
      // insert before the card-meta element if present, otherwise before the button
      const meta = cardContent.querySelector('.card-meta');
      if (meta) cardContent.insertBefore(pillsContainer, meta);
      else {
        const btnEl = cardContent.querySelector('.card-button');
        cardContent.insertBefore(pillsContainer, btnEl);
      }
    }

    // clear and populate up to 3 pills
    pillsContainer.innerHTML = '';
    const maxVisible = 3;
    selected.slice(0, maxVisible).forEach(name => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = name;
      pillsContainer.appendChild(pill);
    });
    if (selected.length > maxVisible) {
      const more = document.createElement('span');
      more.className = 'pill more-pill';
      more.textContent = `+${selected.length - maxVisible} more`;
      pillsContainer.appendChild(more);
    }

    // update selected count too
    updateCardCount(catKey);

    // toggle card selected visuals
    if (selected.length > 0) {
      card.classList.add('card-selected');
      // add checkmark if missing
      if (!card.querySelector('.selected-check')) {
        const chk = document.createElement('div');
        chk.className = 'selected-check';
        chk.textContent = '✓';
        card.appendChild(chk);
      }
    } else {
      card.classList.remove('card-selected');
      const chk = card.querySelector('.selected-check');
      if (chk) chk.remove();
      // remove pills container if empty
      if (pillsContainer) pillsContainer.innerHTML = '';
    }
  }

  // attach to card buttons (open modal and render correct data)
  document.querySelectorAll('.card-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = btn.dataset.category;
      if (cat && CATEGORIES[cat]) {
        renderModalForCategory(cat);
        openModal(CATEGORIES[cat].title, btn);
      } else {
        openModal(btn.textContent.trim() || 'Options', btn);
      }
    });
  });

  // when Done clicked, persist selections and update card counts, then close
  if (modalDone) {
    modalDone.addEventListener('click', () => {
      if (currentCategory) {
        updateCardPills(currentCategory);
        updateCardCount(currentCategory);
      }
      closeModal();
    });
  }

  // overlay interaction
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // --- Final screen logic ---
  const finalizeBtn = document.getElementById('finalizeBtn');
  const finalScreen = document.querySelector('.final-screen');
  const finalInner = finalScreen && finalScreen.querySelector('.final-screen-inner');
  const finalSections = finalScreen && finalScreen.querySelector('.final-sections');
  const finalEnding = finalScreen && finalScreen.querySelector('.final-ending');
  const finalActions = finalScreen && finalScreen.querySelector('.final-actions');
  const saveBtn = document.getElementById('savePlanBtn');
  const shareBtn = document.getElementById('sharePlanBtn');

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) return resolve(window.html2canvas);
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => resolve(window.html2canvas);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function showFinalScreen() {
    // collect selections
    const entries = Object.entries(selectedPlan).filter(([k, arr]) => Array.isArray(arr) && arr.length > 0);
    const hasAny = entries.length > 0;
    // clear previous
    finalSections.innerHTML = '';
    finalEnding.textContent = '';

    if (!hasAny) {
      // show waiting message and hide actions
      const msg = document.createElement('p');
      msg.className = 'muted';
      msg.textContent = 'Your plan is waiting to be created 💗';
      finalSections.appendChild(msg);
      finalActions.classList.add('hidden');
    } else {
      finalActions.classList.remove('hidden');
      // Build sections based on mapping rules
      const mappingHead = {
        metime_movie_marathon: 'Includes you having movie marathon',
        together_movie_time: 'Includes you both watching movies together',
        virtual_watch_together: 'Includes a virtual watch date',
        metime_self_care_spa: 'Doing self care with',
        together_spa_time: 'Relaxing together with',
        metime_indulgent_treat: 'Treating yourself with',
        together_cook_together: 'Treating each other with'
      };

      // Render a section for each selected category
      entries.forEach(([cat, arr]) => {
        const heading = mappingHead[cat] || `Includes ${CATEGORIES[cat]?.title || cat}`;
        const section = document.createElement('div');
        section.className = 'final-section';
        const h = document.createElement('h4');
        h.textContent = heading;
        section.appendChild(h);
        // pills for each item (no limit)
        const wrap = document.createElement('div');
        wrap.className = 'final-pills';
        arr.forEach(it => {
          const p = document.createElement('span');
          p.className = 'pill';
          p.textContent = it;
          wrap.appendChild(p);
        });
        section.appendChild(wrap);
        finalSections.appendChild(section);
      });

      // Manifesting & Reflecting items always show (heading removed per spec)
      const manifestSection = document.createElement('div');
      manifestSection.className = 'final-section';
      const manifestWrap = document.createElement('div');
      manifestWrap.className = 'final-pills';
      const manifestItems = selectedPlan['metime_manifest_reflect'] || [];
      manifestItems.forEach(it => {
        const p = document.createElement('span');
        p.className = 'pill';
        p.textContent = it;
        manifestWrap.appendChild(p);
      });
      manifestSection.appendChild(manifestWrap);
      finalSections.appendChild(manifestSection);

      // Determine ending line
      const hasTogether = Object.keys(selectedPlan).some(k => k.startsWith('together_') && selectedPlan[k].length > 0);
      const hasMetime = Object.keys(selectedPlan).some(k => k.startsWith('metime_') && selectedPlan[k].length > 0);
      const hasVirtual = Object.keys(selectedPlan).some(k => k.startsWith('virtual_') && selectedPlan[k].length > 0);

      let ending = '';
      if (hasTogether) ending = 'Enjoy with your partner 💕';
      else if (hasMetime && !hasVirtual) ending = 'Enjoy your Valentine’s Day 💗';
      else if (hasVirtual && !hasMetime) ending = 'Love knows no distance 💞';
      else if (hasMetime && hasVirtual) ending = 'Enjoy your Valentine’s Day 💗';
      finalEnding.textContent = ending;
    }

    // show screen with animations
    finalScreen.classList.add('show');
    finalScreen.setAttribute('aria-hidden', 'false');
    // stagger sections
    const secs = Array.from(finalSections.querySelectorAll('.final-section'));
    secs.forEach((s, i) => {
      setTimeout(() => s.classList.add('show'), i * 80);
    });
  }

  function closeFinalScreen() {
    if (!finalScreen) return;
    // start fade-out
    finalScreen.classList.remove('show');
    // after transition finishes, hide for assistive tech and restore focus
    setTimeout(() => {
      finalScreen.setAttribute('aria-hidden', 'true');
      if (finalizeBtn && typeof finalizeBtn.focus === 'function') finalizeBtn.focus();
    }, 320);
  }

  // Save as image using html2canvas
  async function savePlanImage() {
    // UI feedback while saving
    const savingToast = document.createElement('div');
    savingToast.textContent = 'Preparing image...';
    savingToast.style.position = 'fixed';
    savingToast.style.left = '50%';
    savingToast.style.top = '12px';
    savingToast.style.transform = 'translateX(-50%)';
    savingToast.style.background = 'rgba(0,0,0,0.7)';
    savingToast.style.color = '#fff';
    savingToast.style.padding = '8px 12px';
    savingToast.style.borderRadius = '8px';
    savingToast.style.zIndex = 9999;
    document.body.appendChild(savingToast);

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      const card = document.querySelector('.final-card');
      if (!card) throw new Error('Final card element not found');

      // Try to find the html2canvas function on globals
      const runner = window.html2canvas || window['html2canvas'] || globalThis.html2canvas || null;
      if (!runner) throw new Error('html2canvas library not available');

      savingToast.textContent = 'Rendering image...';

      // Render with useCORS; allowTaint false to detect tainting
      const canvas = await runner(card, { scale: 2, useCORS: true, allowTaint: false });
      if (!canvas) throw new Error('Canvas rendering failed');

      savingToast.textContent = 'Downloading...';
      canvas.toBlob(blob => {
        if (!blob) {
          document.body.removeChild(savingToast);
          alert('Unable to create image blob.');
          return;
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'valentines-day-plan.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Clean up toast after a short delay
        setTimeout(() => {
          if (savingToast && savingToast.parentNode) savingToast.parentNode.removeChild(savingToast);
        }, 700);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      if (savingToast && savingToast.parentNode) savingToast.parentNode.removeChild(savingToast);
      // Provide a clearer error to the user about CORS or failures
      alert('Unable to save image. This may be due to cross-origin images (CORS). Try removing external images or use a different browser.');
    }
  }

  // Share using Web Share API if available
  async function sharePlan() {
    // Create & share the image, with graceful fallback to saving
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
      const card = document.querySelector('.final-card');
      if (!card) throw new Error('Final card not found');
      const runner = window.html2canvas || window['html2canvas'] || globalThis.html2canvas;
      if (!runner) throw new Error('html2canvas not available');

      const canvas = await runner(card, { scale: 2, useCORS: true, allowTaint: false });
      if (!canvas) throw new Error('Failed to render canvas');

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Unable to generate image for sharing.');
          return;
        }

        const file = new File([blob], 'valentines-day-plan.png', { type: 'image/png' });
        const shareData = { files: [file], text: "Here’s my Valentine’s Day plan 💗" };

        try {
          // Prefer canShare check when available
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share(shareData);
            return;
          }
          // Some platforms allow share without canShare; try anyway
          if (navigator.share) {
            await navigator.share(shareData);
            return;
          }
        } catch (err) {
          // fall through to save fallback
          console.warn('Web Share failed or not supported:', err);
        }

        // Fallback: save the image and notify the user
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = 'valentines-day-plan.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // revoke URL shortly after
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        alert('Image saved. Share it on Instagram 💕');
      }, 'image/png');
    } catch (err) {
      console.error(err);
      alert('Unable to share plan. Try saving instead.');
    }
  }

  if (finalizeBtn) finalizeBtn.addEventListener('click', showFinalScreen);
  if (saveBtn) saveBtn.addEventListener('click', savePlanImage);
  if (shareBtn) shareBtn.addEventListener('click', sharePlan);

  // Final screen close button
  const finalCloseBtn = document.querySelector('.final-close');
  if (finalCloseBtn) {
    finalCloseBtn.addEventListener('click', () => {
      closeFinalScreen();
    });
  }

});

