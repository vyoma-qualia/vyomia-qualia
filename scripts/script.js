(() => {
  const body = document.body;
  const toggle = document.getElementById('themeToggle');
  const hero = document.querySelector('.hero');
  const logo = document.getElementById('heroLogo');

  function applyTheme(theme){
    body.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
    localStorage.setItem('vq-theme', theme);
  }

  function updateHeroReveal(){
    if (!hero || !logo) return;

    const heroRect = hero.getBoundingClientRect();
    const rawProgress = Math.max(0, Math.min(1, 1 - heroRect.top / window.innerHeight));
    const progress = rawProgress < 0.5 ? rawProgress * rawProgress * 2 : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

    logo.style.opacity = String(0.08 + progress * 0.92);
    logo.style.transform = `translateY(${(1 - progress) * 48}px) scale(${0.95 + progress * 0.05})`;
    logo.style.filter = `brightness(${0.06 + progress * 0.94})`;

    body.style.background = `linear-gradient(180deg, #000000 0%, rgba(0,0,0,${1 - progress}) 50%, rgba(255,255,255,${progress}) 100%)`;
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(current);
    });
  }

  window.addEventListener('scroll', updateHeroReveal, { passive: true });
  window.addEventListener('resize', updateHeroReveal);

  const saved = localStorage.getItem('vq-theme');
  const initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(initial);
  updateHeroReveal();
})();
