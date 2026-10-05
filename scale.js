/* 모든 페이지 공용 - 1920×1080 contain 스케일링
   너비/높이 중 작은 쪽 기준으로 스케일 → 어떤 비율에서도 숨겨진 영역 노출 없음
   .page-scale 은 top-left 기준, .bottomNav 는 bottom-left 기준 */
(function () {
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.querySelectorAll('.page-scale').forEach(function (el) {
      el.style.transformOrigin = 'top left';
      el.style.transform = 'scale(' + s + ')';
    });
    document.querySelectorAll('.bottomNav').forEach(function (el) {
      el.style.transformOrigin = 'bottom left';
      el.style.transform = 'scale(' + s + ')';
    });
  }
  fit();
  window.addEventListener('resize', fit);
})();
