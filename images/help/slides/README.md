# 점 패턴 분석하기 도움말 슬라이드

`camera-help.html` 이 순서대로 보여주는 1920×1080 화면 캡처 (도움말 패널은 이미지에 없음, 페이지가 위에 올림).

| 파일 | 캡처 주소 | 문구 |
|---|---|---|
| camera-1.png | `camera#capture=1` | 자신이 어떤 점 패턴을… |
| camera-2.png | `camera#capture=2` | 가이드 선에 맞춰서 얼굴 사진을 찍어주세요. |
| camera-3.png | `camera#capture=3` | 아래 슬라이드로 얼굴크기를… |
| camera-4.png | `system#capture=1` | 얼굴에 직접 점을 찍을 수 있습니다. |
| camera-5.png | `system#capture=2` | 찍은 점은 패턴으로 재구성됩니다. |

## 다시 캡처하기

camera.html / system.html 을 고친 뒤, 서버(`npx serve -p 3000 .`)를 켠 상태에서:

```bash
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
for p in "camera-1 camera#capture=1" "camera-2 camera#capture=2" "camera-3 camera#capture=3" "camera-4 system#capture=1" "camera-5 system#capture=2"; do
  set -- $p
  "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 \
    --virtual-time-budget=8000 --screenshot="images/help/slides/$1.png" "http://localhost:3000/$2"
done
```

- `#capture=N` 이면 각 페이지의 기존 블러 도움말(help-tour.js, 단계 정의는 camera.html / system.html 안)이
  N 번째 단계를 패널 없이·애니메이션 없이 보여줌. 평소에는 이 블러 도움말은 실행되지 않음.
- 단계 정의(선명한 구간·예시 사진 등)를 바꾸면 캡처에 그대로 반영됨.
- 패널 위치가 바뀌면 `camera-help.html` 의 `SLIDES` 좌표(left/top)도 고칠 것.
  브라우저 창을 1920×1080 으로 두고 `camera#capture=N` 을 열어 `.htour-panel` 위치를 재면 됨.
