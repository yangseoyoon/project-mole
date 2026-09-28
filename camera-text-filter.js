(function () {
  let active = false;
  let holistic = null;
  let canvas = null;
  let ctx = null;
  let rafId = null;
  let activeBtn = null;

  // MediaPipe Pose 랜드마크 연결 (11번 어깨부터 - 얼굴 제외)
  const POSE_CONNECTIONS = [
    [11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[17,19],
    [12,14],[14,16],[16,18],[16,20],[16,22],[18,20],
    [11,23],[12,24],[23,24],
    [23,25],[25,27],[27,29],[29,31],[27,31],
    [24,26],[26,28],[28,30],[30,32],[28,32]
  ];

  function onResults(results) {
    if (!active || !canvas) return;
    const cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const video = document.getElementById('video');
    const vw = video.videoWidth || cw, vh = video.videoHeight || ch;
    const scale = Math.max(cw / vw, ch / vh);
    const ox = (cw - vw * scale) / 2;
    const oy = (ch - vh * scale) / 2;

    function toCanvas(lm) {
      const rx = lm.x * vw * scale + ox;
      const ry = lm.y * vh * scale + oy;
      return [cw - rx, ry]; // scaleX(-1) 미러 보정
    }

    // ── 얼굴 메쉬 ──
    const faceLm = results.faceLandmarks;
    if (faceLm) {
      const contourPairs = [].concat(
        window.FACEMESH_RIGHT_EYE || [],
        window.FACEMESH_LEFT_EYE || [],
        window.FACEMESH_RIGHT_EYEBROW || [],
        window.FACEMESH_LEFT_EYEBROW || [],
        window.FACEMESH_LIPS || [],
        window.FACEMESH_FACE_OVAL || []
      );
      const contourSet = new Set();
      contourPairs.forEach(function (pair) { contourSet.add(pair[0]); contourSet.add(pair[1]); });

      // 윤곽선 (2개 중 1개만)
      if (contourPairs.length) {
        ctx.beginPath();
        contourPairs.forEach(function (pair, idx) {
          if (idx % 2 !== 0) return;
          const a = toCanvas(faceLm[pair[0]]), b = toCanvas(faceLm[pair[1]]);
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
        });
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // 점 (8개 중 1개만)
      function drawDot(pos, r) {
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      faceLm.forEach(function (p, i) {
        if (contourSet.has(i)) return;
        if (i % 8 !== 0) return;
        drawDot(toCanvas(p), 3);
      });
      let contourArr = Array.from(contourSet);
      contourArr.forEach(function (i, idx) {
        if (idx % 2 !== 0) return;
        drawDot(toCanvas(faceLm[i]), 3);
      });
    }

    // ── 포즈(몸) 메쉬 ──
    const poseLm = results.poseLandmarks;
    if (poseLm) {
      // 뼈대 연결선
      ctx.beginPath();
      POSE_CONNECTIONS.forEach(function (pair) {
        const a = toCanvas(poseLm[pair[0]]), b = toCanvas(poseLm[pair[1]]);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      });
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 관절 점 (어깨 이하만)
      poseLm.forEach(function (p, i) {
        if (i < 11) return;
        const pos = toCanvas(p);
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }

  async function start() {
    const video = document.getElementById('video');
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';
    video.parentElement.appendChild(canvas);
    ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;
    }
    resize();
    new ResizeObserver(resize).observe(video);

    holistic = new window.Holistic({
      locateFile: function (f) {
        return 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/' + f;
      }
    });
    holistic.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    holistic.onResults(onResults);
    await holistic.initialize();

    async function frame() {
      if (!active) return;
      const v = document.getElementById('video');
      if (v && v.readyState >= 2) await holistic.send({ image: v });
      rafId = requestAnimationFrame(frame);
    }
    frame();
  }

  function stop() {
    active = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (canvas) { canvas.remove(); canvas = null; }
    if (holistic) { try { holistic.close(); } catch (e) {} holistic = null; }
  }

  function resetToDefault() {
    var def = document.getElementById('segDefault');
    if (def) def.classList.add('seg-active');
  }

  window.stopTextFilter = function () {
    if (!active) return;
    stop();
    if (activeBtn) activeBtn.classList.remove('seg-active');
    activeBtn = null;
    resetToDefault();
  };

  window.toggleTextFilter = async function (btn) {
    if (active) {
      stop();
      if (activeBtn) activeBtn.classList.remove('seg-active');
      activeBtn = null;
      resetToDefault();
      return;
    }
    if (window.stopStickerFilter) window.stopStickerFilter();
    document.querySelectorAll('.win-seg').forEach(function(s) { s.classList.remove('seg-active'); });
    active = true;
    activeBtn = btn;
    if (btn) btn.classList.add('seg-active');
    await start();
  };
})();
