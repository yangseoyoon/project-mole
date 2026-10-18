/* 도움말을 언제 보여줄지 정하는 공통 규칙
   - 하단 네비게이션바 버튼(.bn-item)을 누를 때마다 sound.js 가 sessionStorage 'navEntry' 에 새 번호를 적음
   - 각 페이지 도움말은 그 번호마다 한 번만: 네비게이션바로 새로 들어온 뒤 처음 볼 때만 나오고,
     뒤로가기·새로고침·다시 돌아오기로는 안 나옴. 네비게이션바를 다시 누르면 또 나옴
   사용: if (helpGate('페이지이름')) { 도움말 열기 } */
window.helpGate = function (key) {
  try {
    var entry = sessionStorage.getItem('navEntry') || '0';  // 주소로 바로 들어온 경우도 한 번은 보여줌
    var seenKey = 'helpSeen:' + key;
    if (sessionStorage.getItem(seenKey) === entry) return false;
    sessionStorage.setItem(seenKey, entry);
    return true;
  } catch (e) {
    return true;  // 저장소를 못 쓰면 예전처럼 매번 보여줌
  }
};
