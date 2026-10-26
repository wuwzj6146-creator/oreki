(() => {
  const mobileViewport = window.matchMedia('(max-width: 768px)');
  const storageKey = 'oreki-mobile-notice-dismissed';

  if (!mobileViewport.matches) return;

  try {
    if (sessionStorage.getItem(storageKey) === 'true') return;
  } catch (_) {
    // The notice still works when storage is unavailable.
  }

  const style = document.createElement('style');
  style.textContent = `
    html.mobile-notice-open,
    html.mobile-notice-open body {
      overflow: hidden;
    }

    .mobile-browser-notice {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(10, 15, 41, .94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      opacity: 0;
      transition: opacity 220ms ease;
    }

    .mobile-browser-notice.is-visible {
      opacity: 1;
    }

    .mobile-browser-notice.is-closing {
      opacity: 0;
    }

    .mobile-browser-notice__card {
      position: relative;
      width: min(100%, 420px);
      overflow: hidden;
      padding: 34px 28px 28px;
      border: 2px solid #ff9b8d;
      border-radius: 24px;
      background: #f7f3ec;
      color: #191f3a;
      box-shadow: 0 24px 70px rgba(0, 0, 0, .35);
      transform: translateY(14px) rotate(-1deg);
      transition: transform 260ms cubic-bezier(.2, .8, .2, 1);
    }

    .mobile-browser-notice.is-visible .mobile-browser-notice__card {
      transform: translateY(0) rotate(-1deg);
    }

    .mobile-browser-notice__card::after {
      position: absolute;
      top: -42px;
      right: -36px;
      width: 112px;
      height: 112px;
      border-radius: 50%;
      background: #ff9b8d;
      content: '';
      opacity: .9;
    }

    .mobile-browser-notice__label {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      margin: 0 0 22px;
      padding: 5px 11px;
      border-radius: 999px;
      background: #191f3a;
      color: #f7f3ec;
      font: 700 12px/1.2 "PingFang SC", "Microsoft YaHei", sans-serif;
      letter-spacing: .08em;
    }

    .mobile-browser-notice h2 {
      max-width: 9em;
      margin: 0;
      font: 800 clamp(28px, 8vw, 38px)/1.12 "PingFang SC", "Microsoft YaHei", sans-serif;
      letter-spacing: -.04em;
    }

    .mobile-browser-notice p {
      margin: 18px 0 28px;
      color: #62677a;
      font: 500 15px/1.8 "PingFang SC", "Microsoft YaHei", sans-serif;
    }

    .mobile-browser-notice button {
      width: 100%;
      min-height: 52px;
      border: 0;
      border-radius: 14px;
      background: #ce3f8a;
      color: #fff;
      font: 800 16px/1 "PingFang SC", "Microsoft YaHei", sans-serif;
      box-shadow: 0 10px 24px rgba(206, 63, 138, .28);
      cursor: pointer;
    }

    .mobile-browser-notice button:active {
      transform: translateY(1px);
    }

    .mobile-browser-notice button:focus-visible {
      outline: 3px solid #191f3a;
      outline-offset: 4px;
    }

    @media (min-width: 769px) {
      .mobile-browser-notice {
        display: none !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .mobile-browser-notice,
      .mobile-browser-notice__card {
        transition: none;
      }
    }
  `;

  const notice = document.createElement('div');
  notice.className = 'mobile-browser-notice';
  notice.setAttribute('role', 'dialog');
  notice.setAttribute('aria-modal', 'true');
  notice.setAttribute('aria-labelledby', 'mobile-browser-notice-title');
  notice.setAttribute('tabindex', '-1');
  notice.innerHTML = `
    <section class="mobile-browser-notice__card">
      <span class="mobile-browser-notice__label">移动端提示</span>
      <h2 id="mobile-browser-notice-title">建议使用电脑浏览</h2>
      <p>本网站包含横向滚动、动态效果与大幅作品展示，使用电脑可以获得更完整的浏览体验。</p>
      <button type="button">仍然访问</button>
    </section>
  `;

  const continueButton = notice.querySelector('button');
  const previousFocus = document.activeElement;

  const dismiss = () => {
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch (_) {
      // Dismissal still works when storage is unavailable.
    }

    notice.classList.add('is-closing');
    document.documentElement.classList.remove('mobile-notice-open');
    window.setTimeout(() => {
      notice.remove();
      style.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220);
  };

  continueButton.addEventListener('click', dismiss);
  notice.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dismiss();
    if (event.key === 'Tab') {
      event.preventDefault();
      continueButton.focus();
    }
  });

  document.head.append(style);
  document.documentElement.classList.add('mobile-notice-open');
  document.body.append(notice);
  requestAnimationFrame(() => {
    notice.classList.add('is-visible');
    notice.focus({ preventScroll: true });
  });
})();
