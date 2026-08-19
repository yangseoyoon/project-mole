(function () {
  const dot = document.createElement('div');
  dot.id = 'dot-cursor';
  document.body.appendChild(dot);
  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });
})();
