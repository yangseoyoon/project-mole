/* 진입 도움말 투어 (help-tour.css 와 함께)
   window.startHelpTour(steps, { onFinish }) — 페이지에 들어올 때마다 호출
     onFinish : 마지막 단계까지 넘겼을 때 실행 (Esc 로 건너뛰면 실행 안 함). 다른 페이지로 이어갈 때 사용
                주면 투어 화면을 닫지 않고 그대로 둠 (페이지 이동 중 실제 화면이 비치지 않게)
     onSkip   : Esc 를 눌렀을 때 닫는 대신 실행 (역시 화면 그대로 둠)
     onEnd    : 투어가 닫힐 때 실행 (onFinish / onSkip 이 없을 때의 종료)
   steps: [{ text, hole?, panel? }]
     text  : 패널 문구 (HTML, <br> 가능)
     hole  : 선명하게 둘 구간. CSS 선택자(문자열, 여러 요소면 합친 영역) 또는 () => {left, top, right, bottom}
             없으면 화면 전체 블러
     pad   : hole 여백 px (기본 20)
     panel : 'center'(기본, hole 없을 때) | 'left' | 'right' | 'top' | 'bottom' (hole 기준, 간격 28px)
             또는 (holeRect, panelW, panelH) => {left, top} 로 직접 지정
     shape : true 면 hole 요소 모양(둥근 모서리) 그대로 뚫음 (hole 은 선택자, 첫 요소 기준, pad 무시)
     blurOverlaps : true 면 hole 요소 위에 겹친 형제 요소도 블러 (구멍 안에서도 흐리게)
     zoom  : 숫자면 이 단계 동안만 hole 요소를 그 배율로 확대 (작은 요소 설명용)
     enter / leave : 이 단계가 시작될 때 / 끝날 때 실행할 함수 (예시 이미지 표시 등)
   화면 아무 곳이나 / → 를 누르면 다음 단계, 마지막 단계 다음은 종료. Esc 로 건너뜀. */
(function () {
  // 캡처 모드: 주소 끝 #capture=N (1부터) → N 번째 단계만 패널 없이·애니메이션 없이 표시 (도움말 슬라이드 이미지 캡처용)
  const cap = location.hash.match(/capture=(\d+)/);
  window.helpTourCapture = cap ? Number(cap[1]) : 0;

  window.startHelpTour = function (steps, opts) {
    opts = opts || {};
    if (!steps || !steps.length) return;
    if (window.helpTourCapture) {
      document.documentElement.classList.add('htour-capture');
      opts = {};  // 캡처 중에는 다음 페이지로 넘기지 않음
    }
    const tour = document.createElement('div');
    tour.className = 'htour';
    tour.setAttribute('aria-live', 'polite');
    document.body.appendChild(tour);
    let step = 0;

    function rectOf(s) {
      if (!s.hole) return null;
      if (typeof s.hole === 'function') return s.hole();
      const els = [...document.querySelectorAll(s.hole)];
      if (!els.length) return null;
      const pad = s.pad != null ? s.pad : 20;
      const rs = els.map(el => el.getBoundingClientRect());
      return {
        left: Math.min(...rs.map(r => r.left)) - pad, top: Math.min(...rs.map(r => r.top)) - pad,
        right: Math.max(...rs.map(r => r.right)) + pad, bottom: Math.max(...rs.map(r => r.bottom)) + pad,
      };
    }

    // 이전 단계에서 직접 블러를 건 요소 되돌리기
    function clearOverlapBlur() {
      document.querySelectorAll('.htour-blurred').forEach(el => el.classList.remove('htour-blurred'));
    }

    // 구멍 요소 위에 겹친 형제 요소(말풍선·패널 등)에 직접 블러 → 구멍 안에서도 흐리게
    function blurOverlaps(holeEl, h) {
      const parent = holeEl.parentElement;
      if (!parent) return;
      [...parent.children].forEach(el => {
        if (el === holeEl) return;
        const r = el.getBoundingClientRect();
        if (r.width && r.height && r.right > h.left && r.left < h.right && r.bottom > h.top && r.top < h.bottom) {
          el.classList.add('htour-blurred');
        }
      });
    }

    // zoom: 이 단계 동안만 hole 요소를 확대 (scale 속성, 원래 값 보관 후 복원)
    function clearZoom() {
      document.querySelectorAll('.htour-zoomed').forEach(el => {
        el.style.scale = el.dataset.htourScale || '';
        delete el.dataset.htourScale;
        el.classList.remove('htour-zoomed');
      });
    }
    function applyZoom(s) {
      if (!s.zoom || typeof s.hole !== 'string') return;
      document.querySelectorAll(s.hole).forEach(el => {
        el.dataset.htourScale = el.style.scale;
        el.style.scale = s.zoom;
        el.classList.add('htour-zoomed');
      });
    }

    function render() {
      const s = steps[step];
      tour.innerHTML = '';
      clearOverlapBlur();
      clearZoom();
      applyZoom(s);
      const vw = document.documentElement.clientWidth, vh = window.innerHeight;
      const h = rectOf(s);
      const holeEl = (h && s.shape && typeof s.hole === 'string') ? document.querySelector(s.hole) : null;

      // 블러: 구멍이 없으면 화면 전체(크기 계산 없이 inset:0)
      if (!h) {
        const p = document.createElement('div');
        p.className = 'htour-blur';
        p.style.inset = '0';
        tour.appendChild(p);
      }

      // shape: 구멍을 요소 모양(둥근 모서리) 그대로 — 화면 전체 블러 한 장에 clip-path 로 뚫음
      if (holeEl) {
        const r = holeEl.getBoundingClientRect();
        const rad = (parseFloat(getComputedStyle(holeEl).borderTopLeftRadius) || 0) * (r.width / (holeEl.offsetWidth || r.width));
        const x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom, k = Math.min(rad, r.width / 2, r.height / 2);
        const hole = `M${x0 + k} ${y0} H${x1 - k} A${k} ${k} 0 0 1 ${x1} ${y0 + k} V${y1 - k} A${k} ${k} 0 0 1 ${x1 - k} ${y1}` +
                     ` H${x0 + k} A${k} ${k} 0 0 1 ${x0} ${y1 - k} V${y0 + k} A${k} ${k} 0 0 1 ${x0 + k} ${y0} Z`;
        const p = document.createElement('div');
        p.className = 'htour-blur';
        p.style.inset = '0';
        p.style.clipPath = `path(evenodd, 'M0 0 H${vw} V${vh} H0 Z ${hole}')`;
        tour.appendChild(p);
        if (s.blurOverlaps) blurOverlaps(holeEl, { left: x0, top: y0, right: x1, bottom: y1 });
        addHoleGlow({ left: x0, top: y0, right: x1, bottom: y1 }, k);
      } else if (h) {
        addHoleGlow(h, 0);
      }

      // 선명한 구간 바깥으로 주황 그림자 (블러와의 경계 구분)
      function addHoleGlow(r, radius) {
        const o = document.createElement('div');
        o.className = 'htour-hole';
        Object.assign(o.style, {
          left: r.left + 'px', top: r.top + 'px',
          width: (r.right - r.left) + 'px', height: (r.bottom - r.top) + 'px',
          borderRadius: radius + 'px',
        });
        tour.appendChild(o);
      }

      // 사각 구멍에서도 겹친 형제 요소 블러 (첫 hole 요소 기준)
      if (h && !holeEl && s.blurOverlaps && typeof s.hole === 'string') {
        const first = document.querySelector(s.hole);
        if (first) blurOverlaps(first, h);
      }

      // 사각 구멍: 구멍을 둘러싼 네 조각
      const panes = (!h || holeEl) ? [] : [
        [0, 0, vw, h.top], [0, h.bottom, vw, vh - h.bottom],
        [0, h.top, h.left, h.bottom - h.top], [h.right, h.top, vw - h.right, h.bottom - h.top],
      ];
      panes.forEach(([l, t, w, hh]) => {
        if (w <= 0 || hh <= 0) return;
        const p = document.createElement('div');
        p.className = 'htour-blur';
        Object.assign(p.style, { left: l + 'px', top: t + 'px', width: w + 'px', height: hh + 'px' });
        tour.appendChild(p);
      });

      // 도움말 패널
      const panel = document.createElement('div');
      panel.className = 'htour-panel';
      panel.setAttribute('role', 'dialog');
      panel.innerHTML = '<div class="htour-title">도움말</div>' +
        '<button class="htour-next" aria-label="다음">→</button>' +
        '<p class="htour-text">' + s.text + '</p>';
      tour.appendChild(panel);
      panel.querySelector('.htour-next').addEventListener('click', e => { e.stopPropagation(); go(step + 1); });

      const pw = panel.offsetWidth, ph = panel.offsetHeight, GAP = 28;
      let left = (vw - pw) / 2, top = (vh - ph) / 2;
      if (h && typeof s.panel === 'function') {
        // 직접 위치 지정: (구멍 rect, 패널 폭, 패널 높이) => {left, top}
        ({ left, top } = s.panel(h, pw, ph));
      } else if (h) {
        const side = s.panel || 'right';
        const cy = (h.top + h.bottom) / 2 - ph / 2, cx = (h.left + h.right) / 2 - pw / 2;
        if (side === 'left')   { left = h.left - GAP - pw; top = cy; }
        if (side === 'right')  { left = h.right + GAP;     top = cy; }
        if (side === 'top')    { left = cx; top = h.top - GAP - ph; }
        if (side === 'bottom') { left = cx; top = h.bottom + GAP; }
      }
      panel.style.left = Math.max(8, Math.min(left, vw - pw - 8)) + 'px';
      panel.style.top = Math.max(8, Math.min(top, vh - ph - 8)) + 'px';
    }

    let entered = null;  // enter() 를 실행한 단계
    function leaveStep() {
      if (entered && entered.leave) entered.leave();
      entered = null;
    }
    function go(i) {
      leaveStep();
      step = i;
      if (step >= steps.length) {
        // onFinish 가 있으면 화면(블러·패널·예시)을 그대로 둔 채 넘김 → 다른 페이지로 갈 때 실제 화면이 잠깐 비치지 않음
        if (opts.onFinish) { step = steps.length - 1; opts.onFinish(); return; }
        return end();
      }
      if (steps[step].enter) { steps[step].enter(); entered = steps[step]; }
      render();
    }
    function end() {
      if (opts.onEnd) opts.onEnd();  // 끝나거나 Esc 로 건너뛸 때 모두
      leaveStep();
      tour.innerHTML = '';
      clearOverlapBlur();
      clearZoom();
      tour.classList.add('done');
      window.removeEventListener('resize', onResize);
    }
    function onResize() { if (!tour.classList.contains('done')) render(); }

    tour.addEventListener('click', () => go(step + 1));
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || tour.classList.contains('done')) return;
      if (opts.onSkip) opts.onSkip(); else end();  // onSkip: 화면 그대로 두고 다른 페이지로
    });
    window.addEventListener('resize', onResize);
    go(window.helpTourCapture ? Math.min(window.helpTourCapture, steps.length) - 1 : 0);
  };
})();
