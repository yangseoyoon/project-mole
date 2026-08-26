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
    const iw = img.width,
      ih = img.height;
    const scale = Math.max(CANVAS_W / iw, CANVAS_H / ih);
    const sw = iw * scale,
      sh = ih * scale;
    const sx = (CANVAS_W - sw) / 2,
      sy = (CANVAS_H - sh) / 2;
    savedCtx.drawImage(img, sx, sy, sw, sh);
  };
  img.src = savedImage;
}

// ── GRID ──
const GRID_COLS = 18;
const GRID_ROWS = 23;
// 얼굴 중심: 캔버스 중앙 (col 9, row 11.5)
const ORIGIN = { col: 9, row: 11.5 };
const grid = document.getElementById('grid');

// ── 방사형 SVG ──
const svg = document.getElementById('radialSvg');
const svgW = svg.parentElement.clientWidth || 600;
const svgH = svg.parentElement.clientHeight || 700;
const centerX = svgW / 2;
const centerY = svgH / 2;
const ringGap = 28;
const MAX_RINGS = 8;
const points = [];

// ── 궁 → 방사형 차트 각도 (커밋 버전 기준 12궁) ──
// 명궁은 PALACE_ANGLES에 없음 → 클릭 시 중앙(radius=0)에 표시
const PALACE_ANGLES = {
  관록궁: 90,  // 이마 중앙
  복덕궁: 60,  // 이마 우상
  상모궁: 30,  // 오른쪽 관자
  처첩궁: 0,   // 오른쪽 눈꼬리
  남녀궁: 330, // 오른쪽 볼
  질액궁: 300, // 오른쪽 턱
  지각궁: 270, // 턱 중앙
  전택궁: 240, // 왼쪽 턱
  노복궁: 210, // 왼쪽 볼
  재백궁: 180, // 왼쪽 눈꼬리
  형제궁: 150, // 왼쪽 관자
  천이궁: 120, // 이마 좌상
};

svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);

// ── 동심원 그리기 ──
function drawRings() {
  for (let i = 1; i <= MAX_RINGS; i++) {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', i * ringGap);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#000');
    circle.setAttribute('stroke-width', '0.6');
    svg.appendChild(circle);

    if (i >= 2) {
      const label = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text',
      );
      label.setAttribute('x', centerX + 5);
      label.setAttribute('y', centerY - i * ringGap + 4);
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', '#555');
      label.setAttribute('font-family', 'Pretendard, sans-serif');
      label.textContent = i;
      svg.appendChild(label);
    }
  }
}

// ── 축 선 + 궁 레이블 ──
function drawAxes() {
  const maxR = MAX_RINGS * ringGap;
  const labelR = maxR + 60;

  Object.entries(PALACE_ANGLES).forEach(([name, angle]) => {
    const rad = (angle * Math.PI) / 180;
    const ex = centerX + Math.cos(rad) * maxR;
    const ey = centerY - Math.sin(rad) * maxR;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', ex);
    line.setAttribute('y2', ey);
    line.setAttribute('stroke', '#000');
    line.setAttribute('stroke-width', '0.8');
    svg.appendChild(line);

    const lx = centerX + Math.cos(rad) * labelR;
    const ly = centerY - Math.sin(rad) * labelR;

    const dot = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    dot.setAttribute('cx', centerX + Math.cos(rad) * (maxR + 12));
    dot.setAttribute('cy', centerY - Math.sin(rad) * (maxR + 12));
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', '#111');
    svg.appendChild(dot);

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

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', lx);
    text.setAttribute('y', ly + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '13');
    text.setAttribute('font-family', 'Pretendard, sans-serif');
    text.setAttribute('fill', '#111');
    text.textContent = name;
    svg.appendChild(text);
  });
}

drawRings();
drawAxes();

// ── 얼굴 구역 → 궁 이름 매핑 ──
// ORIGIN=row11.5 기준, 오벌 가이드(ovalCY=360, ovalRY=340, 출력 830px)에서
// 실제 얼굴 비율 계산값으로 경계 설정
// normY: +1=이마상단, 0=콧대(오벌중심), -0.74=턱
// normX: 0=중앙, ±1=얼굴 좌우 끝
function getPalaceName(normX, normY) {
  const ax = Math.abs(normX);

  // 얼굴 외곽 → 공백
  if (ax > 0.85) return '공백';

  // ── 이마 (row 0~6, normY > +0.48) ──
  if (normY > 0.48) {
    if (ax < 0.30) return '관록궁'; // 이마 중앙
    if (ax < 0.68) return '복덕궁'; // 이마 측면
    return '천이궁';                 // 관자 상단
  }

  // ── 눈썹 (row 6~8, normY +0.30~+0.48) ──
  if (normY > 0.30) {
    if (ax < 0.18) return '관록궁'; // 미간 위
    if (ax < 0.58) return '형제궁'; // 눈썹
    if (ax < 0.82) return '천이궁'; // 관자
    return '공백';
  }

  // ── 눈 / 미간 (row 8~11, normY +0.04~+0.30) ──
  if (normY > 0.04) {
    if (ax < 0.16) return '명궁';   // 미간
    if (ax < 0.48) return '전택궁'; // 눈두덩
    if (ax < 0.74) return '처첩궁'; // 눈꼬리
    return '공백';
  }

  // ── 코 윗부분~코끝 (row 11~14, normY -0.26~+0.04) ──
  if (normY > -0.26) {
    if (ax < 0.16) return '질액궁'; // 코 (콧대~코끝)
    if (ax < 0.52) return '남녀궁'; // 볼 / 광대
    if (ax < 0.76) return '처첩궁'; // 볼 외곽
    return '공백';
  }

  // ── 코 아래 / 인중 (row 14~16, normY -0.43~-0.26) ──
  if (normY > -0.43) {
    if (ax < 0.20) return '재백궁'; // 코 아래 (인중 위)
    if (ax < 0.55) return '남녀궁'; // 아랫볼
    return '공백';
  }

  // ── 입 (row 16~18, normY -0.57~-0.43) ──
  if (normY > -0.57) {
    if (ax < 0.28) return '상모궁'; // 입술
    if (ax < 0.58) return '노복궁'; // 볼 하단
    return '공백';
  }

  // ── 턱 (row 18~23, normY < -0.57) ──
  if (ax < 0.50) return '노복궁';
  return '공백';
}

// 커밋 버전 기준: 기하학적 각도로 가장 가까운 궁 arm에 스냅
function snapToPalaceAngle(normX, normY) {
  const rawAngle = Math.atan2(normY, normX) * (180 / Math.PI);
  const angles = Object.values(PALACE_ANGLES);
  let best = angles[0];
  let bestDiff = Infinity;
  angles.forEach((a) => {
    let diff = Math.abs(rawAngle - a) % 360;
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) { bestDiff = diff; best = a; }
  });
  return best;
}

// ── 반지름: 중심에서 얼마나 떨어졌는지 (0~8링) ──
function calcRadius(normX, normY) {
  const dist = Math.sqrt(normX * normX + normY * normY); // 0~√2
  return Math.min(Math.round((dist * MAX_RINGS) / Math.SQRT2), MAX_RINGS);
}

// ── 방사형 점 좌표 계산 ──
function radialCoord(angle, radius) {
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
    const polygon = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'polygon',
    );
    polygon.setAttribute(
      'points',
      points.map((p) => `${p.px},${p.py}`).join(' '),
    );
    polygon.setAttribute('fill', 'rgba(255,92,52,0.15)');
    polygon.setAttribute('stroke', '#ff5c34');
    polygon.setAttribute('stroke-width', '1.5');
    polygon.classList.add('dynamic');
    svg.appendChild(polygon);
  } else if (points.length === 2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', points[0].px);
    line.setAttribute('y1', points[0].py);
    line.setAttribute('x2', points[1].px);
    line.setAttribute('y2', points[1].py);
    line.setAttribute('stroke', '#ff5c34');
    line.setAttribute('stroke-width', '1.5');
    line.classList.add('dynamic');
    svg.appendChild(line);
  }

  points.forEach((p) => {
    const dot = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    );
    dot.setAttribute('cx', p.px);
    dot.setAttribute('cy', p.py);
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', '#ff5c34');
    dot.classList.add('dynamic');
    svg.appendChild(dot);

    // 궁 이름 툴팁
    const label = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text',
    );
    label.setAttribute('x', p.px + 8);
    label.setAttribute('y', p.py - 8);
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#ff5c34');
    label.setAttribute('font-family', 'Pretendard, sans-serif');
    label.textContent = p.palace;
    label.classList.add('dynamic');
    svg.appendChild(label);
  });
}

// ── dotCanvas: 점 + 연결 글로우 렌더링 ──
function redrawDots() {
  dotCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (points.length === 0) return;

  const COLOR = '#ff5c34';

  if (points.length >= 2) {
    [40, 25, 12].forEach((blur, i) => {
      dotCtx.save();
      dotCtx.shadowColor = COLOR;
      dotCtx.shadowBlur = blur;
      dotCtx.beginPath();
      dotCtx.moveTo(points[0].dotX, points[0].dotY);
      points.forEach((p) => dotCtx.lineTo(p.dotX, p.dotY));
      if (points.length >= 3) dotCtx.closePath();
      dotCtx.strokeStyle = `rgba(255,92,52,${0.6 - i * 0.15})`;
      dotCtx.lineWidth = 1.5;
      dotCtx.stroke();
      dotCtx.restore();
    });

    if (points.length >= 3) {
      dotCtx.save();
      dotCtx.beginPath();
      dotCtx.moveTo(points[0].dotX, points[0].dotY);
      points.forEach((p) => dotCtx.lineTo(p.dotX, p.dotY));
      dotCtx.closePath();
      dotCtx.fillStyle = 'rgba(255,92,52,0.12)';
      dotCtx.fill();
      dotCtx.restore();
    }
  }

  points.forEach((p) => {
    dotCtx.save();
    dotCtx.shadowColor = COLOR;
    dotCtx.shadowBlur = 18;
    dotCtx.beginPath();
    dotCtx.arc(p.dotX, p.dotY, 5, 0, Math.PI * 2);
    dotCtx.fillStyle = COLOR;
    dotCtx.fill();
    dotCtx.restore();
  });
}

// ── 클릭 핸들러 ──
const cellW = CANVAS_W / GRID_COLS;
const cellH = CANVAS_H / GRID_ROWS;
grid.style.cursor = 'crosshair';

grid.addEventListener('click', (e) => {
  const rect = grid.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  const clickY = (e.clientY - rect.top) * (CANVAS_H / rect.height);

  // 그리드 칸 좌표
  const col = Math.floor(clickX / cellW);
  const row = Math.floor(clickY / cellH);

  // 중심 기준 정규화: x 오른쪽+, y 위+ (최대 ±1)
  const normX = (col - ORIGIN.col) / (GRID_COLS / 2);
  const normY = -(row - ORIGIN.row) / (GRID_ROWS / 2);

  // 구역 매핑으로 궁 이름 결정 (표시·저장용)
  const palaceName = getPalaceName(normX, normY);
  if (palaceName === '공백') return; // 얼굴 외곽 클릭 무시

  let angle, radius, px, py;
  if (palaceName === '명궁') {
    // 명궁(미간)은 방사형 차트 중앙에 표시
    angle = 0; radius = 0;
    px = centerX; py = centerY;
  } else {
    // 커밋 버전 기준: 기하학적 각도로 arm에 스냅
    angle = snapToPalaceAngle(normX, normY);
    radius = calcRadius(normX, normY);
    ({ px, py } = radialCoord(angle, radius));
  }
  points.push({
    normX,
    normY,
    angle,
    radius,
    px,
    py,
    dotX: clickX,
    dotY: clickY,
    palace: palaceName,
  });
  redrawRadial();
  redrawDots();
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
    localStorage.setItem('palaceCount', JSON.stringify({}));
    window.location.href = 'result.html';
    return;
  }

  // ① 위치: 얼굴 중심(반지름 ≤ 3)에 집중 vs 외곽
  const avgRadius = points.reduce((s, p) => s + p.radius, 0) / points.length;
  const position = avgRadius > 3 ? 'E' : 'C';

  // ② 밀도: 점이 서로 얼마나 가까운가 (radial 좌표계 거리)
  let totalDist = 0,
    pairCount = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const da = (points[i].angle - points[j].angle + 360) % 360;
      const angleDiff = da > 180 ? 360 - da : da;
      const radDiff = Math.abs(points[i].radius - points[j].radius);
      totalDist += Math.sqrt(angleDiff * angleDiff + radDiff * radDiff);
      pairCount++;
    }
  }
  // 각도 차이 기준: 평균 > 60° 이상이면 분산(D), 아니면 밀집(G)
  const density = pairCount > 0 && totalDist / pairCount > 60 ? 'D' : 'G';

  // ③ 방향: 점 분포가 수직(이마↔턱) vs 수평(좌↔우)
  let direction;
  if (points.length === 1) {
    // 단일 점: 위치 기반 — 좌우 치우침이 더 크면 H
    direction =
      Math.abs(points[0].normX) > Math.abs(points[0].normY) ? 'H' : 'V';
  } else {
    const meanX = points.reduce((s, p) => s + p.normX, 0) / points.length;
    const meanY = points.reduce((s, p) => s + p.normY, 0) / points.length;
    const varX = points.reduce((s, p) => s + (p.normX - meanX) ** 2, 0);
    const varY = points.reduce((s, p) => s + (p.normY - meanY) ** 2, 0);
    direction = varY >= varX ? 'V' : 'H';
  }

  // ④ 구조
  const structure = points.length === 1 ? 'P' : points.length === 2 ? 'L' : 'S';

  const resultType = `${position}${density}${direction}${structure}`;

  // 궁별 점 개수 저장 (result.html에서 활용 가능)
  const palaceCount = {};
  points.forEach((p) => {
    palaceCount[p.palace] = (palaceCount[p.palace] || 0) + 1;
  });
  // 가장 많이 찍힌 궁
  const dominantPalace =
    Object.entries(palaceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  // 흰 배경 + 점 패턴만 따로 저장
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = CANVAS_W;
  exportCanvas.height = CANVAS_H;
  const exportCtx = exportCanvas.getContext('2d');
  exportCtx.fillStyle = '#ffffff';
  exportCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  exportCtx.drawImage(dotCanvas, 0, 0);
  localStorage.setItem('capturedDots', exportCanvas.toDataURL('image/png'));

  localStorage.setItem('resultType', resultType);
  localStorage.setItem('dominantPalace', dominantPalace);
  localStorage.setItem('palaceCount', JSON.stringify(palaceCount));
  window.location.href = 'loading.html';
}

document.getElementById('analyzeBtn').addEventListener('click', analyzePattern);

// ── 다시찍기: 점 초기화 ──
document.getElementById('resetBtn').addEventListener('click', () => {
  points.length = 0;
  redrawDots();
  redrawRadial();
});
