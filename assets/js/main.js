(() => {
  'use strict';

  /* ---------------------------------------------------------------
     SELECTED WORK
     Put your photos in assets/images/ and list them below. The "Work"
     section and its menu link appear automatically once this list has
     at least one entry. Example:

       { src: 'assets/images/work-01.jpg', alt: 'What the photo shows', caption: 'Optional caption' },
     --------------------------------------------------------------- */
  const WORK = [];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Footer year */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Header border on scroll + mobile menu */
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const nav = $('#nav');

  const onScroll = () => { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* Reveal on scroll */
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  const reveal = (el) => { if (observer) observer.observe(el); else el.classList.add('in'); };
  $$('.reveal').forEach(reveal);

  /* Gallery + lightbox (only when WORK has entries) */
  const workSection = $('#work');
  const grid = $('#gallery');
  const box = $('#lightbox');

  if (workSection && grid && box && WORK.length) {
    const boxImg = $('img', box);
    const boxCap = $('.lb-cap', box);
    let current = 0;

    const show = (i) => {
      current = (i + WORK.length) % WORK.length;
      const item = WORK[current];
      boxImg.src = item.src;
      boxImg.alt = item.alt || '';
      boxCap.textContent = item.caption || '';
    };
    const open = (i) => { show(i); if (!box.open) box.showModal(); };

    WORK.forEach((item, i) => {
      const fig = document.createElement('figure');
      fig.className = 'shot reveal';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'View larger: ' + (item.alt || 'photo ' + (i + 1)));
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      btn.append(img);
      fig.append(btn);
      grid.append(fig);
      btn.addEventListener('click', () => open(i));
      reveal(fig);
    });

    $('.lb-close', box).addEventListener('click', () => box.close());
    $('.lb-prev', box).addEventListener('click', () => show(current - 1));
    $('.lb-next', box).addEventListener('click', () => show(current + 1));
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    workSection.hidden = false;
    $$('[data-work]').forEach((a) => { a.hidden = false; });
  }

  /* Pre-select the session type when a service card is clicked */
  const typeSelect = $('#session-type');
  $$('[data-service]').forEach((a) => {
    a.addEventListener('click', () => { if (typeSelect) typeSelect.value = a.dataset.service; });
  });

  /* Inquiry form — sent to the owner's inbox through Web3Forms (see the access_key field in index.html) */
  const form = $('#inquiry-form');
  if (form && /^YOUR_/.test(form.elements.access_key.value)) {
    // No Web3Forms key yet: show a notice instead of a form that can't deliver
    form.hidden = true;
    const pending = $('#form-pending');
    if (pending) pending.hidden = false;
  } else if (form) {
    const status = $('#form-status');
    const done = $('#form-done');
    const button = $('button[type="submit"]', form);
    const label = button.textContent;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      button.disabled = true;
      button.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || 'HTTP ' + res.status);
        form.hidden = true;
        done.hidden = false;
        done.focus();
      } catch (err) {
        status.textContent = 'Sorry, something went wrong and your inquiry was not sent. Please try again in a moment.';
        button.disabled = false;
        button.textContent = label;
      }
    });
  }
})();
