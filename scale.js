/* 네비바 사이 콘텐츠 영역을 채우는 스케일링
   topNav: 47px 고정 / bottomNav: 73px 고정
   디자인 가시 콘텐츠 높이 = 1080 - 47 - 73 = 960px */
(function () {
  var TOP_H   = 47;
  var BOT_H   = 73;
  var DESIGN_W = 1920;
  var DESIGN_CONTENT_H = 960; // 1080 - 47 - 73

  function fit() {
    var s = window.innerWidth / DESIGN_W;

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
