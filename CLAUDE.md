# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 커뮤니케이션 규칙

사용자에게 질문하거나 승인을 요청할 때는 반드시 한국어로 한다.

**모든 작업은 승인 없이 끝까지 자동 실행한다.**
- 사용자가 작업을 요청하면 중간에 어떤 확인도 없이 완료까지 실행한다.
- "업로드해줘", "올려줘", "만들어줘", "추가해줘", "수정해줘" 등 모든 요청은 git add → commit → push 까지 한 번에 완료한다.
- "이렇게 할게요", "~해서 만들게요" 같은 사전 설명 후 암묵적 승인을 기다리는 행위도 금지한다.
- "업로드할까요?", "진행할까요?", "맞나요?", "괜찮을까요?" 등 일체의 확인성 멘트를 하지 않는다.
- 작업 중 판단이 필요한 상황(사양 미공개 등)은 알아서 최선의 방향으로 결정하고 실행 후 결과만 보고한다.

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

0. **keywords 메타태그 자동 추가** — `<meta name="keywords">` 에 "게임명 원격PC, 게임명 원격임대, 게임명 자동사냥, 게임명 다계정, 게임명 무한사냥, 게임명 PC임대, 원격PC 임대, 나노원격임대" 패턴으로 게임에 맞게 작성
1. **공식 사양 자동 조회** — 해당 게임의 공식 홈페이지(plaync.com, nexon.com 등)에서 최소/권장 사양(CPU, RAM, GPU, OS, 저장공간 등)을 웹 검색으로 찾아 적용
2. **이미지 적용** — 사용자가 `game/gimg/`에 넣은 이미지 파일명을 확인 후 자동 연결. 이미지가 없으면 파일명만 비워두고 나머지 완성
3. **HTML 생성** — `game/game/lineagem.html` 양식과 동일한 구조로 생성. 게임명·사양·FAQ 내용을 해당 게임에 맞게 모두 교체
4. **sitemap.xml 업데이트** — 새 페이지 URL을 `sitemap.xml`에 자동 추가
5. **nav 드랍다운 업데이트** — `index.html`의 `.nav-dropdown-menu` 안에 `<li role="menuitem"><a href="game/game/<파일명>.html">게임명</a></li>` 항목 추가
6. **업로드** — 사용자가 "업로드해줘"라고 하면 즉시 git add → commit → push
7. **네이버 색인 요청** — push 후 운영 도메인에 새 페이지가 뜨는지(200) 확인하고 `powershell -NoProfile -ExecutionPolicy Bypass -File tools/indexnow.ps1 game/game/<파일명>.html` 실행 (IndexNow, 키 파일 `acf4f169846da306f06e75b21cbabdd6.txt`는 루트에 있으므로 삭제 금지). 페이지 내용 수정 시에도 동일하게 실행. 사용자에게 묻지 않고 매번 자동 실행하며, 완료 보고에 네이버 응답 코드를 함께 안내. (구글 서치콘솔은 사용자가 수동 처리 — 자동화하지 않음)
8. **라이브 링크 보고** — 게임 페이지 생성/수정 후 push 완료 시, 완료 보고에 항상 `https://원격임대.com/game/game/<파일명>.html` 링크를 함께 안내
9. **구글 색인 신청용 주소 (항상 맨 마지막)** — 완료 보고의 **가장 마지막 줄**에 사용자가 구글 서치콘솔에 바로 붙여넣을 수 있도록 아래 형식으로 주소를 적는다 (출처 목록보다도 뒤):
   ```
   📌 구글 색인 신청 주소
   https://원격임대.com/game/game/<파일명>.html
   ```

---

## 게임 서브페이지

`game/game/` 폴더에 게임별 HTML 파일. 모두 동일한 레이아웃 구조:  
상단바 → 게임 이미지 → 소개 → hr → 서비스 안내 → 권장사양 → FAQ → CTA 버튼

- 이미지 경로: `../gimg/<파일명>` (상대경로)
- 메인으로 링크: `../../index.html`
- canonical/og:url: `https://원격임대.com/game/game/<파일명>.html`

새 게임 페이지 추가 시 `sitemap.xml`과 `index.html` nav 드랍다운 양쪽에 모두 추가 필요.

---

## 히어로 배너 교체 규칙

배너 이미지는 `banner/` 폴더, 마크업은 `index.html`의 `.hero-banner-slides` / `.hero-banner-dots`.

- 사용자가 "배너 올렸어", "배너 N 교체/추가/제거" 라고 하면 `banner/` 폴더의 파일명을 확인 후 자동 반영
- **파일명 변경**: 사용자가 올린 이미지(`banner3.jpg` 등)는 `git mv`로 게임 영문 슬러그 파일명으로 바꾼다 (예: `rf-online-next.jpg`, `dokkaebi-world.jpg`) — 이미지 검색 SEO용
- 슬라이드 구조 (**해당 게임의 공식 홈페이지**를 웹 검색으로 찾아 새 탭 링크로 연결. 우리 사이트 서브페이지 아님):
  ```html
  <a href="<공식 홈페이지>" target="_blank" rel="noopener" class="hero-banner-slide"><img src="banner/<슬러그>.jpg" alt="게임명 원격PC 임대 - 나노원격임대" width="<실제 가로>" height="<실제 세로>"><span class="sr-only">게임명 원격PC 임대 · 게임명 자동사냥 · 게임명 공식 홈페이지</span></a>
  ```
- 게임명은 **화면에 보이지 않고 검색엔진에만 노출**: `alt` + `.sr-only` 숨김 텍스트(style.css에 정의). 이미지 위에 글자를 표시하지 말 것
- width/height는 실제 이미지 픽셀 크기로 기입
- 슬라이드와 dot `<button class="hero-banner-dot" role="tab" aria-label="배너 N로 이동"></button>` 은 **항상 개수를 맞출 것**
- 첫 번째 슬라이드와 첫 번째 dot에만 `is-active` 클래스
- **배너 내리기**: 슬라이드·dot 제거와 함께 해당 이미지 파일도 `git rm`으로 `banner/` 폴더에서 삭제
- 슬라이드 루프/자동재생(5초)은 `script.js`가 자식 개수 기준으로 처리하므로 JS 수정 불필요
- 반영 후 바로 git add(해당 이미지 + index.html) → commit → push → 메인 페이지 네이버 색인 요청 (`tools/indexnow.ps1 / game/game/<해당 게임>.html` — 루트 `/` 단독 전송은 네이버가 422를 반환하므로 관련 게임 페이지와 함께 전송)

---

## 팝업 로딩 방식

`index.html`의 히어로 영상 로드 완료(`loadedmetadata`) 시점에 `fetch('popup.html')`로 내용을 가져와 `<body>`에 appendChild.  
팝업 내 JS(쿠키 체크, 닫기 버튼)도 `popup.html` 내부 `<script>`에 포함되어 있어 주입 후 자동 실행됨.
