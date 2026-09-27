(function () {
  let active = false;
  let fm = null;
  let canvas = null;
  let ctx = null;
  let pixCanvas = null; // 다운샘플용
  let pixCtx = null;
  let rafId = null;
  let activeBtn = null;

  let curPixelSize = 10; // 픽셀 블록 크기 (거리에 따라 변함)

  function updateParams(faceSize) {
    const prox = Math.min(1, faceSize / 0.45);
    const tSize = 28 - prox * 20; // 멀 때 28px, 가까울 때 8px
    curPixelSize += (tSize - curPixelSize) * 0.05;
  }

  function drawPixelArt() {
    if (!canvas || !pixCanvas) return;
    const video = document.getElementById('video');
    if (!video || video.readyState < 2) return;

    const cw = canvas.width, ch = canvas.height;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return;

    const px = Math.max(2, Math.round(curPixelSize));
    const dotR = px * 0.62; // 원이 살짝 겹치는 크기

    // video 프레임 캡처
    pixCanvas.width = vw;
    pixCanvas.height = vh;
    pixCtx.drawImage(video, 0, 0);
    const imgData = pixCtx.getImageData(0, 0, vw, vh).data;

    const scale = Math.max(cw / vw, ch / vh);
    const ox = (cw - vw * scale) / 2;
    const oy = (ch - vh * scale) / 2;

    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, cw, ch);

    for (let x = px / 2; x < cw; x += px) {
      for (let y = px / 2; y < ch; y += px) {
        const vidX = Math.round((cw - x - ox) / scale);
        const vidY = Math.round((y - oy) / scale);
        if (vidX < 0 || vidX >= vw || vidY < 0 || vidY >= vh) continue;

        const idx = (vidY * vw + vidX) * 4;
        const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];

        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fill();
      }
    }
  }

  function onResults(results) {
    if (!active) return;
    const lm = results.multiFaceLandmarks && results.multiFaceLandmarks[0];
    updateParams(lm ? Math.abs(lm[10].y - lm[152].y) : 0);
    drawPixelArt();
  }

  async function start() {
    const video = document.getElementById('video');
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:6;image-rendering:pixelated;';
    video.parentElement.appendChild(canvas);
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    pixCanvas = document.createElement('canvas');
    pixCtx = pixCanvas.getContext('2d', { willReadFrequently: true });

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
    fm.setOptions({ maxNumFaces: 1, refineLandmarks: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
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
    pixCanvas = null; pixCtx = null;
    curPixelSize = 10;
  }

  function resetToDefault() {
    var def = document.getElementById('segDefault');
    if (def) def.classList.add('seg-active');
  }

  window.stopStickerFilter = function () {
    if (!active) return;
    stop();
    if (activeBtn) activeBtn.classList.remove('seg-active');
    activeBtn = null;
    resetToDefault();
  };

  window.toggleStickerFilter = async function (btn) {
    if (active) {
      stop();
      if (activeBtn) activeBtn.classList.remove('seg-active');
      activeBtn = null;
      resetToDefault();
      return;
    }
    if (window.stopTextFilter) window.stopTextFilter();
    document.querySelectorAll('.win-seg').forEach(function(s) { s.classList.remove('seg-active'); });
    active = true;
    activeBtn = btn;
    if (btn) btn.classList.add('seg-active');
    await start();
  };
})();
