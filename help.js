(function () {
  const overlay = document.createElement('div');
  overlay.id = 'helpPanelOverlay';
  document.body.appendChild(overlay);

  const panel = document.createElement('div');
  panel.id = 'helpPanel';

  function dot(text) {
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:1.4em;height:1.4em;border-radius:50%;background:#e9f056;border:1px solid #000;vertical-align:middle;margin:0 1px;font-size:inherit;font-weight:inherit;">${text}</span>`;
  }

  panel.innerHTML = `
    <div style="
      padding: 21px 26px 32px;
      font-family:'Pretendard',sans-serif;
      color:#000;
      height:100%;
      box-sizing:border-box;
      overflow-y:auto;
    ">
      <p style="font-weight:700;font-size:36px;line-height:1;margin:0 0 87px;">ABOUT</p>

      <div style="font-weight:500;font-size:17px;line-height:32px;word-break:break-word;">
        <p style="margin:0 0 17px;">DOT SHIFT는 ${dot('점')}이라는 작은 흔적을 다양한 의미와 관점에서 탐구하고, 이를 새로운 방식으로 재해석하는 프로젝트이다.</p>

        <p style="margin:0 0 17px;">${dot('점')}이라는 누구나 가지고 있는 아주 사소한 흔적이지만 동시에 누군가를 대표하는 강력한 특징이기도 하다. 우리가 흔히 사용하는 ${dot('점')}이라는 단어는 다양한 의미를 가지고 있다. 피부 위의 ${dot('점')}, 위치를 나타내는 ${dot('점')}, 그리고 문장과 숫자를 이루는 구두${dot('점')}까지... DOT SHIFT는 이러한 동음이의어의 ${dot('점')}과 문화권 별 다양한 개념을 통해 ${dot('점')}이라는 작은 기호의 확장을 보여준다.</p>

        <p style="margin:0;">DOT SHIFT는 그 사소하지만 강력한 ${dot('점')}이라는 요소를 피부의 흔적으로 바라보는 데서 벗어나, 개인의 정체성을 구성하고 설명하는 새로운 방식으로 재정의하는 프로젝트이다.</p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  function openHelp() {
    if (window.playPop) window.playPop();
    panel.classList.add('active');
    overlay.classList.add('active');
  }
  function closeHelp() {
    panel.classList.remove('active');
    overlay.classList.remove('active');
  }

  overlay.addEventListener('click', closeHelp);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHelp(); });

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.bn-help-btn');
    if (btn) btn.addEventListener('click', openHelp);
  });

  window.openHelpPanel  = openHelp;
  window.closeHelpPanel = closeHelp;
})();
