// ── 얼굴 이미지 (cover 방식으로 캔버스에 표시) ──
const savedCanvas = document.getElementById('savedCanvas');
const savedCtx = savedCanvas.getContext('2d');
const dotCanvas = document.getElementById('dotCanvas');
const dotCtx = dotCanvas.getContext('2d');

const CANVAS_W = 679;
const CANVAS_H = 830;
savedCanvas.width = CANVAS_W;
savedCanvas.height = CANVAS_H;
dotCanvas.width = CANVAS_W;
dotCanvas.height = CANVAS_H;

const savedImage = localStorage.getItem('capturedFace');
if (savedImage) {
  const img = new Image();
  img.onload = () => {
    // object-fit: cover 방식으로 중앙 크롭
    const iw = img.width;
    const ih = img.height;
    const scale = Math.max(CANVAS_W / iw, CANVAS_H / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (CANVAS_W - sw) / 2;
    const sy = (CANVAS_H - sh) / 2;
    savedCtx.drawImage(img, sx, sy, sw, sh);
  };
  img.src = savedImage;
}

// ── GRID ──
const GRID_COLS = 18;
const GRID_ROWS = 23;
const ORIGIN = { x: 8.5, y: 8.5 };
const grid = document.getElementById('grid');

// ── 방사형 SVG ──
const svg = document.getElementById('radialSvg');
const svgW = svg.parentElement.clientWidth || 1000;
const svgH = svg.parentElement.clientHeight || 1080;
const centerX = svgW / 2;
const centerY = svgH / 2;
const ringGap = 45;
const MAX_RINGS = 8;
const points = [];

// ── 궁 각도 ──
const PALACE_ANGLES = {
  관록궁: 90,
  복덕궁: 60,
  상모궁: 30,
  처첩궁: 0,
  남녀궁: 330,
  질액궁: 300,
  공백: 270,
  전택궁: 240,
  노복궁: 210,
  재백궁: 180,
  형제궁: 150,
  천이궁: 120,
};

svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);

// ── 동심원 그리기 ──
function drawRings() {
  for (let i = 1; i <= MAX_RINGS; i++) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', i * ringGap);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#000');
    circle.setAttribute('stroke-width', '0.6');
    svg.appendChild(circle);

    // 숫자 레이블 (수직 방향)
    if (i >= 2) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', centerX + 6);
      label.setAttribute('y', centerY - i * ringGap + 4);
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', '#555');
      label.setAttribute('font-family', 'Pretendard, sans-serif');
      label.textContent = i;
      svg.appendChild(label);
    }
  }
}

// ── 축 선 + 궁 필 레이블 ──
function drawAxes() {
  const maxR = MAX_RINGS * ringGap;
  const labelR = maxR + 68;

  Object.entries(PALACE_ANGLES).forEach(([name, angle]) => {
    const rad = (angle * Math.PI) / 180;
    const ex = centerX + Math.cos(rad) * maxR;
    const ey = centerY - Math.sin(rad) * maxR;

    // 축 선
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', ex);
    line.setAttribute('y2', ey);
    line.setAttribute('stroke', '#000');
    line.setAttribute('stroke-width', '0.8');
    svg.appendChild(line);

    // 레이블 위치
    const lx = centerX + Math.cos(rad) * labelR;
    const ly = centerY - Math.sin(rad) * labelR;

    // 검정 점
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', centerX + Math.cos(rad) * (maxR + 12));
    dot.setAttribute('cy', centerY - Math.sin(rad) * (maxR + 12));
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', '#111');
    svg.appendChild(dot);

    // 흰 필 배경
    const pillW = name.length <= 2 ? 64 : name.length <= 3 ? 76 : 88;
    const pillH = 26;
    const pill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    pill.setAttribute('x', lx - pillW / 2);
    pill.setAttribute('y', ly - pillH / 2);
    pill.setAttribute('width', pillW);
    pill.setAttribute('height', pillH);
    pill.setAttribute('rx', '13');
    pill.setAttribute('fill', 'white');
    pill.setAttribute('stroke', '#ccc');
    pill.setAttribute('stroke-width', '1');
    svg.appendChild(pill);

    // 궁 이름 텍스트
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', lx - 8);
    text.setAttribute('y', ly + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '13');
    text.setAttribute('font-family', 'Pretendard, sans-serif');
    text.setAttribute('fill', '#111');
    text.textContent = name;
    svg.appendChild(text);

    // × 버튼 텍스트
    const xBtn = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xBtn.setAttribute('x', lx + pillW / 2 - 14);
    xBtn.setAttribute('y', ly + 5);
    xBtn.setAttribute('text-anchor', 'middle');
    xBtn.setAttribute('font-size', '11');
    xBtn.setAttribute('fill', '#888');
    xBtn.setAttribute('cursor', 'pointer');
    xBtn.textContent = '×';
    svg.appendChild(xBtn);
  });
}

drawRings();
drawAxes();

// ── 방사형 점 계산 ──
function drawRadialPoint(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return {
    px: centerX + Math.cos(rad) * radius * ringGap,
    py: centerY - Math.sin(rad) * radius * ringGap,
  };
}

// ── 동적 요소 redraw ──
function redrawRadial() {
  document.querySelectorAll('.dynamic').forEach((el) => el.remove());

  if (points.length >= 3) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.map((p) => `${p.px},${p.py}`).join(' '));
    polygon.setAttribute('fill', 'rgba(255,92,52,0.15)');
    polygon.setAttribute('stroke', '#ff5c34');
    polygon.setAttribute('stroke-width', '1.5');
    polygon.classList.add('dynamic');
    svg.appendChild(polygon);
  } else if (points.length === 2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', points[0].px); line.setAttribute('y1', points[0].py);
    line.setAttribute('x2', points[1].px); line.setAttribute('y2', points[1].py);
    line.setAttribute('stroke', '#ff5c34');
    line.setAttribute('stroke-width', '1.5');
    line.classList.add('dynamic');
    svg.appendChild(line);
  }

  points.forEach((p) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', p.px);
    dot.setAttribute('cy', p.py);
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', '#ff5c34');
    dot.classList.add('dynamic');
    svg.appendChild(dot);
  });
}

// ── 자유 클릭: 클릭 위치에 점 표시, 판정은 그리드 칸으로 ──
const cellW = CANVAS_W / GRID_COLS;
const cellH = CANVAS_H / GRID_ROWS;

// grid div를 투명한 단일 클릭 영역으로 사용
grid.style.cursor = 'crosshair';

grid.addEventListener('click', (e) => {
  const rect = grid.getBoundingClientRect();

  // 클릭한 실제 픽셀 좌표 (faceContainer 기준)
  const clickX = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  const clickY = (e.clientY - rect.top)  * (CANVAS_H / rect.height);

  // 속한 그리드 칸으로 좌표 판정
  const col = Math.floor(clickX / cellW);
  const row = Math.floor(clickY / cellH);
  const x = Math.round(col - ORIGIN.x);
  const y = Math.round(ORIGIN.y - row);

  let angle = 270;
  if (x > 0) angle += 15;
  if (x < 0) angle -= 15;
  const radius = Math.abs(y);

  const radial = drawRadialPoint(angle, radius);
  points.push({ x, y, px: radial.px, py: radial.py, dotX: clickX, dotY: clickY });
  redrawRadial();

  // 클릭한 정확한 위치에 점 표시
  dotCtx.beginPath();
  dotCtx.arc(clickX, clickY, 5, 0, Math.PI * 2);
  dotCtx.fillStyle = '#ff5c34';
  dotCtx.fill();
  dotCtx.strokeStyle = 'white';
  dotCtx.lineWidth = 1.5;
  dotCtx.stroke();
});

// ── 줌 버튼 ──
let zoomLevel = 1;
document.getElementById('zoomInBtn').addEventListener('click', () => {
  zoomLevel = Math.min(zoomLevel + 0.1, 2);
  svg.style.transform = `scale(${zoomLevel})`;
});
document.getElementById('zoomOutBtn').addEventListener('click', () => {
  zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
  svg.style.transform = `scale(${zoomLevel})`;
});

// ── 분석 함수 ──
function analyzePattern() {
  if (points.length === 0) {
    localStorage.setItem('resultType', 'NONE');
    window.location.href = 'result.html';
    return;
  }

  const distances = points.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const position = avgDistance > 3 ? 'E' : 'C';

  let totalDistance = 0, pairCount = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].px - points[j].px;
      const dy = points[i].py - points[j].py;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      pairCount++;
    }
  }
  const density = pairCount > 0 && totalDistance / pairCount > 100 ? 'D' : 'G';

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const direction = height > width ? 'V' : 'H';

  const structure = points.length === 1 ? 'P' : points.length === 2 ? 'L' : 'S';
  const resultType = `${position}${density}${direction}${structure}`;

  localStorage.setItem('resultType', resultType);
  window.location.href = 'result.html';
}

document.getElementById('analyzeBtn').addEventListener('click', analyzePattern);
