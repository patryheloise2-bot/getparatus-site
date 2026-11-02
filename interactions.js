(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = document.querySelector('.opening-scene');
  const phoneStage = document.querySelector('.hero-visual');
  const timeline = document.getElementById('interactive-timeline');
  const timelineItems = [...document.querySelectorAll('.timeline-item')];
  const revealItems = document.querySelectorAll('.reveal');
  const appStoreMeta = document.querySelector('meta[name="paratus-app-store-url"]');
  const appStoreUrl = appStoreMeta?.content.trim() ?? '';

  // No invented App Store links. Once the official URL is known, adding it to
  // the meta tag turns every pre-release CTA into a real download link.
  if (/^https:\/\/apps\.apple\.com\//i.test(appStoreUrl)) {
    document.querySelectorAll('[data-appstore]').forEach((link) => {
      link.href = appStoreUrl;
      link.textContent = 'Télécharger sur l’App Store ↗';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  let scrollScheduled = false;
  function updateScroll() {
    scrollScheduled = false;
    if (!scene || !timeline || reduceMotion.matches) return;
    const viewport = window.innerHeight || 800;
    const rect = scene.getBoundingClientRect();
    const sceneProgress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - viewport * .45)));
    scene.style.setProperty('--scene-progress', sceneProgress.toFixed(3));
    scene.style.setProperty('--scene-offset', `${Math.round(600 - sceneProgress * 600)}`);
    scene.style.setProperty('--phone-shift', `${Math.round(-sceneProgress * 45)}px`);

    const tlRect = timeline.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (viewport * .86 - tlRect.top) / Math.max(1, tlRect.height + viewport * .5)));
    timeline.style.setProperty('--rail-fill', `${Math.round(8 + 92 * progress)}%`);
  }
  function requestScrollUpdate() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  requestScrollUpdate();

  // Interactive timeline: changes the chosen task only; never checks or
  // modifies a real task. The labels match the marketing artwork.
  timelineItems.forEach((item) => item.addEventListener('click', () => {
    timelineItems.forEach((other) => {
      const selected = other === item;
      other.classList.toggle('is-active', selected);
      other.setAttribute('aria-pressed', String(selected));
    });
    if (!reduceMotion.matches && timeline) {
      const idx = Number(item.dataset.moment || 0);
      const progress = (idx + 1) / timelineItems.length;
      timeline.style.setProperty('--rail-fill', `${Math.round(8 + progress * 92)}%`);
    }
  }));

  // Very slight device tilt, only on hover-capable pointers.
  if (phoneStage && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion.matches) {
    phoneStage.addEventListener('pointermove', (e) => {
      const r = phoneStage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      phoneStage.style.setProperty('--phone-y', `${(x * 7).toFixed(2)}deg`);
      phoneStage.style.setProperty('--phone-x', `${(-y * 5).toFixed(2)}deg`);
    });
    phoneStage.addEventListener('pointerleave', () => {
      phoneStage.style.setProperty('--phone-y', '0deg');
      phoneStage.style.setProperty('--phone-x', '0deg');
    });
  }

  const modal = document.getElementById('video-modal');
  const dialog = modal?.querySelector('.video-dialog');
  const video = document.getElementById('promo-video');
  const closeButton = modal?.querySelector('.video-close');
  let priorFocus = null;
  let priorOverflow = '';
  function openVideo() {
    if (!modal || !video) return;
    priorFocus = document.activeElement;
    priorOverflow = document.body.style.overflow;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    dialog?.focus();
    // User click required. Do not autoplay video on scroll.
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }
  function closeVideo() {
    if (!modal) return;
    video?.pause();
    modal.hidden = true;
    document.body.style.overflow = priorOverflow;
    if (priorFocus && typeof priorFocus.focus === 'function') priorFocus.focus();
  }
  document.querySelectorAll('[data-open-video]').forEach((button) => button.addEventListener('click', openVideo));
  document.querySelectorAll('[data-close-video]').forEach((button) => button.addEventListener('click', closeVideo));
  document.addEventListener('keydown', (e) => {
    if (modal?.hidden !== false) return;
    if (e.key === 'Escape') closeVideo();
    if (e.key !== 'Tab') return;
    const focusables = [...modal.querySelectorAll('button:not([disabled]), a[href], video[controls]')];
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
