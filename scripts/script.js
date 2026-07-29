(() => {
  const body = document.body;
  const toggle = document.getElementById('themeToggle');

  function applyTheme(theme){
    body.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
    localStorage.setItem('vq-theme', theme);
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(current);
    });
  }

  const saved = localStorage.getItem('vq-theme');
  const initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(initial);
})();
