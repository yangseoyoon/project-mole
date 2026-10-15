/* 십이궁 상세 다이어그램: 라벨 드래그 회전 + 데이터 점 툴팁
   크기 단위는 sijung.css 의 --su (디자인 1px) */
(function () {
  window.addEventListener('load', function () {
    const frame = document.querySelector('.diag-frame');
    if (!frame) return;

    const tooltip = document.getElementById('diagTooltip');
    const baki    = document.querySelector('.diag-label-baki, .diag-label-left');
    const pivot   = frame.querySelector('img[src*="diagram-dot-center"]');

    // 툴팁을 frame 밖(부모)으로 이동 → frame 회전에 영향받지 않음
    const page = frame.parentElement;
    if (tooltip && page) page.appendChild(tooltip);

    // frame을 원 중심 기준으로 회전 (원 중심: frame 기준 265.27, 232.15)
    frame.style.transformOrigin = 'calc(265.27 * var(--su)) calc(232.15 * var(--su))';

    // baki: 같은 물리적 회전 중심을 baki 기준 상대좌표로 환산
    // 원중심(page 기준): 1226.02+265.27=1491.29 / 247.78+232.15=479.93
    // baki CSS 위치:  1225.332 / 464.05
    // 상대좌표: (265.96, 15.88)
    if (baki) {
      baki.style.transformOrigin = 'calc(265.96 * var(--su)) calc(15.88 * var(--su))';
      baki.style.cursor = 'grab';
    }
    frame.querySelectorAll('.diag-label').forEach(el => { el.style.cursor = 'grab'; });

    let dragging = false, startAngle = 0, currentRotation = 0;

    function toAngle(cx, cy, mx, my) {
      return Math.atan2(my - cy, mx - cx) * 180 / Math.PI;
    }
    // 회전 중심 = 중심 점 이미지의 중심 (회전해도 움직이지 않는 점)
    function getCenter() {
      const r = (pivot || frame).getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
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

    if (!tooltip) return;

    // 툴팁 너비
    tooltip.style.width    = 'calc(220 * var(--su))';
    tooltip.style.minWidth = '0';
    tooltip.style.maxWidth = 'none';

    // 툴팁 위치: 회전된 dot의 실제 화면 위치 기준, 오른쪽에 자리가 없으면 왼쪽에 표시
    function place(dot) {
      const s   = frame.offsetWidth / 528;            // 디자인 1px → 화면 px
      const d   = dot.getBoundingClientRect();
      const tipW = tooltip.offsetWidth, tipH = tooltip.offsetHeight;
      const cx = d.left + d.width / 2, cy = d.top + d.height / 2;
      let x = cx + 12 * s;
      if (x + tipW > document.documentElement.clientWidth - 8) x = cx - 12 * s - tipW;
      const y = cy - tipH / 2;

      // 부모 좌표계/translate 와 무관하게 화면 좌표로 맞춤
      tooltip.style.left = '0px';
      tooltip.style.top  = '0px';
      const o = tooltip.getBoundingClientRect();
      tooltip.style.left = (x - o.left) + 'px';
      tooltip.style.top  = (y - o.top) + 'px';
    }

    frame.querySelectorAll('.diag-dot').forEach(dot => {
      dot.addEventListener('mouseenter', () => {
        const tip = dot.dataset.tip;
        if (!tip) return;
        tooltip.innerHTML = tip;
        tooltip.classList.add('show');
        place(dot);
      });
      dot.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
    });
  });
})();
