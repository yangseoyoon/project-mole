/* 1920×1080 고정 구성 페이지(.page-scale)를 창 안에 통째로 맞춰 가운데 배치.
   캔버스·인포그래픽처럼 재배치가 어려운 페이지용 (result.html, gwansang-banwi.html).
   상·하단 바는 nav.css 의 body.rwd 반응형 규칙을 따른다.
   페이지 JS 는 style.transform 의 scale(…) 값을 배율로 읽을 수 있다. */
(function () {
  var DESIGN_W = 1920, DESIGN_H = 1080;
  function fit() {
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var s = Math.min(window.innerWidth / DESIGN_W, vh / DESIGN_H);
    var x = Math.max(0, (vw - DESIGN_W * s) / 2);
    var y = Math.max(0, (vh - DESIGN_H * s) / 2);
    document.querySelectorAll('.page-scale').forEach(function (el) {
      el.style.transformOrigin = 'top left';
      el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    });
  }
  fit();
  window.addEventListener('resize', fit);
})();
