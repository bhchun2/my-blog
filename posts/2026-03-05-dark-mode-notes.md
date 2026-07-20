---
title: 다크 모드 구현하며 배운 것들
date: 2026-03-05
tags: [개발, CSS, 다크모드]
excerpt: CSS 커스텀 프로퍼티와 prefers-color-scheme으로 다크모드를 구현한 기록.
---

다크모드를 구현할 때 핵심은 색상을 하드코딩하지 않고 **CSS 커스텀 프로퍼티**로 추상화하는 것입니다.

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1d21;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #14161a;
    --color-text: #e7e9ec;
  }
}
```

여기에 `data-theme` 속성을 이용한 수동 토글을 추가하면 사용자가 시스템 설정과 무관하게 원하는 테마를 선택할 수 있습니다. 선택한 값은 `localStorage`에 저장해서 재방문 시에도 유지되도록 했습니다.

가장 중요한 디테일은 **FOUC(깜빡임) 방지**입니다. `<head>`에서 CSS가 로드되기 전에 작은 인라인 스크립트로 저장된 테마를 먼저 적용해야 화면이 잠깐 하얗게 번쩍이는 현상을 막을 수 있습니다.
