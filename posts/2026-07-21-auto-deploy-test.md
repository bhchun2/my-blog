---
title: 자동 배포 테스트
date: 2026-07-21
tags: [테스트, 배포]
excerpt: 새 글을 push하면 GitHub Pages에 자동으로 반영되는지 확인하는 글입니다.
---

이 글은 `git push`만으로 GitHub Pages 사이트에 새 글이 자동 반영되는지 확인하기 위한 테스트용 글입니다.

빌드 스텝이 따로 없는 정적 사이트라, 과정은 단순합니다.

1. `posts/`에 마크다운 파일 추가
2. `posts/posts.json`에 파일명 등록
3. `git add` → `git commit` → `git push`
4. GitHub Pages가 몇 초~1분 내로 자동 빌드

이 문단까지 사이트에서 보인다면 테스트는 성공입니다.
