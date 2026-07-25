---
name: publish-post
description: "posts/ 폴더에 새로 추가된 마크다운 글을 찾아 posts.json에 등록하고 git add/commit/push까지 자동으로 처리해 GitHub Pages에 배포한다. '새 글 올려줘', '블로그에 배포해줘', '포스트 발행해줘', '글 게시해줘' 같은 요청에 사용한다."
---

# 블로그 글 자동 배포 스킬

`posts/`에 새로 작성된 마크다운 글을 찾아서 `posts.json`에 등록하고, git add/commit/push까지 한 번에 처리해 GitHub Pages에 반영하는 스킬이다.

**설계 의도**: 사용자가 이 스킬을 명시적으로 요청했다는 것 자체가 "새 글이 있으면 push까지 알아서 해달라"는 승인이다. 그래서 아래 절차는 매 실행마다 push 여부를 다시 묻지 않고 끝까지 자동으로 진행한다. 대신 범위는 엄격히 지킨다 — **새 글 관련 파일만** add/commit하고, 그 외 작업 중이던 변경사항은 절대 함께 커밋하지 않는다.

## 절차

### 1. 새 글 탐색

- `posts/posts.json`을 읽어 이미 등록된 파일명 목록을 파악한다.
- `posts/*.md` 파일 목록과 비교해 posts.json에 **없는** `.md` 파일을 찾는다. 이것이 "새 글"이다.
- 새 글이 하나도 없으면: "등록할 새 글이 없습니다"라고 보고하고 종료한다. 이후 단계를 진행하지 않는다.

### 2. 새 글 검증

각 새 글 파일에 대해:
- YAML 프런트매터(`---title/date/tags/excerpt---`)가 있는지 확인한다.
- `title`이 없으면 파일명을 대신 쓰지만, 사용자에게 프런트매터 누락을 알려준다(차단하지는 않음).
- 파일명이 `YYYY-MM-DD-slug.md` 형식(소문자-하이픈)을 따르는지 확인한다. 아니면 경고만 하고 진행한다(강제로 파일명을 바꾸지 않는다 — 이미 존재하는 파일 이름을 임의로 바꾸면 링크가 깨질 수 있음).

### 3. posts.json 갱신

- `posts/posts.json`은 파일명 문자열 배열이다. 새 글 파일명을 배열 맨 앞쪽에 추가한다(최신순 정렬은 앱이 날짜 기준으로 자동으로 하므로 순서 자체는 중요하지 않지만, 사람이 봤을 때 최신이 위에 있는 게 읽기 편하다).
- 여러 개가 새로 추가됐다면 모두 넣는다.
- 편집 후 JSON이 유효한지(쉼표, 대괄호) 확인한다.

### 4. git add — 관련 파일만 명시적으로

```
git status --porcelain
```
로 현재 저장소 상태를 먼저 확인한다.

- **새 글 관련 파일만** 스테이징한다: 새로 추가된 `.md` 파일들 + `posts/posts.json`.
- `git add -A`나 `git add .`는 쓰지 않는다.
- 만약 저장소에 이 작업과 무관한 다른 미커밋 변경사항(수정 중이던 코드 등)이 있다면, 그건 손대지 않고 최종 보고 시 사용자에게 "이런 변경사항은 그대로 남겨뒀다"고 알려준다.

### 5. git commit

커밋 메시지 규칙 (이 저장소의 기존 커밋 스타일과 통일):
- 새 글이 1개면: `새 글 추가: {title}`
- 새 글이 여러 개면: `새 글 {N}개 추가: {title1}, {title2}, ...`

```
git commit -m "$(cat <<'EOF'
{commit message}

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

### 6. git push

```
git push
```

### 7. GitHub Pages 배포 확인 (선택, `gh` CLI 사용 가능한 경우)

- `gh repo view --json nameWithOwner -q .nameWithOwner`로 `owner/repo`를 알아낸다(하드코딩하지 않는다 — 리모트가 바뀔 수 있음).
- `gh api repos/{owner}/{repo}/pages/builds/latest`를 몇 초 간격으로 폴링해서(최대 약 60초) 방금 push한 커밋 SHA가 `status: built`가 될 때까지 기다린다.
- `gh`가 없거나 Pages가 설정 안 돼 있으면 이 단계는 건너뛰고, "보통 30초 내로 반영됩니다"라고만 안내한다.

### 8. 결과 보고

사용자에게 다음을 요약해서 알려준다:
- 새로 추가/배포된 글 제목과 slug
- 커밋 해시
- 라이브 URL: `https://{owner}.github.io/{repo}/post.html?slug={slug}` (owner/repo는 6번에서 알아낸 값 사용)
- 손대지 않고 남겨둔 다른 미커밋 변경사항이 있었다면 그 목록

## 예외 상황

- `posts/posts.json`이 없거나 JSON 파싱이 안 되면 진행을 멈추고 사용자에게 알린다 — 임의로 새 posts.json을 만들지 않는다.
- git push가 실패하면(예: 원격에 새 커밋이 있어 rejected) 강제 push(`--force`)를 하지 않는다. 실패 이유를 그대로 보고하고 사용자 지시를 기다린다.
- 새 글 파일명이 이미 posts.json에 있는데 내용만 바뀐 경우(오탈자 수정 등)는 "새 글"이 아니라 "기존 글 수정"이므로 이 스킬의 자동 탐색 대상이 아니다 — 사용자가 명시적으로 언급하면 그 파일도 함께 add/commit해도 되지만, 먼저 어떤 파일인지 확인하고 진행한다.
