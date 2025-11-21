
// Dark mode toggle using body.dark and localStorage
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;

  var stored = localStorage.getItem('wiseconvert-theme') || 'light';
  if (stored === 'dark') {
    document.body.classList.add('dark');
    btn.textContent = '☀️';
  } else {
    btn.textContent = '🌙';
  }

  btn.addEventListener('click', function() {
    var isDark = document.body.classList.toggle('dark');
    localStorage.setItem('wiseconvert-theme', isDark ? 'dark' : 'light');
    btn.textContent = isDark ? '☀️' : '🌙';
  });
});
