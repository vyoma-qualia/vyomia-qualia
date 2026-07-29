(() => {
  const body = document.body;
  const hero = document.querySelector('.hero');
  const logo = document.getElementById('heroLogo');

  function updateHeroReveal(){
    if (!hero || !logo) return;

    const heroRect = hero.getBoundingClientRect();
    const rawProgress = Math.max(0, Math.min(1, 1 - heroRect.top / window.innerHeight));
    const progress = rawProgress < 0.5 ? rawProgress * rawProgress * 2 : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

    logo.style.opacity = String(0.08 + progress * 0.92);
    logo.style.transform = `translateY(${(1 - progress) * 48}px) scale(${0.95 + progress * 0.05})`;
    logo.style.filter = `brightness(${0.06 + progress * 0.94})`;
  }

  window.addEventListener('scroll', updateHeroReveal, { passive: true });
  window.addEventListener('resize', updateHeroReveal);
  updateHeroReveal();
})();
