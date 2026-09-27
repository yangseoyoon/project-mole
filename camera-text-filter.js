(function () {
  let active = false;
  let fm = null;
  let canvas = null;
  let ctx = null;
  let rafId = null;
  let activeBtn = null;

  function onResults(results) {
    if (!active || !canvas) return;
    const lm = results.multiFaceLandmarks && results.multiFaceLandmarks[0];
    const cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    if (!lm) return;

    // object-fit:cover + scaleX(-1) 미러 보정
    const video = document.getElementById('video');
    const vw = video.videoWidth || cw, vh = video.videoHeight || ch;
    const scale = Math.max(cw / vw, ch / vh);
    const ox = (cw - vw * scale) / 2;
    const oy = (ch - vh * scale) / 2;
    function pt(i) {
      const rx = lm[i].x * vw * scale + ox;
      const ry = lm[i].y * vh * scale + oy;
      return [cw - rx, ry];
    }

    // 윤곽 포인트 인덱스 set (크게 표시할 점들)
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

    // 삼각형 메쉬 - 매우 얇고 연하게
    const tess = window.FACEMESH_TESSELATION;
    if (tess) {
      ctx.beginPath();
      tess.forEach(function (pair) {
        const a = pt(pair[0]), b = pt(pair[1]);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      });
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    // 윤곽선
    if (contourPairs.length) {
      ctx.beginPath();
      contourPairs.forEach(function (pair) {
        const a = pt(pair[0]), b = pt(pair[1]);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      });
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // 모든 점: 흰색 채우기 + 검정 테두리 (윤곽 점은 크게, 나머지는 3개 중 1개만)
    function drawDot(pos, r) {
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    lm.forEach(function (p, i) {
      if (contourSet.has(i)) return;
      if (i % 4 !== 0) return; // 4개 중 1개만 → 점 개수 줄이기
      drawDot(pt(i), 1.5);
    });

    contourSet.forEach(function (i) {
      drawDot(pt(i), 2.5);
    });
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

    fm = new window.FaceMesh({
      locateFile: function (f) {
        return 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/' + f;
      }
    });
    fm.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    fm.onResults(onResults);
    await fm.initialize();

    async function frame() {
      if (!active) return;
      const v = document.getElementById('video');
      if (v && v.readyState >= 2) await fm.send({ image: v });
      rafId = requestAnimationFrame(frame);
    }
    frame();
  }

  function stop() {
    active = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (canvas) { canvas.remove(); canvas = null; }
    if (fm) { try { fm.close(); } catch (e) {} fm = null; }
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
