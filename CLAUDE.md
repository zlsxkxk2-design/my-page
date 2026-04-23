# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 커뮤니케이션 규칙

사용자에게 질문하거나 승인을 요청할 때는 반드시 한국어로 한다.

사용자가 "업로드해줘" 또는 "올려줘"라고 하면 재확인 없이 즉시 git add → commit → push 한다.
커밋 메시지, 수정 내용, 추가 내용에 대해 사용자에게 재질문하지 않는다. 알아서 적절한 커밋 메시지를 작성하고 바로 실행한다.

---

## 배포

GitHub Pages로 배포 중: `https://github.com/zlsxkxk2-design/my-page` (main 브랜치)  
운영 도메인: `https://원격임대.com/`

```bash
git add <파일명>
git commit -m "설명"
git push origin main
```

**`git add .` 사용 금지** — 특정 파일명만 지정해서 add할 것.  
GitHub Pages는 PHP를 실행하지 않음 → `sitemap.php`는 동작 안 함, 사이트맵은 `sitemap.xml`만 사용.

---

## 파일 구조 및 역할

- `index.html` — 메인 페이지. 히어로, 임대옵션, 서비스특징, 갤러리, FAQ 섹션 포함
- `style.css` — 전체 스타일. CSS 변수(`--tc`, `--tc-dim`)로 옵션카드 tier별 색상 관리
- `script.js` — 파티클 배경, 스크롤 fade-in, 모바일 메뉴, 갤러리 오버레이, 재고 카운터, FAQ 아코디언
- `popup.html` — 공지 팝업. `index.html`이 `fetch()`로 동적 로드 후 DOM에 주입. 쿠키(`nanopopup=hide`)로 하루 숨김 처리
- `sitemap.xml` — 정적 사이트맵. 새 게임 페이지 추가 시 이 파일에 URL 직접 추가 필요
- `sitemap.php` — GitHub Pages에서 실행 안 됨, 무시할 것
- `나노홈페이지_데이터.json` — 사이트 메타정보, 스펙, FAQ 레퍼런스 (실제 렌더링에 사용 안 됨, 참고용)
- `game/game/*.html` — 게임별 서브페이지 (리니지M, 리니지 클래식 등)
- `game/gimg/` — 게임 페이지 전용 이미지 폴더

---

## 재고 카운터

Google Sheets (ID: `1vwCFM0exXmgkN5vz06IA9j4LJxa95oeqtd-ew5cJFVc`) gviz API로 30초마다 갱신.  
`#stock1~4 .count` 요소에 JS가 숫자+"대" 형태로 직접 주입.  
**HTML에 단위 텍스트("대") 따로 넣으면 "0대 대" 중복 발생 — 절대 넣지 말 것.**

---

## 옵션 카드 구조

`.oc` 컴포넌트: `data-tier="low|mid|high|best"` 속성으로 색상 결정.

| tier | 색상 |
|------|------|
| low  | `#4ade80` |
| mid  | `#38bdf8` |
| high | `#a78bfa` |
| best | `#f59e0b` |

`--tc` / `--tc-dim` CSS 변수로 stripe, chip, button, stock 박스 색상 통일.

---

## 게임 페이지 자동 생성 규칙

사용자가 특정 게임의 HTML 페이지 생성을 요청하면 아래 순서로 자동 처리한다. 사용자에게 중간에 재질문하지 않는다.

1. **공식 사양 자동 조회** — 해당 게임의 공식 홈페이지(plaync.com, nexon.com 등)에서 최소/권장 사양(CPU, RAM, GPU, OS, 저장공간 등)을 웹 검색으로 찾아 적용
2. **이미지 적용** — 사용자가 `game/gimg/`에 넣은 이미지 파일명을 확인 후 자동 연결. 이미지가 없으면 파일명만 비워두고 나머지 완성
3. **HTML 생성** — `game/game/lineagem.html` 양식과 동일한 구조로 생성. 게임명·사양·FAQ 내용을 해당 게임에 맞게 모두 교체
4. **sitemap.xml 업데이트** — 새 페이지 URL을 `sitemap.xml`에 자동 추가
5. **업로드** — 사용자가 "업로드해줘"라고 하면 즉시 git add → commit → push

---

## 게임 서브페이지

`game/game/` 폴더에 게임별 HTML 파일. 모두 동일한 레이아웃 구조:  
상단바 → 게임 이미지 → 소개 → hr → 서비스 안내 → 권장사양 → FAQ → CTA 버튼

- 이미지 경로: `../gimg/<파일명>` (상대경로)
- 메인으로 링크: `../../index.html`
- canonical/og:url: `https://원격임대.com/game/game/<파일명>.html`

새 게임 페이지 추가 시 `sitemap.xml`에도 URL 추가 필요.

---

## 팝업 로딩 방식

`index.html`의 히어로 영상 로드 완료(`loadedmetadata`) 시점에 `fetch('popup.html')`로 내용을 가져와 `<body>`에 appendChild.  
팝업 내 JS(쿠키 체크, 닫기 버튼)도 `popup.html` 내부 `<script>`에 포함되어 있어 주입 후 자동 실행됨.
