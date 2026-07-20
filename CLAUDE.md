# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

마크다운(.md) 파일을 읽어 정적 블로그 웹사이트로 렌더링하는 프로젝트. 별도 프레임워크(React, Vue, Next.js 등) 없이 순수 HTML, CSS, JavaScript만으로 구현한다. 빌드 도구나 번들러 없이 브라우저에서 바로 동작하는 것을 목표로 한다.

## 핵심 요구사항

- **입력**: `posts/` 폴더에 마크다운 파일을 넣으면 블로그 글로 인식되어야 한다.
- **출력**: 목록 페이지(글 리스트)와 상세 페이지(글 본문)를 제공하는 웹사이트.
- **디자인**: 깔끔하고 읽기 편한 타이포그래피 중심 레이아웃. 불필요한 장식 요소를 배제한다.
- **다크 모드**: 시스템 설정(`prefers-color-scheme`)을 기본으로 따르되, 사용자가 수동으로 토글할 수 있어야 한다. 선택한 테마는 로컬에 저장해 재방문 시 유지한다.
- **반응형**: 모바일/태블릿/데스크톱에서 모두 자연스럽게 보여야 한다. 최소 320px 너비부터 대응.
- **프레임워크 없음**: React, Vue 같은 UI 프레임워크, 빌드 스텝(webpack/vite 등)을 사용하지 않는다. Node.js는 로컬 개발 서버 용도로만 허용(선택 사항).

## 기술 스택

- **HTML**: 시맨틱 태그(`<article>`, `<nav>`, `<time>` 등) 사용.
- **CSS**: 순수 CSS. CSS 변수(custom properties)로 라이트/다크 테마 색상을 관리. Flexbox/Grid로 레이아웃 구성. 미디어 쿼리로 반응형 처리.
- **JavaScript**: 바닐라 JS(ES 모듈). 마크다운 파싱은 의존성을 최소화하는 방향으로 처리(경량 파서 직접 구현 또는 CDN 없이 로컬에 포함된 단일 파일 라이브러리 사용 검토).

## 디렉토리 구조

```
/
├── index.html               # 글 목록 페이지
├── post.html                # 글 상세 페이지 (post.html?slug=xxx)
├── serve.py                  # 로컬 개발 서버 (.js를 올바른 MIME 타입으로 서빙)
├── css/
│   ├── theme.css              # CSS 커스텀 프로퍼티(라이트/다크 토큰), reset
│   ├── layout.css              # 헤더/메인/푸터 레이아웃, 반응형
│   ├── typography.css          # 본문 타이포그래피 (.prose)
│   ├── components.css          # 카드, 태그 칩, 검색창
│   └── syntax.css              # 코드 하이라이팅 토큰 색상
├── js/  (전부 ES 모듈)
│   ├── theme.js                 # 다크모드 토글
│   ├── util.js                   # escapeHtml, formatDate, debounce 등
│   ├── frontmatter.js            # YAML 프런트매터 파싱
│   ├── markdown.js               # 마크다운 → HTML (2-pass: 블록 → 인라인)
│   ├── postsData.js              # posts.json + .md fetch/파싱, 캐싱
│   ├── search.js                 # 검색어/태그 필터링
│   ├── highlight.js              # 코드블럭 신택스 하이라이팅
│   ├── listPage.js               # index.html 컨트롤러
│   └── postPage.js               # post.html 컨트롤러
├── posts/
│   ├── posts.json                # 매니페스트: 파일명 배열
│   └── *.md                       # 프런트매터(title/date/tags/excerpt) 포함 글
└── assets/images/
```

## 새 글 추가하는 법

1. `posts/` 폴더에 `YYYY-MM-DD-slug.md` 형식으로 파일 생성 (소문자-하이픈 규칙 고정 — GitHub Pages 등은 대소문자 구분).
2. 파일 상단에 프런트매터 작성:
   ```
   ---
   title: 글 제목
   date: 2026-01-01
   tags: [태그1, 태그2]
   excerpt: 목록에 보여줄 짧은 요약 (생략 가능, 없으면 본문에서 자동 추출)
   ---
   ```
3. `posts/posts.json` 배열에 파일명 추가.

## 로컬 개발 서버

`fetch()`가 `file://`에서 CORS로 막히므로 반드시 HTTP 서버로 열어야 한다. 이 저장소는 `python serve.py`를 쓴다 — 일반 `python -m http.server`는 이 환경에서 `.js`를 `text/plain`으로 서빙해 `<script type="module">`이 아예 실행되지 않는 문제가 있었음(브라우저가 모듈 스크립트는 MIME 타입을 엄격히 검사함). `serve.py`가 `.js/.css/.json/.md`에 올바른 Content-Type을 강제한다.

## 코딩 컨벤션

- 들여쓰기는 2칸 스페이스.
- CSS는 커스텀 프로퍼티(`--bg-color`, `--text-color` 등)로 테마를 정의하고, `:root`와 `[data-theme="dark"]`(또는 `prefers-color-scheme`)로 오버라이드.
- JavaScript는 전역 스코프 오염을 피하기 위해 모듈(`type="module"`) 사용.
- 불필요한 주석은 작성하지 않는다. 자명하지 않은 이유(WHY)가 있을 때만 짧게 남긴다.

## 참고

- 표, 각주, 깊은 중첩 리스트는 마크다운 파서 범위 밖이다.
- 신택스 하이라이팅은 정규식 기반 하이라이터(외부 라이브러리 없음)라 정확도가 완벽하지 않을 수 있다(`js/highlight.js` 참고).
