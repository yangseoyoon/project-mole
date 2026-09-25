(function () {
  function makeAudio(src, vol) {
    var a = new Audio(src);
    a.volume = vol !== undefined ? vol : 0.6;
    return a;
  }

  var _pop      = makeAudio('sounds/pop-sound-effect.mp3', 0.6);
  var _click    = makeAudio('sounds/spacebar-click.mp3',   0.4);
  var _camClick = makeAudio('sounds/camera-click.mp3',     0.7);
  var _keyboard = makeAudio('sounds/computer-keyboard.mp3',0.6);

  function play(audio) {
    audio.currentTime = 0;
    audio.play().catch(function () {});
  }

  window.playPop       = function () { play(_pop); };
  window.playCamClick  = function () { play(_camClick); };
  window.playKeyboard  = function () { play(_keyboard); };

  // 모든 클릭에 spacebar-click 사운드
  document.addEventListener('click', function () { play(_click); }, true);

  // 네비게이션 클릭: 사운드 재생 후 이동 (즉시 페이지 이동 시 오디오 끊김 방지)
  document.addEventListener('click', function (e) {
    // <a href> 링크
    var link = e.target.closest('a[href]');
    if (link) {
      var href = link.getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript') && link.target !== '_blank') {
        e.preventDefault();
        e.stopImmediatePropagation();
        play(_click);
        setTimeout(function () { window.location.href = href; }, 120);
        return;
      }
    }

    // onclick 속성에 location.href 가 있는 버튼/요소
    var btn = e.target.closest('[onclick]');
    if (btn) {
      var oc = btn.getAttribute('onclick') || '';
      var m = oc.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
      if (m) {
        e.preventDefault();
        e.stopImmediatePropagation();
        play(_click);
        var dest = m[1];
        setTimeout(function () { window.location.href = dest; }, 120);
        return;
      }
      if (/history\.back\(\)/.test(oc)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        play(_click);
        setTimeout(function () { history.back(); }, 120);
        return;
      }
    }
  }, true);
})();
