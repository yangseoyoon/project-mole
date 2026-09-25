const video = document.getElementById('video');
const photoCanvas = document.getElementById('photoCanvas');
const photoCtx = photoCanvas.getContext('2d');

// 페이지 로드 시 자동으로 웹캠 시작
(async () => {
  // file:// 프로토콜에서는 카메라 접근 불가
  if (location.protocol === 'file:') {
    console.warn('웹캠: file:// 프로토콜에서는 카메라가 차단됩니다. localhost로 실행하세요.');
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('웹캠: 이 브라우저는 카메라를 지원하지 않거나 HTTPS가 필요합니다.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = stream;
  } catch (error) {
    console.error('웹캠 접근 실패:', error);
  }
})();

// 촬영 버튼
document.getElementById('captureBtn').addEventListener('click', () => {
  if (!video.videoWidth) {
    alert('웹캠 준비중입니다.');
    return;
  }
  if (window.playCamClick) window.playCamClick();

  const outputWidth  = 679;
  const outputHeight = 830;
  photoCanvas.width  = outputWidth;
  photoCanvas.height = outputHeight;

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  const frameW = video.offsetWidth;
  const frameH = video.offsetHeight;

  const SVG_W = 1800, SVG_H = 950;
  const svgScale  = Math.max(frameW / SVG_W, frameH / SVG_H);
  const svgOfsX   = (SVG_W * svgScale - frameW) / 2;
  const svgOfsY   = (SVG_H * svgScale - frameH) / 2;

  const ovalCX = 900 * svgScale - svgOfsX;
  const ovalCY = 442 * svgScale - svgOfsY;
  const ovalRX = 319 * svgScale;
  const ovalRY = 412 * svgScale;

  const cropW = ovalRX * 2 * 1.1;
  const cropH = ovalRY * 2 * 1.1;
  const cropX = ovalCX - cropW / 2;
  const cropY = Math.max(0, ovalCY - cropH / 2);

  const vidScale = Math.max(frameW / vw, frameH / vh);
  const vidOfsX  = (vw * vidScale - frameW) / 2;
  const vidOfsY  = (vh * vidScale - frameH) / 2;

  const sourceX = (cropX + vidOfsX) / vidScale;
  const sourceY = (cropY + vidOfsY) / vidScale;
  const sourceW = cropW / vidScale;
  const sourceH = Math.min(cropH / vidScale, vh - sourceY);

  photoCtx.save();
  photoCtx.translate(outputWidth, 0);
  photoCtx.scale(-1, 1);
  photoCtx.drawImage(video, sourceX, sourceY, sourceW, sourceH, 0, 0, outputWidth, outputHeight);
  photoCtx.restore();

  localStorage.setItem('capturedFace', photoCanvas.toDataURL('image/png'));
  window.location.href = 'system.html';
});
