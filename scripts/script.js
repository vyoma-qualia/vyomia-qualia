(() => {
  const hero = document.querySelector('.hero');
  const logo = document.getElementById('heroLogo');
  const logoStage = logo ? logo.closest('.logo-stage') : null;
  const spriteField = document.querySelector('.sprite-field');
  const orbitField = document.querySelector('.orbit-field');
  const buffer = document.querySelector('.cbuffer');
  const revealSections = document.querySelectorAll('.image-reveal');
  const logoPieces = [];
  const logoMotion = {
    targetX: 0,
    targetY: 0,
    targetRotation: 0,
    targetStretch: 1,
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

  async function initializeLogoMaterial(){
    if (!logo) return;
    const response = await fetch('assets/vyomia-qualia-logo.svg');
    if (!response.ok) return;
    const source = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
    const sourceRoot = source.documentElement;
    logo.innerHTML = sourceRoot.innerHTML;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    logo.prepend(defs);
    logo.querySelectorAll('path').forEach((path, index) => {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
      const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
      filter.id = `logo-brittle-${index}`;
      filter.setAttribute('x', '-20%');
      filter.setAttribute('y', '-20%');
      filter.setAttribute('width', '140%');
      filter.setAttribute('height', '140%');
      turbulence.setAttribute('type', 'fractalNoise');
      turbulence.setAttribute('baseFrequency', '0.012 0.08');
      turbulence.setAttribute('numOctaves', '2');
      turbulence.setAttribute('seed', String(index + 7));
      turbulence.setAttribute('result', 'clothNoise');
      displacement.setAttribute('in', 'SourceGraphic');
      displacement.setAttribute('in2', 'clothNoise');
      displacement.setAttribute('scale', '0');
      filter.append(turbulence, displacement);
      defs.appendChild(filter);
      path.setAttribute('filter', `url(#${filter.id})`);
      logoPieces.push({
        path,
        displacement,
        center: null,
        brittle: 0,
        target: 0,
        x: 0,
        y: 0,
        rotation: 0,
        velocityX: 0,
        velocityY: 0,
        rotationVelocity: 0,
      });
    });
    logoPieces.forEach((piece) => {
      const bounds = piece.path.getBBox();
      piece.center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    });
  }

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
    const rect = (logoStage || logo).getBoundingClientRect();
    const now = performance.now();
    const elapsed = logoMotion.lastPointerTime ? Math.max(16, now - logoMotion.lastPointerTime) : 16;
    const pointerX = event ? event.clientX : window.innerWidth / 2;
    const pointerY = event ? event.clientY : window.innerHeight / 2;
    const speed = Math.hypot(pointerX - logoMotion.pointerX, pointerY - logoMotion.pointerY) / elapsed;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = pointerX - centerX;
    const distanceY = pointerY - centerY;
    const distance = Math.hypot(distanceX, distanceY);
    const nearRadius = Math.max(140, Math.min(window.innerWidth, window.innerHeight) * 0.3);
    const farRadius = Math.max(nearRadius + 1, Math.min(window.innerWidth, window.innerHeight) * 0.8);
    const nearForce = Math.max(0, 1 - distance / nearRadius);
    const farForce = Math.max(0, Math.min(1, (distance - nearRadius) / (farRadius - nearRadius)));
    const directionX = distance ? distanceX / distance : 0;
    const directionY = distance ? distanceY / distance : 0;
    const force = farForce * 0.65 - nearForce * 1.35;
    const speedStretch = Math.min(0.12, speed * 0.008);

    logoMotion.targetX = Math.max(-76, Math.min(76, directionX * force * 150));
    logoMotion.targetY = Math.max(-58, Math.min(58, directionY * force * 112));
    logoMotion.targetRotation = Math.max(-16, Math.min(16, directionX * force * 24));
    logoMotion.targetStretch = 1 + speedStretch;
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
    logoMotion.targetStretch += (1 - logoMotion.targetStretch) * Math.min(1, elapsed / 180);
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
    logo.style.setProperty('--cursor-stretch', String(logoMotion.targetStretch));
    updateLogoMaterial(elapsed);
  }

  function updateLogoMaterial(elapsed){
    if (!logoPieces.length || !logo.getScreenCTM()) return;
    const point = new DOMPoint(logoMotion.pointerX, logoMotion.pointerY).matrixTransform(logo.getScreenCTM().inverse());
    logoPieces.forEach((piece) => {
      const distance = Math.hypot(point.x - piece.center.x, point.y - piece.center.y);
      const distanceInPixels = distance * logo.getBoundingClientRect().width / 8000;
      const threshold = 6;
      piece.target = Math.max(0, Math.min(1, (distanceInPixels - threshold) / 110));
      piece.target = Math.max(piece.target, Math.min(1, logoMotion.wiggleAmount / 6) * 0.18);
      piece.brittle += (piece.target - piece.brittle) * Math.min(1, elapsed / 140);
      piece.displacement.setAttribute('scale', String(piece.brittle * 180));

      const directionX = distance ? (piece.center.x - point.x) / distance : 0;
      const directionY = distance ? (piece.center.y - point.y) / distance : 0;
      const proximity = Math.max(0, 1 - distanceInPixels / 180);
      const attraction = Math.min(1, distanceInPixels / 420) * 0.28;
      const repulsion = proximity * 1.2;
      const force = attraction - repulsion;
      const targetX = Math.max(-180, Math.min(180, directionX * force * 360));
      const targetY = Math.max(-130, Math.min(130, directionY * force * 260));
      const targetRotation = Math.max(-14, Math.min(14, directionX * force * 28));
      const spring = 22;
      piece.velocityX += (targetX - piece.x) * spring * elapsed / 1000;
      piece.velocityY += (targetY - piece.y) * spring * elapsed / 1000;
      piece.rotationVelocity += (targetRotation - piece.rotation) * spring * elapsed / 1000;
      piece.velocityX *= 0.86;
      piece.velocityY *= 0.86;
      piece.rotationVelocity *= 0.86;
      piece.x += piece.velocityX * elapsed / 1000;
      piece.y += piece.velocityY * elapsed / 1000;
      piece.rotation += piece.rotationVelocity * elapsed / 1000;
      const speedJitter = logoMotion.wiggleAmount * 0.7;
      const jitterX = Math.sin(logoMotion.wigglePhase + piece.center.x) * speedJitter;
      const jitterY = Math.cos(logoMotion.wigglePhase + piece.center.y) * speedJitter;
      piece.path.setAttribute('transform', `translate(${piece.x + jitterX} ${piece.y + jitterY}) rotate(${piece.rotation} ${piece.center.x} ${piece.center.y})`);
    });
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
    logoPieces.forEach((piece) => {
      const bounds = piece.path.getBBox();
      piece.center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    });
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
  initializeLogoMaterial();
  requestAnimationFrame(animateLogo);
  requestAnimationFrame(animateOrbit);
})();
