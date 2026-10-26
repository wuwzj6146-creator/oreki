(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let overlay = document.querySelector('.scene-transition');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'scene-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.append(overlay);
  }
  let timer = null;
  let navigating = false;
  function resetTransition() {
    clearTimeout(timer);
    timer = null;
    navigating = false;
    overlay.style.transition = 'none';
    overlay.classList.remove('is-opening');
    void overlay.offsetWidth;
    overlay.style.removeProperty('transition');
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-scene-link]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    if (reducedMotion.matches) return;
    event.preventDefault();
    if (navigating) return;
    navigating = true;
    const origin = event.target.closest('[data-scene-origin]') || link.querySelector('[data-scene-origin]') || link;
    const bounds = origin.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
    // Commit the zero-radius circle at the new origin before expanding it.
    // Otherwise CSS also interpolates its centre from the previous/default origin.
    overlay.style.transition = 'none';
    overlay.classList.remove('is-opening');
    overlay.style.setProperty('--scene-x', `${x}px`);
    overlay.style.setProperty('--scene-y', `${y}px`);
    overlay.style.setProperty('--scene-radius', `${radius}px`);
    void overlay.offsetWidth;
    overlay.style.removeProperty('transition');
    overlay.classList.add('is-opening');
    timer = window.setTimeout(() => window.location.assign(link.href), 680);
  });
  window.addEventListener('pageshow', event => {
    // Initial image loading must not cancel a transition already started by a click.
    if (event.persisted || !navigating) resetTransition();
  });
  window.addEventListener('pagehide', resetTransition);
})();
