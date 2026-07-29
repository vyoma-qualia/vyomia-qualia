(() => {
  const hero = document.querySelector('.hero');
  const logo = document.getElementById('heroLogo');
  const spriteField = document.querySelector('.sprite-field');
  const orbitField = document.querySelector('.orbit-field');
  const buffer = document.querySelector('.cbuffer');

  function updateHeroReveal(){
    if (!hero || !logo) return;

    const heroRect = hero.getBoundingClientRect();
    const rawProgress = Math.max(0, Math.min(1, 1 - heroRect.top / window.innerHeight));
    const progress = rawProgress < 0.5 ? rawProgress * rawProgress * 2 : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

    logo.style.opacity = String(0.08 + progress * 0.92);
    logo.style.transform = `translateY(${(1 - progress) * 48}px) scale(${0.95 + progress * 0.05})`;
    logo.style.filter = `brightness(${0.06 + progress * 0.94})`;

    if (buffer) {
      buffer.style.transform = `translateY(${Math.max(16, 42 - progress * 26)}px)`;
    }
  }

  function createSprites(){
    if (!spriteField) return;

    const spriteCount = 72;
    for (let i = 0; i < spriteCount; i += 1) {
      const sprite = document.createElement('div');
      sprite.className = 'sprite';
      sprite.dataset.baseX = String(Math.random());
      sprite.dataset.baseY = String(Math.random());
      sprite.style.left = `${Math.random() * 100}%`;
      sprite.style.top = `${Math.random() * 100}%`;
      sprite.style.opacity = String(0.25 + Math.random() * 0.6);
      spriteField.appendChild(sprite);
    }
  }

  function updateSprites(event){
    if (!spriteField) return;
    const pointerX = event ? event.clientX : window.innerWidth / 2;
    const pointerY = event ? event.clientY : window.innerHeight / 2;
    const sprites = Array.from(spriteField.children);

    sprites.forEach((sprite, index) => {
      const rect = sprite.getBoundingClientRect();
      const spriteX = rect.left + rect.width / 2;
      const spriteY = rect.top + rect.height / 2;
      const dx = pointerX - spriteX;
      const dy = pointerY - spriteY;
      const distance = Math.max(80, Math.hypot(dx, dy));
      const force = Math.max(0, 1 - distance / 180);

      const baseX = parseFloat(sprite.dataset.baseX || '0') * window.innerWidth;
      const baseY = parseFloat(sprite.dataset.baseY || '0') * window.innerHeight;
      const driftX = baseX - spriteX;
      const driftY = baseY - spriteY;

      const moveX = (dx / distance) * force * 18 + driftX * 0.005;
      const moveY = (dy / distance) * force * 18 + driftY * 0.005;
      const angle = (index % 2 === 0 ? 1 : -1) * (0.5 + force * 0.6);

      sprite.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${angle}deg)`;
      sprite.classList.toggle('is-attract', force > 0.35);
      sprite.classList.toggle('is-repel', force > 0.15 && force <= 0.35);
    });
  }

  function createOrbitDots(){
    if (!orbitField) return;
    orbitField.innerHTML = '';
    for (let i = 0; i < 16; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'orbit-dot';
      dot.style.animationDelay = `${i * 0.2}s`;
      dot.style.opacity = String(0.2 + (i % 4) * 0.16);
      orbitField.appendChild(dot);
    }
  }

  window.addEventListener('scroll', updateHeroReveal, { passive: true });
  window.addEventListener('resize', updateHeroReveal);
  window.addEventListener('pointermove', updateSprites, { passive: true });
  window.addEventListener('pointerleave', () => updateSprites(null), { passive: true });

  createSprites();
  createOrbitDots();
  updateHeroReveal();
  updateSprites(null);
})();
