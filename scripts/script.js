(() => {
  const hero = document.querySelector('.hero');
  const logo = document.getElementById('heroLogo');
  const spriteField = document.querySelector('.sprite-field');
  const orbitField = document.querySelector('.orbit-field');
  const buffer = document.querySelector('.cbuffer');
  const revealSections = document.querySelectorAll('.image-reveal');
  const logoMotion = {
    targetX: 0,
    targetY: 0,
    targetRotation: 0,
    x: 0,
    y: 0,
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
    rotationVelocity: 0,
    pointerX: window.innerWidth / 2,
    pointerY: window.innerHeight / 2,
    lastPointerTime: 0,
    lastFrameTime: 0,
    wigglePhase: 0,
    wiggleAmount: 0,
  };

  function updateHeroReveal(){
    if (!hero || !logo) return;

    const heroRect = hero.getBoundingClientRect();
    const rawProgress = Math.max(0, Math.min(1, 1 - heroRect.top / window.innerHeight));
    const progress = rawProgress < 0.5 ? rawProgress * rawProgress * 2 : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

    logo.style.opacity = String(0.08 + progress * 0.92);
    logo.style.setProperty('--logo-reveal-y', `${(1 - progress) * 48}px`);
    logo.style.setProperty('--logo-scale', String(0.95 + progress * 0.05));
    logo.style.filter = `brightness(${0.06 + progress * 0.94})`;
  }

  function updateBufferReveal(){
    if (!buffer) return;
    const bufferRect = buffer.parentElement.parentElement.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, 1 - bufferRect.top / window.innerHeight));
    buffer.style.transform = `translateY(${Math.max(0, 16 - progress * 10)}px)`;
  }

  function updateImageReveals(){
    revealSections.forEach((section) => {
      const sectionRect = section.getBoundingClientRect();
      const start = window.innerHeight * 0.9;
      const end = window.innerHeight * 0.2;
      const progress = Math.max(0, Math.min(1, (start - sectionRect.top) / (start - end)));
      section.style.setProperty('--reveal-progress', String(progress));
      section.classList.toggle('is-visible', progress > 0);
    });
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

  function updateLogoTarget(event){
    if (!logo) return;
    const rect = logo.getBoundingClientRect();
    const now = performance.now();
    const elapsed = logoMotion.lastPointerTime ? Math.max(16, now - logoMotion.lastPointerTime) : 16;
    const pointerX = event ? event.clientX : window.innerWidth / 2;
    const pointerY = event ? event.clientY : window.innerHeight / 2;
    const speed = Math.hypot(pointerX - logoMotion.pointerX, pointerY - logoMotion.pointerY) / elapsed;
    const offsetX = (pointerX - (rect.left + rect.width / 2)) / Math.max(rect.width, 1);
    const offsetY = (pointerY - (rect.top + rect.height / 2)) / Math.max(rect.height, 1);

    logoMotion.targetX = Math.max(-34, Math.min(34, offsetX * 42));
    logoMotion.targetY = Math.max(-20, Math.min(20, offsetY * 26));
    logoMotion.targetRotation = Math.max(-8, Math.min(8, offsetX * 10));
    logoMotion.wiggleAmount = Math.min(6, speed * 0.18);
    logoMotion.pointerX = pointerX;
    logoMotion.pointerY = pointerY;
    logoMotion.lastPointerTime = now;
  }

  function updateLogoMotion(elapsed){
    if (!logo) return;
    const spring = 18;
    const damping = Math.pow(0.001, elapsed / 1000);
    logoMotion.velocityX += (logoMotion.targetX - logoMotion.x) * spring * elapsed / 1000;
    logoMotion.velocityY += (logoMotion.targetY - logoMotion.y) * spring * elapsed / 1000;
    logoMotion.rotationVelocity += (logoMotion.targetRotation - logoMotion.rotation) * spring * elapsed / 1000;
    logoMotion.velocityX *= damping;
    logoMotion.velocityY *= damping;
    logoMotion.rotationVelocity *= damping;
    logoMotion.x += logoMotion.velocityX * elapsed / 1000;
    logoMotion.y += logoMotion.velocityY * elapsed / 1000;
    logoMotion.rotation += logoMotion.rotationVelocity * elapsed / 1000;
    logoMotion.wigglePhase += elapsed / 1000 * (8 + logoMotion.wiggleAmount * 2);
    logoMotion.wiggleAmount *= Math.pow(0.12, elapsed / 1000);
    logo.style.setProperty('--cursor-x', `${logoMotion.x}px`);
    logo.style.setProperty('--cursor-y', `${logoMotion.y + Math.sin(logoMotion.wigglePhase) * logoMotion.wiggleAmount}px`);
    logo.style.setProperty('--cursor-rotation', `${logoMotion.rotation + Math.sin(logoMotion.wigglePhase * 1.3) * logoMotion.wiggleAmount}deg`);
  }

  const orbitState = { pointerX: 0.5, pointerY: 0.5, lastTime: 0, particles: [] };

  function createOrbitDots(){
    if (!orbitField) return;
    const ringCount = 4;
    const particleCount = 7;
    for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      const ring = document.createElement('span');
      ring.className = 'orbit-ring';
      ring.style.width = `${42 + ringIndex * 18}%`;
      ring.style.height = ring.style.width;
      orbitField.appendChild(ring);
      for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
        const dot = document.createElement('span');
        dot.className = 'orbit-dot';
        dot.style.opacity = String(0.35 + (particleIndex % 3) * 0.2);
        orbitField.appendChild(dot);
        orbitState.particles.push({
          element: dot,
          angle: (Math.PI * 2 * particleIndex) / particleCount + ringIndex * 0.4,
          radius: 21 + ringIndex * 9,
          speed: (ringIndex % 2 ? -1 : 1) * (0.42 + ringIndex * 0.07),
        });
      }
    }
  }

  function animateOrbit(time){
    if (!orbitField) return;
    const elapsed = orbitState.lastTime ? Math.min(32, time - orbitState.lastTime) / 1000 : 0;
    orbitState.lastTime = time;
    const fieldRect = orbitField.getBoundingClientRect();
    const centerX = fieldRect.left + fieldRect.width / 2;
    const centerY = fieldRect.top + fieldRect.height / 2;
    const cursorX = orbitState.pointerX * window.innerWidth;
    const cursorY = orbitState.pointerY * window.innerHeight;
    const cursorDistance = Math.hypot(cursorX - centerX, cursorY - centerY);
    const cursorAngle = Math.atan2(cursorY - centerY, cursorX - centerX);
    orbitState.particles.forEach((particle) => {
      const force = Math.max(0, 1 - cursorDistance / 340);
      particle.angle += (particle.speed + Math.sin(cursorAngle - particle.angle) * force * 0.75) * elapsed;
      const radius = (particle.radius + Math.sin(cursorAngle - particle.angle) * force * 5) * fieldRect.width / 100;
      particle.element.style.transform = `translate(-50%, -50%) rotate(${particle.angle}rad) translateX(${radius}px)`;
    });
    requestAnimationFrame(animateOrbit);
  }

  function animateLogo(time){
    const elapsed = logoMotion.lastFrameTime ? Math.min(32, time - logoMotion.lastFrameTime) : 0;
    logoMotion.lastFrameTime = time;
    updateLogoMotion(elapsed);
    requestAnimationFrame(animateLogo);
  }

  window.addEventListener('scroll', () => {
    updateHeroReveal();
    updateBufferReveal();
    updateImageReveals();
  }, { passive: true });
  window.addEventListener('resize', () => {
    updateHeroReveal();
    updateBufferReveal();
  });
  window.addEventListener('pointermove', (event) => {
    orbitState.pointerX = event.clientX / window.innerWidth;
    orbitState.pointerY = event.clientY / window.innerHeight;
    updateLogoTarget(event);
    updateSprites(event);
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    orbitState.pointerX = 0.5;
    orbitState.pointerY = 0.5;
    logoMotion.targetX = 0;
    logoMotion.targetY = 0;
    logoMotion.targetRotation = 0;
    logoMotion.wiggleAmount = 0;
    updateSprites(null);
  }, { passive: true });

  createSprites();
  createOrbitDots();
  updateHeroReveal();
  updateBufferReveal();
  updateImageReveals();
  updateLogoTarget(null);
  updateSprites(null);
  requestAnimationFrame(animateLogo);
  requestAnimationFrame(animateOrbit);
})();
