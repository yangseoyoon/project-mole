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

  // 클릭 파티클
  document.addEventListener('click', e => {
    const COUNT = 10;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('div');
      const angle = (Math.PI * 2 / COUNT) * i + Math.random() * 0.5;
      const speed = 40 + Math.random() * 60;
      const size  = 3 + Math.random() * 4;
      const tx = Math.cos(angle) * speed;
      const ty = Math.sin(angle) * speed;
      p.style.cssText = `
        position:fixed;
        left:${e.clientX}px;
        top:${e.clientY}px;
        width:${size}px;
        height:${size}px;
        background:#000;
        border-radius:50%;
        box-shadow:0 0 0 1px #fff;
        pointer-events:none;
        transform:translate(-50%,-50%);
        z-index:99999;
        transition:transform 0.5s cubic-bezier(0.2,0,0.4,1), opacity 0.5s ease;
      `;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 520);
    }
  });

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
