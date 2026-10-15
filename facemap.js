/* 얼굴 지도 공통: 프로필 말풍선 위치
   말풍선은 .fm-stage 안에 있고 크기는 --u 단위(디자인 418 × 172, 노치 포함).
   점 위 가운데에 띄우고, 화면 좌우 끝을 넘지 않게, 위가 모자라면 점 아래로. */
function placeBubble(bubble, anchor) {
  const stage = bubble.offsetParent || bubble.parentElement;
  const s = bubble.offsetWidth / 418;          // 디자인 1px → 화면 px
  const W = bubble.offsetWidth, H = 172 * s;
  const sr = stage.getBoundingClientRect();
  const r = anchor.getBoundingClientRect();
  const viewW = document.documentElement.clientWidth;

  let left = r.left + r.width / 2 - W / 2;
  let top = r.top - H + 14 * s;
  left = Math.max(8, Math.min(left, viewW - W - 8));
  // 상단 바(48px) 아래로는 올라가지 않게
  if (top < 48 + 8) top = r.bottom + 2 * s;

  bubble.style.left = (left - sr.left) + 'px';
  bubble.style.top = (top - sr.top) + 'px';
}
