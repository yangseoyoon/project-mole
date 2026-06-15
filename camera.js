const video = document.getElementById('video');
const photoCanvas = document.getElementById('photoCanvas');
const photoCtx = photoCanvas.getContext('2d');

// 페이지 로드 시 자동으로 웹캠 시작
(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (error) {
    alert('웹캠 접근 실패: ' + error.message);
    console.error(error);
  }
})();

// 촬영 버튼
document.getElementById('captureBtn').addEventListener('click', () => {
  if (!video.videoWidth) {
    alert('웹캠 준비중입니다.');
    return;
  }

  // 출력 크기 = system 페이지 faceContainer 비율 (679 : 830)
  const outputWidth  = 679;
  const outputHeight = 830;
  photoCanvas.width  = outputWidth;
  photoCanvas.height = outputHeight;

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  // ── 실제 카메라 프레임 크기 (video 엘리먼트가 꽉 채운 크기)
  const frameW = video.offsetWidth;
  const frameH = video.offsetHeight;

  // ── SVG 가이드 좌표 → 실제 display 좌표 역산
  // SVG viewBox: 1800 x 950, preserveAspectRatio="xMidYMid slice"
  const SVG_W = 1800, SVG_H = 950;
  const svgScale  = Math.max(frameW / SVG_W, frameH / SVG_H);
  const svgOfsX   = (SVG_W * svgScale - frameW) / 2;
  const svgOfsY   = (SVG_H * svgScale - frameH) / 2;

  // 타원 중심 (SVG: cx=900, cy=360) → display 픽셀
  const ovalCX = 900 * svgScale - svgOfsX;   // 항상 frameW/2
  const ovalCY = 360 * svgScale - svgOfsY;

  // 타원 반경 (SVG: rx=275, ry=340) → display 픽셀
  const ovalRX = 275 * svgScale;
  const ovalRY = 340 * svgScale;

  // ── crop 영역: 타원을 10% 마진으로 감싸는 직사각형
  const cropW = ovalRX * 2 * 1.1;
  const cropH = ovalRY * 2 * 1.1;
  const cropX = ovalCX - cropW / 2;
  const cropY = Math.max(0, ovalCY - cropH / 2);

  // ── video → display 스케일 (object-fit: cover)
  const vidScale = Math.max(frameW / vw, frameH / vh);
  const vidOfsX  = (vw * vidScale - frameW) / 2;
  const vidOfsY  = (vh * vidScale - frameH) / 2;

  // display crop 좌표 → video 소스 좌표
  const sourceX = (cropX + vidOfsX) / vidScale;
  const sourceY = (cropY + vidOfsY) / vidScale;
  const sourceW = cropW / vidScale;
  const sourceH = Math.min(cropH / vidScale, vh - sourceY);

  // ── 거울 반전 해제 후 저장
  photoCtx.save();
  photoCtx.translate(outputWidth, 0);
  photoCtx.scale(-1, 1);
  photoCtx.drawImage(video, sourceX, sourceY, sourceW, sourceH, 0, 0, outputWidth, outputHeight);
  photoCtx.restore();

  localStorage.setItem('capturedFace', photoCanvas.toDataURL('image/png'));
  window.location.href = 'system.html';
});
