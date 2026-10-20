/* 카메라 페이지 오른쪽 아래 패널: 얼굴 영상 없이 2D 메쉬만 노란 배경에 그림
   - 메인 카메라의 "2D 메쉬" 필터와 같은 그림 (window.drawMesh2D, camera-text-filter.js)
   - 메인 화면과 같은 구도(거울 반전, 화면 채우기). 선·점 크기는 패널/메인 화면 폭 비율로 축소
   - 메인에서 2D 메쉬 필터가 켜져 있으면 그 결과를 같이 쓰고, 꺼져 있으면 약 15fps 로 직접 계산 */
(function () {
  const BG = '#e9f056';
  const INTERVAL = 66; // ms
  const ZOOM = 2.88;   // 메쉬 확대 배율 (예전 1.44 의 2배)
  const BASE_ZOOM = 1.44;  // 선·점 굵기는 예전(1.44배) 때 보이던 굵기로 유지

  window.addEventListener('load', function () {
    const canvas = document.getElementById('canvasRight');
    const video = document.getElementById('video');
    if (!canvas || !video || !window.Holistic || !window.drawMesh2D) return;
    const ctx = canvas.getContext('2d');

    function fitCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    }

    // 얼굴 가운데(얼굴 점들의 평균)를 패널 좌표로 — drawMesh2D 와 같은 변환(화면 채우기 + 거울 반전)
    let focus = null;  // 부드럽게 따라가는 확대 중심
    function faceCenter(results, w, h) {
      const lm = results && results.faceLandmarks;
      if (!lm || !lm.length) return null;
      const vw = video.videoWidth || w, vh = video.videoHeight || h;
      const sc = Math.max(w / vw, h / vh), ox = (w - vw * sc) / 2, oy = (h - vh * sc) / 2;
      let sx = 0, sy = 0;
      lm.forEach(p => { sx += p.x; sy += p.y; });
      const x = (sx / lm.length) * vw * sc + ox, y = (sy / lm.length) * vh * sc + oy;
      return { x: w - x, y };
    }

    function render(results) {
      const { w, h } = fitCanvas();
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      if (!results) return;
      // 선·점 굵기: 확대해도 예전(1.44배) 때와 같은 굵기로 보이게
      const k = w / (video.offsetWidth || w) * BASE_ZOOM / ZOOM;
      // 얼굴 가운데를 패널 가운데에 두고 ZOOM 배로 (얼굴이 화면 밖으로 잘리지 않게, 중심은 부드럽게 따라감)
      const c = faceCenter(results, w, h) || { x: w / 2, y: h / 2 };
      focus = focus ? { x: focus.x + (c.x - focus.x) * 0.25, y: focus.y + (c.y - focus.y) * 0.25 } : c;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(ZOOM, ZOOM);
      ctx.translate(-focus.x, -focus.y);
      window.drawMesh2D(ctx, results, w, h, k);
      ctx.restore();
    }
    render(null);

    // 메인 필터가 돌고 있을 때 그 결과를 받음
    window.onHolisticResults = render;

    const holistic = new window.Holistic({
      locateFile: function (f) { return 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/' + f; }
    });
    holistic.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    holistic.onResults(render);

    let busy = false;
    setInterval(async function () {
      if (window.isTextFilterActive && window.isTextFilterActive()) return; // 메인 필터 결과 사용
      if (busy || video.readyState < 2 || !video.videoWidth) return;
      busy = true;
      try { await holistic.send({ image: video }); } catch (e) {}
      busy = false;
    }, INTERVAL);

    window.addEventListener('resize', function () { render(null); });
  });
})();
