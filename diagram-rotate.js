(function () {
  window.addEventListener('load', function () {
    const frame = document.querySelector('.diag-frame');
    if (!frame) return;

    const tooltip = document.getElementById('diagTooltip');
    const baki    = document.querySelector('.diag-label-baki, .diag-label-left');

    // 툴팁을 frame 밖(부모)으로 이동 → frame 회전에 영향받지 않음
    const page = frame.parentElement;
    if (tooltip && page) page.appendChild(tooltip);

    // frame을 원 중심 기준으로 회전
    frame.style.transformOrigin = '265.27px 232.15px';

    // baki: 같은 물리적 회전 중심을 baki 기준 상대좌표로 환산
    // 원중심(page 기준): 1226.02+265.27=1491.29 / 247.78+232.15=479.93
    // baki CSS 위치:  1225.332 / 464.05
    // 상대좌표: (265.96, 15.88)
    if (baki) {
      baki.style.transformOrigin = '265.96px 15.88px';
      baki.style.cursor = 'grab';
    }
    frame.querySelectorAll('.diag-label').forEach(el => { el.style.cursor = 'grab'; });

    let dragging = false, startAngle = 0, currentRotation = 0;

    function toAngle(cx, cy, mx, my) {
      return Math.atan2(my - cy, mx - cx) * 180 / Math.PI;
    }
    function getCenter() {
      const r = frame.getBoundingClientRect();
      const s = r.width / 528;
      return { x: r.left + 265.27 * s, y: r.top + 232.15 * s };
    }
    function applyRotation(deg) {
      frame.style.transform = `rotate(${deg}deg)`;
      if (baki) baki.style.transform = `rotate(${deg}deg)`;
    }

    function onDown(e) {
      if (!e.target.closest('.diag-label, .diag-label-baki, .diag-label-left')) return;
      e.preventDefault();
      dragging = true;
      const c = getCenter();
      startAngle = toAngle(c.x, c.y, e.clientX, e.clientY) - currentRotation;
      frame.querySelectorAll('.diag-label').forEach(el => { el.style.cursor = 'grabbing'; });
      if (baki) baki.style.cursor = 'grabbing';
    }
    frame.addEventListener('mousedown', onDown);
    if (baki) baki.addEventListener('mousedown', onDown);

    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const c = getCenter();
      currentRotation = toAngle(c.x, c.y, e.clientX, e.clientY) - startAngle;
      applyRotation(currentRotation);
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      frame.querySelectorAll('.diag-label').forEach(el => { el.style.cursor = 'grab'; });
      if (baki) baki.style.cursor = 'grab';
    });

    // 툴팁 너비 조정
    if (tooltip) {
      tooltip.style.width    = '220px';
      tooltip.style.minWidth = '220px';
      tooltip.style.maxWidth = '220px';
    }

    // 툴팁 위치: 회전된 dot의 실제 화면 위치 → page 좌표로 역변환
    if (tooltip && page) {
      frame.querySelectorAll('.diag-dot').forEach(dot => {
        dot.addEventListener('mouseenter', () => {
          if (!dot.dataset.tip) return;
          const dotR = dot.getBoundingClientRect();
          const pR   = page.getBoundingClientRect();
          const s    = pR.width / 1920;
          const lx   = (dotR.left + dotR.width / 2 - pR.left) / s + 12;
          const ly   = (dotR.top  + dotR.height / 2 - pR.top)  / s;
          tooltip.style.left = lx + 'px';
          tooltip.style.top  = (ly - tooltip.offsetHeight / 2) + 'px';
        });
      });
    }
  });
})();
