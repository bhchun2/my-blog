# 📝 My Blog

마크다운 파일을 쓰면 그대로 블로그 글이 되는 개인 블로그입니다. React나 Vue 같은 프레임워크, 빌드 도구 없이 순수 **HTML / CSS / JavaScript**만으로 만들었습니다.

🔗 **라이브 사이트**: **[bhchun2.github.io/my-blog](https://bhchun2.github.io/my-blog/)**
📦 **저장소**: [github.com/bhchun2/my-blog](https://github.com/bhchun2/my-blog)

---

## ✨ 기능

| 기능 | 설명 |
|---|---|
| 🌗 다크 모드 | 시스템 설정 자동 감지 + 수동 토글, 선택값은 로컬에 저장 |
| ✨ 별 배경 애니메이션 | 다크 모드에서만 은은하게 반짝이는 배경 |
| 📱 반응형 | 320px 모바일부터 데스크톱까지 대응 |
| 🔍 검색 & 태그 필터 | 클라이언트에서 즉시 필터링 |
| 📋 최신 글 게시판 | 검색창 아래 최신 10개를 목록형으로 표시 |
| 🗃 전체 글 카드 + 페이지네이션 | 10개 단위로 페이지 이동 |
| 🎨 코드 하이라이팅 | 외부 라이브러리 없는 자체 하이라이터 |

---

## 🗂 폴더 구조

```
/
├── index.html          # 글 목록 페이지
├── post.html           # 글 상세 페이지 (post.html?slug=xxx)
├── serve.py             # 로컬 개발 서버
├── css/                 # theme / layout / typography / components / syntax / starfield
├── js/                  # 마크다운 파서, 프런트매터 파서, 목록/상세 페이지 컨트롤러 등 (전부 ES 모듈)
├── posts/
│   ├── posts.json        # 등록된 글 파일명 목록 (매니페스트)
│   └── *.md               # 글 원본 (프런트매터 포함)
└── assets/images/
```

자세한 설계는 [CLAUDE.md](./CLAUDE.md) 참고.

---

## 🖥 로컬에서 확인하기

`fetch()`가 `file://`에서 CORS로 막히기 때문에 `index.html`을 더블클릭해서 열면 동작하지 않습니다. 반드시 로컬 서버로 열어야 합니다.

```bash
python serve.py        # http://localhost:8000
```

> 일반 `python -m http.server`는 Windows에서 `.js`를 `text/plain`으로 서빙해 모듈 스크립트가 실행되지 않는 문제가 있어, MIME 타입을 강제하는 `serve.py`를 씁니다.

---

## ✍️ 새 글 쓰는 법

1. `posts/` 폴더에 `YYYY-MM-DD-slug.md` 형식으로 파일 생성 (소문자-하이픈 고정 — GitHub Pages는 대소문자를 구분합니다)
2. 파일 맨 위에 프런트매터 작성:
   ```yaml
   ---
   title: 글 제목
   date: 2026-01-01
   tags: [태그1, 태그2]
   excerpt: 목록에 보여줄 짧은 요약 (생략 가능)
   ---
   ```
3. `posts/posts.json` 배열에 파일명 추가
4. `git add` → `git commit` → `git push`

### 🤖 자동으로 하고 싶다면

이 저장소에는 `/publish-post`라는 Claude Code 스킬이 등록되어 있습니다. `posts/`에 새 글만 써 두고 "새 글 올려줘"라고 요청하면, posts.json 등록부터 git add/commit/push, GitHub Pages 배포 확인까지 한 번에 처리합니다. (`.claude/skills/publish-post/SKILL.md`)

---

## 🚀 배포 구조 (GitHub Pages)

- **Settings → Pages**: `master` 브랜치, `/ (root)` 폴더에서 서빙
- `.nojekyll` 파일로 Jekyll 처리를 건너뛰어 `.md`/`.json`이 원본 그대로 서빙되도록 함
- `master`에 push하면 보통 **10~30초 내** 자동으로 재빌드·반영됩니다

빌드 상태를 직접 확인하고 싶다면:

```bash
gh api repos/bhchun2/my-blog/pages/builds/latest
```

---

## 🔧 관리 시 주의할 점

- **파일명은 항상 소문자-하이픈**: Windows는 대소문자를 구분하지 않지만 GitHub Pages는 구분해서, 로컬에선 멀쩡하다가 배포 후에만 깨지는 경우가 있습니다.
- **화면이 안 바뀔 때**: 대부분 브라우저 캐시 문제입니다. `Ctrl+Shift+R`(강력 새로고침)로 먼저 확인하세요.
- **표(테이블)·각주·깊은 중첩 리스트는 지원하지 않습니다**: 자체 마크다운 파서(`js/markdown.js`)의 의도적인 한계입니다.
