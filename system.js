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
const GRID_COLS = 23;
const GRID_ROWS = 19;
const ORIGIN = { col: 12, row: 8 };
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

// ── 궁 → 방사형 차트 각도 ──
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

// ── 궁별 설명 ──
const PALACE_DESC = {
  명궁:  { sub: '命宮 · 삶의 흐름과 중심', body: '명궁은 두 눈썹 사이, 미간에 위치한 십이궁의 중심이 되는 궁이다. 삶의 흐름과 정신적 균형, 운명의 전체적인 방향성을 상징하는 영역으로 얼굴 전체를 해석하는 기준점과도 같다.' },
  형제궁: { sub: '兄弟宮 · 형제·친구와의 인연', body: '형제궁은 양쪽 눈썹 전체에 해당하는 영역으로 형제자매와의 성향, 관계, 인연과 운을 풀이한다. 여기서 형제란 단순히 혈육만을 뜻하는 것이 아니라 동년배, 즉 친구를 의미하기도 한다.' },
  처첩궁: { sub: '妻妾宮 · 배우자·애정운', body: '양 쪽 눈꼬리 끝에서부터 관자놀이까지에 해당하는 영역으로 부부 관계, 애정운, 배우자나 이성과의 인연을 본다. 현대에서 처와 첩의 구조는 맞지 않다 판단해 부부궁이라고도 불린다.' },
  노복궁: { sub: '奴僕宮 · 부하·노년기', body: '턱 끝과 그 주변에 해당하는 영역으로 부하나 제자와 같이 자신을 따르는 이들과 노년기를 나타낸다. 과거 노복(奴僕)은 \'부리는 종\'의 의미였으나, 현대에서는 나를 따르는 이로 해석한다.' },
  관록궁: { sub: '官祿宮 · 사회적 지위·명예', body: '관록궁은 이마의 정중앙에 해당하는 영역으로 사회적 지위와 명예, 직업과 관련된 운을 풀이한다. \'관\'은 출세, \'록\'은 재물을 뜻하며, 삶에서 어떤 태도로 목표를 추구하는지 보여준다.' },
  상모궁: { sub: '相貌宮 · 풍모·사회적 위신', body: '상모궁은 얼굴 전체의 형상과 조화를 뜻하는 영역으로 상황에 따라서 볼을 뜻하기도 한다. 십이궁 전체를 아우르는 풍모와 기상, 사회적 위신을 나타내며 얼굴의 모든 부위가 얼마나 유기적으로 잘 어우러졌는가를 판단한다.' },
  복덕궁: { sub: '福德宮 · 조상의 덕·심리적 평안', body: '복덕궁은 눈썹 위 양쪽 이마에 해당하는 영역으로 조상의 덕과 본인의 심리적 평안과 관련된 운을 풀이한다. 복덕궁은 한자 그대로 평생의 복(福)과 덕(德)의 많고 적음을 보여준다.' },
  재백궁: { sub: '財帛宮 · 재물의 흐름', body: '재백궁은 코 전체에 해당하는 영역으로, \'재물과 재산이 모이는 자리\'라는 뜻을 지닌다. 재산의 축적과 소모 등 재물의 흐름과 관련된 운을 풀이하며, 전통 관상에서는 이를 개인의 욕망과 연결해 해석하기도 한다.' },
  전택궁: { sub: '田宅宮 · 주거·부동산', body: '전택궁은 눈두덩이와 눈 아래에 해당하는 영역으로 재산, 주거환경, 부동산과 관련된 운을 풀이한다. 주거의 안정과 개인의 심리적 안정 및 편안함과도 연결해 해석한다.' },
  질액궁: { sub: '疾厄宮 · 건강·재앙', body: '질액궁은 두 눈 사이 콧대가 시작되는 지점에 해당하는 영역으로 건강, 질병 혹은 재앙이나 사고에 관한 운을 풀이한다. 질(疾)은 육체적인 질병처럼 내적인 건강 상태를, 액(厄)은 외부 혹은 정신적 상해를 의미한다.' },
  남녀궁: { sub: '男女宮 · 자녀·애정운', body: '남녀궁은 눈 밑 애교살 부위에 해당하는 영역으로 부부간의 애정운과 자녀와의 인연 혹은 생식 능력에 관련된 운을 풀이한다. 자식복을 살피는 궁이기 때문에 자녀궁이라고 불리기도 한다.' },
  천이궁: { sub: '遷移宮 · 이동·이사·해외진출', body: '천이궁은 양 눈썹 끝 위쪽의 이마 모서리(관자놀이 부근)에 해당하는 영역으로 이사나 이직, 해외진출과 같은 이동수를 전체적으로 풀이한다. 삶에서 일어나는 모든 공간적·환경적 이동을 뜻하므로 역마궁이라 불리기도 한다.' },
};

function showPalaceDesc(name) {
  const panel = document.querySelector('.sys-right-bottom');
  const info = PALACE_DESC[name];
  if (!panel) return;
  const existing = panel.querySelector('#palace-desc-content');
  if (existing) existing.remove();
  if (!info) return;
  const div = document.createElement('div');
  div.id = 'palace-desc-content';
  div.innerHTML = `<p class="pdc-name">${name}</p><p class="pdc-sub">${info.sub}</p><p class="pdc-body">${info.body}</p>`;
  panel.appendChild(div);
}

// ── 얼굴 구역 → 궁 이름 매핑 ──
// dx = col - ORIGIN.col, dy = ORIGIN.row - row (정수 그리드 단위)
// 좌우 대칭: |dx|로 거리 판별, dx 부호는 방사형 ±15° offset에 사용
function getPalaceName(dx, dy) {
  const adx = Math.abs(dx);

  // 이마 상단 (dy > 2)
  if (dy > 2) {
    if (adx <= 2) return '관록궁';
    if (adx <= 6) return '복덕궁';
    if (adx <= 10) return '천이궁';
    return '공백';
  }

  // 눈썹 (dy 1~2)
  if (dy >= 1) {
    if (adx <= 1) return '명궁';
    if (adx <= 5) return '형제궁';
    if (adx <= 9) return '처첩궁';
    return '공백';
  }

  // 미간 / 눈 (dy -1~1)
  if (dy >= -1) {
    if (adx <= 1) return '명궁';
    if (adx <= 4) return '전택궁';
    if (adx <= 9) return '처첩궁';
    return '공백';
  }

  // 코 / 볼 상단 (dy -4~-1)
  if (dy >= -4) {
    if (adx <= 2) return '질액궁';
    if (adx <= 5) return '남녀궁';
    if (adx <= 8) return '상모궁';
    return '공백';
  }

  // 인중 / 볼 중단 (dy -6~-4)
  if (dy >= -6) {
    if (adx <= 3) return '재백궁';
    if (adx <= 7) return '상모궁';
    return '공백';
  }

  // 입 / 볼 하단 (dy -8~-6)
  if (dy >= -8) {
    if (adx <= 5) return '상모궁';
    return '공백';
  }

  // 턱 (dy < -8)
  if (adx <= 6) return '노복궁';
  return '공백';
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

  // 그리드 칸 → 원점 기준 정수 좌표
  const col = Math.floor(clickX / cellW);
  const row = Math.floor(clickY / cellH);
  const dx = col - ORIGIN.col;       // 양(+)=오른쪽, 음(-)=왼쪽
  const dy = ORIGIN.row - row;       // 양(+)=위, 음(-)=아래

  const palaceName = getPalaceName(dx, dy);
  if (palaceName === '공백') return;

  let angle, radius, px, py;

  if (palaceName === '명궁') {
    angle = 0; radius = 0;
    px = centerX; py = centerY;
  } else {
    const baseAngle = PALACE_ANGLES[palaceName];
    const offset = dx > 0 ? 15 : dx < 0 ? -15 : 0;
    angle = (baseAngle + offset + 360) % 360;
    radius = Math.min(Math.abs(dy), MAX_RINGS);
    if (radius === 0) radius = 1;
    ({ px, py } = radialCoord(angle, radius));
  }

  points.push({ dx, dy, angle, radius, px, py, dotX: clickX, dotY: clickY, palace: palaceName });
  redrawRadial();
  redrawDots();
  showPalaceDesc(palaceName);
});

// ── 줌 버튼 ──
let zoomLevel = 0.9;
svg.style.transform = `scale(${zoomLevel})`;
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

  // ① 위치: 평균 반지름 ≤ 3 → C(중심), > 3 → E(외곽)
  const avgRadius = points.reduce((s, p) => s + p.radius, 0) / points.length;
  const position = avgRadius > 3 ? 'E' : 'C';

  // ② 밀도: 방사형 점 간 pixel 거리 평균 ≤ 100 → G(집중), > 100 → D(분산)
  let totalDist = 0, pairCount = 0;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const ddx = points[i].px - points[j].px;
      const ddy = points[i].py - points[j].py;
      totalDist += Math.sqrt(ddx * ddx + ddy * ddy);
      pairCount++;
    }
  }
  const density = pairCount > 0 && totalDist / pairCount > 100 ? 'D' : 'G';

  // ③ 방향: 그리드 좌표 분산 기준 (dy 분산 > dx 분산 → V, 아니면 H)
  let direction;
  if (points.length === 1) {
    direction = Math.abs(points[0].dy) >= Math.abs(points[0].dx) ? 'V' : 'H';
  } else {
    const mnDx = points.reduce((s, p) => s + p.dx, 0) / points.length;
    const mnDy = points.reduce((s, p) => s + p.dy, 0) / points.length;
    const varX = points.reduce((s, p) => s + (p.dx - mnDx) ** 2, 0);
    const varY = points.reduce((s, p) => s + (p.dy - mnDy) ** 2, 0);
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

document.getElementById('analyzeBtn').addEventListener('click', function() {
  if (window.playKeyboard) window.playKeyboard();
  analyzePattern();
});

// ── 다시찍기: 점 초기화 ──
document.getElementById('resetBtn').addEventListener('click', () => {
  points.length = 0;
  redrawDots();
  redrawRadial();
});
