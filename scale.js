/* 모든 페이지 공용 - 1920px 너비 기준 스케일링
   .page-scale 클래스가 붙은 콘텐츠 영역만 스케일
   .bottomNav 는 bottom-left 기준으로 스케일 */
(function () {
  function fit() {
    var s = window.innerWidth / 1920;
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
