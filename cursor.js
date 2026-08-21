(function () {
  // bn-logo 영역 → 홈 링크 오버레이
  const bnInner = document.querySelector('.bn-inner');
  if (bnInner) {
    const logoLink = document.createElement('a');
    logoLink.href = 'index.html';
    logoLink.style.cssText = 'position:absolute;left:40px;top:16px;width:210px;height:44px;z-index:10;display:block;';
    bnInner.appendChild(logoLink);
  }

  const dot = document.createElement('div');
  dot.id = 'dot-cursor';
  document.body.appendChild(dot);

  const HOVER_SEL = 'a, button, [onclick], input, textarea, select, label, [role="button"], [tabindex]';

  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const domHit    = !!(el && el.closest(HOVER_SEL));
    const canvasHit = !!window.__canvasHoverable;

    const on = domHit || canvasHit;
    dot.style.background   = on ? '#fff' : '#000';
    dot.style.mixBlendMode = on ? 'difference' : 'normal';
  });
})();
