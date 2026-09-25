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
})();
