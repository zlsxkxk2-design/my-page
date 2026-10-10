// 게임 서브페이지 생성기
// 사용법: node tools/game-pages/build.mjs            (전체 생성)
//         node tools/game-pages/build.mjs dk zeus    (특정 페이지만)
// 페이지 내용은 data.mjs, 레이아웃(L1~L5)은 아래 LAYOUTS 참고.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GAMES, OPTIONS } from "./data.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE = "https://원격임대.com";
const KAKAO = "https://open.kakao.com/o/gdQUrDrh";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CSS = `
    :root{--bg:#0a0a12;--card:#13131f;--card2:#181828;--border:rgba(255,255,255,0.08);--text:#f0f0ff;--muted:#9a9ab8;--kakao:#ffeb00;--radius:16px;--chip-bg:rgba(255,255,255,0.08);--chip-bg-hover:rgba(255,255,255,0.16);}
    html[data-theme="light"]{--bg:#f5f7fb;--card:#ffffff;--card2:#f1f5fb;--border:rgba(15,23,42,0.10);--text:#111827;--muted:#4b5563;--chip-bg:rgba(15,23,42,0.06);--chip-bg-hover:rgba(15,23,42,0.12);color-scheme:light;}
    .top-right{display:flex;align-items:center;gap:12px;}
    .theme-toggle{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:1px solid var(--border);background:var(--chip-bg);color:var(--text);cursor:pointer;}
    .theme-toggle:hover{background:var(--chip-bg-hover);}
    .theme-toggle .icon-moon{display:none;}
    html[data-theme="light"] .theme-toggle .icon-sun{display:none;}
    html[data-theme="light"] .theme-toggle .icon-moon{display:block;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{background:var(--bg);color:var(--text);font-family:'Noto Sans KR',sans-serif;min-height:100svh;display:flex;flex-direction:column;align-items:center;}
    a{color:inherit;}
    .top-bar{width:100%;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
    .back-link{display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;font-weight:700;text-decoration:none;background:var(--chip-bg);border:1px solid var(--border);padding:8px 14px;border-radius:8px;transition:background 0.2s;}
    .back-link:hover{background:var(--chip-bg-hover);}
    .site-name{font-size:0.9rem;font-weight:900;background:linear-gradient(135deg,#7c3aed,#0088cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
    .wrap{width:100%;max-width:680px;padding:44px 24px 64px;display:flex;flex-direction:column;gap:32px;}
    .game-image{width:100%;border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);}
    .game-image img{width:100%;height:auto;display:block;}
    .eyebrow{font-size:0.78rem;font-weight:900;letter-spacing:0.08em;color:var(--accent-text);text-transform:uppercase;}
    h1{font-size:1.65rem;font-weight:900;letter-spacing:-0.02em;line-height:1.35;}
    h1 em{font-style:normal;color:var(--accent-text);}
    h2{font-size:1.1rem;font-weight:900;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
    h2::before{content:'';width:4px;height:1.1em;border-radius:2px;background:var(--accent);}
    .lead{font-size:0.96rem;color:var(--muted);line-height:1.85;margin-top:12px;}
    .lead strong{color:var(--text);}
    .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
    .chip{font-size:0.78rem;font-weight:700;padding:6px 12px;border-radius:999px;border:1px solid var(--accent-dim);color:var(--accent-text);background:var(--accent-bg);}
    .home-btn{display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.05rem;font-weight:900;color:#fff;text-decoration:none;background:linear-gradient(135deg,#7c3aed,#0088cc);padding:17px 28px;border-radius:14px;box-shadow:0 6px 24px rgba(124,58,237,0.4);transition:opacity 0.2s,transform 0.15s;}
    .home-btn:hover{opacity:0.92;transform:translateY(-2px);}
    .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:26px 22px;}
    .card.accent{border-color:var(--accent-dim);background:linear-gradient(160deg,var(--accent-bg),var(--card) 55%);}
    .points{list-style:none;display:flex;flex-direction:column;gap:14px;}
    .points li{display:flex;gap:12px;font-size:0.92rem;color:var(--muted);line-height:1.7;}
    .points li::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:9px;}
    .points strong{color:var(--text);}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .grid .cell{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 16px;}
    .grid .cell b{display:block;font-size:0.95rem;margin-bottom:6px;color:var(--accent-text);}
    .grid .cell p{font-size:0.85rem;color:var(--muted);line-height:1.65;}
    .steps{list-style:none;counter-reset:s;display:flex;flex-direction:column;gap:14px;}
    .steps li{counter-increment:s;display:flex;gap:14px;align-items:flex-start;font-size:0.92rem;color:var(--muted);line-height:1.7;}
    .steps li::before{content:counter(s);flex-shrink:0;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.9rem;color:#0a0a12;background:var(--accent);}
    .steps strong{color:var(--text);}
    .checks{list-style:none;display:flex;flex-direction:column;gap:10px;}
    .checks li{font-size:0.92rem;color:var(--muted);line-height:1.6;padding-left:28px;position:relative;}
    .checks li::before{content:'✓';position:absolute;left:0;top:0;width:20px;height:20px;border-radius:6px;background:var(--accent-bg);color:var(--accent-text);font-weight:900;font-size:0.8rem;display:flex;align-items:center;justify-content:center;}
    .notice{border-left:4px solid var(--accent);background:var(--card2);border-radius:0 12px 12px 0;padding:18px 18px;font-size:0.9rem;color:var(--muted);line-height:1.75;}
    .notice b{color:var(--text);display:block;margin-bottom:6px;}
    table{width:100%;border-collapse:collapse;font-size:0.86rem;}
    th,td{padding:11px 8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top;line-height:1.5;}
    th{color:var(--muted);font-weight:700;white-space:nowrap;}
    thead th{color:var(--accent-text);font-size:0.8rem;}
    tr:last-child th,tr:last-child td{border-bottom:none;}
    td{font-weight:700;}
    .src{font-size:0.76rem;color:var(--muted);margin-top:12px;line-height:1.6;}
    .opts{display:flex;flex-direction:column;gap:10px;}
    .opt{display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;}
    .opt b{font-size:0.95rem;}
    .opt span{font-size:0.8rem;color:var(--muted);}
    .opt i{font-style:normal;font-size:0.75rem;font-weight:900;color:var(--accent-text);white-space:nowrap;}
    .rec-text{font-size:0.88rem;color:var(--muted);line-height:1.75;margin-top:14px;}
    details{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
    details+details{margin-top:10px;}
    details[open]{border-color:var(--accent-dim);}
    summary{padding:16px 20px;font-size:0.92rem;font-weight:700;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px;}
    summary::-webkit-details-marker{display:none;}
    summary::after{content:'+';font-size:1.2rem;color:var(--accent-text);flex-shrink:0;}
    details[open] summary::after{content:'−';}
    .faq-body{padding:0 20px 16px;font-size:0.88rem;color:var(--muted);line-height:1.8;}
    .cta{display:flex;flex-direction:column;gap:12px;}
    .cta-label{font-size:0.8rem;color:var(--muted);text-align:center;}
    .btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:50px;font-size:1rem;font-weight:700;text-decoration:none;transition:transform 0.2s;}
    .btn:hover{transform:translateY(-2px);}
    .btn-kakao{background:var(--kakao);color:#3a1d1d;box-shadow:0 4px 20px rgba(255,235,0,0.2);}
    .btn-main{color:var(--muted);border:1px solid var(--border);font-size:0.9rem;}
    .btn-main:hover{color:var(--text);}
    .fact-head{display:flex;flex-direction:column;gap:6px;margin-bottom:18px;}
    @media (max-width:480px){.grid{grid-template-columns:1fr;}h1{font-size:1.4rem;}th{white-space:normal;}}`;

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");

// ---------- 섹션 컴포넌트 ----------
const S = {
  image: (g) => `
    <div class="game-image">
      <img src="../gimg/${g.img}" alt="${esc(g.name)} 원격임대 · 원격PC 임대 - 나노원격임대" loading="eager">
    </div>`,
  head: (g) => `
    <div>
      <p class="eyebrow">${esc(g.eyebrow)}</p>
      <h1 style="margin-top:8px">${g.h1}</h1>
      <p class="lead">${g.lead}</p>
      ${g.chips ? `<div class="chips">${g.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}
    </div>`,
  homeBtn: () => `
    <a href="../../index.html#options" class="home-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
      실시간 임대 컴퓨터 확인
    </a>`,
  facts: (g) => `
    <section class="card">
      <h2>${esc(g.name)} 한눈에 보기</h2>
      <table><tbody>${g.facts.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`).join("")}</tbody></table>
    </section>`,
  factHead: (g) => `
    <section class="card accent">
      <div class="fact-head">
        <p class="eyebrow">${esc(g.eyebrow)}</p>
        <h1>${g.h1}</h1>
      </div>
      <table><tbody>${g.facts.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`).join("")}</tbody></table>
      <p class="lead">${g.lead}</p>
    </section>`,
  points: (g) => `
    <section class="card">
      <h2>${esc(g.pointsTitle)}</h2>
      <ul class="points">${g.points.map(([t, d]) => `<li><span><strong>${t}</strong> — ${d}</span></li>`).join("")}</ul>
    </section>`,
  grid: (g) => `
    <section>
      <h2>${esc(g.pointsTitle)}</h2>
      <div class="grid">${g.points.map(([t, d]) => `<div class="cell"><b>${t}</b><p>${d}</p></div>`).join("")}</div>
    </section>`,
  steps: (g) => `
    <section class="card">
      <h2>${esc(g.stepsTitle)}</h2>
      <ol class="steps">${g.steps.map(([t, d]) => `<li><span><strong>${t}</strong><br>${d}</span></li>`).join("")}</ol>
    </section>`,
  checks: (g) => `
    <section class="card accent">
      <h2>이런 분께 추천해요</h2>
      <ul class="checks">${g.checks.map((c) => `<li>${c}</li>`).join("")}</ul>
    </section>`,
  compare: (g) => `
    <section class="card">
      <h2>집 PC로 돌릴 때 vs 원격PC</h2>
      <table><thead><tr><th></th><th>집 PC</th><th>나노 원격PC</th></tr></thead><tbody>
        ${g.compare.map(([k, a, b]) => `<tr><th>${esc(k)}</th><td style="color:var(--muted);font-weight:400">${a}</td><td>${b}</td></tr>`).join("")}
      </tbody></table>
    </section>`,
  notice: (g) => `
    <div class="notice"><b>${g.notice[0]}</b>${g.notice[1]}</div>`,
  spec: (g) => {
    const sp = g.spec;
    const body = sp.cols
      ? `<table><thead><tr><th>항목</th>${sp.cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${sp.rows.map(([k, ...v]) => `<tr><th>${esc(k)}</th>${v.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table>`
      : `<table><tbody>${sp.rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v}</td></tr>`).join("")}</tbody></table>`;
    return `
    <section class="card">
      <h2>${esc(sp.title)}</h2>
      ${body}
      ${sp.note ? `<p class="src">${sp.note}</p>` : ""}
    </section>`;
  },
  recommend: (g) => `
    <section class="card accent">
      <h2>${esc(g.name)} 추천 임대 옵션</h2>
      <div class="opts">${g.recommend.ids.map((id) => {
        const o = OPTIONS[id];
        return `<div class="opt"><div><b>${o.name}</b><br><span>${o.spec}</span></div><i>${o.tag}</i></div>`;
      }).join("")}</div>
      <p class="rec-text">${g.recommend.text}</p>
    </section>`,
  faq: (g) => `
    <section>
      <h2>${esc(g.name)} 원격 임대 자주 묻는 질문</h2>
      ${g.faq.map(([q, a]) => `<details><summary>${q}</summary><div class="faq-body">${a}</div></details>`).join("\n      ")}
    </section>`,
  cta: (g) => `
    <div class="cta">
      <p class="cta-label">${esc(g.ctaLabel || "궁금한 점은 카카오톡으로 편하게 물어보세요")}</p>
      <a href="${KAKAO}" target="_blank" rel="noopener" class="btn btn-kakao">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 11c0 2.937 1.635 5.5 4.11 7.1l-.97 3.57 3.94-2.06C10.3 19.87 11.13 20 12 20c5.523 0 10-3.477 10-8s-4.477-9-10-9z"/></svg>
        카카오톡 문의하기
      </a>
      <a href="../../index.html" class="btn btn-main">자세한 내용 보기 → 나노 홈페이지</a>
    </div>`,
};

// ---------- 레이아웃 (페이지마다 다른 구성) ----------
const LAYOUTS = {
  L1: ["image", "head", "homeBtn", "points", "recommend", "spec", "faq", "cta"],
  L2: ["head", "image", "facts", "checks", "spec", "recommend", "homeBtn", "faq", "cta"],
  L3: ["image", "head", "steps", "facts", "spec", "notice", "recommend", "homeBtn", "faq", "cta"],
  L4: ["head", "homeBtn", "image", "compare", "grid", "recommend", "spec", "faq", "cta"],
  L5: ["factHead", "image", "notice", "points", "spec", "recommend", "homeBtn", "faq", "cta"],
};

function render(g) {
  const url = `${SITE}/game/game/${g.file}.html`;
  const ogImg = `${SITE}/game/gimg/${g.img}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faq.map(([q, a]) => ({ "@type": "Question", name: q.replace(/<[^>]+>/g, ""), acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })),
  };
  const body = LAYOUTS[g.layout].map((k) => S[k](g)).join("\n");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(g.title)}</title>
  <meta name="description" content="${esc(g.description)}">
  <meta name="keywords" content="${esc(g.keywords)}">
  <meta property="og:title" content="${esc(g.title.replace(/ \| 나노원격임대$/, ""))}">
  <meta property="og:description" content="${esc(g.description)}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:url" content="${url}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/png" sizes="32x32" href="../../images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../../images/favicon-16x16.png">
  <meta property="og:site_name" content="나노원격임대">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
  <script>try{if(localStorage.getItem('nano-theme')==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <style>${CSS}
    :root{--accent:${g.accent};--accent-text:${g.accent};--accent-dim:rgba(${hexToRgb(g.accent)},0.35);--accent-bg:rgba(${hexToRgb(g.accent)},0.1);}
    html[data-theme="light"]{--accent-text:color-mix(in srgb, ${g.accent} 62%, #000);}
  </style>
</head>
<body>

  <div class="top-bar">
    <a href="../../index.html" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
      메인으로
    </a>
    <div class="top-right">
      <span class="site-name">나노원격임대</span>
      <button class="theme-toggle" type="button" aria-label="라이트/다크 모드 전환" title="라이트/다크 모드 전환">
        <svg class="icon-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        <svg class="icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </div>

  <main class="wrap">
${body}
  </main>

  <script>document.querySelector(".theme-toggle").addEventListener("click",()=>{const r=document.documentElement,l=r.getAttribute("data-theme")!=="light";l?r.setAttribute("data-theme","light"):r.removeAttribute("data-theme");try{localStorage.setItem("nano-theme",l?"light":"dark")}catch(e){}});</script>
</body>
</html>
`;
}

// ---------- RSS (rss.xml) — 게임 페이지 목록으로 매번 재생성 ----------
const PUNY = "https://xn--i89a73jyusvua.com";
const rfc822 = (d) => new Date(`${d}T09:00:00+09:00`).toUTCString().replace("GMT", "+0000");
function renderRss() {
  const items = [...GAMES].sort((a, b) => b.updated.localeCompare(a.updated));
  const latest = items[0].updated;
  const xmlEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>나노 원격 임대</title>
    <link>${PUNY}/</link>
    <atom:link href="${PUNY}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>24시간 게임 원격PC 임대 — 게임별 원격PC 이용 안내</description>
    <language>ko</language>
    <lastBuildDate>${rfc822(latest)}</lastBuildDate>
${items.map((g) => `
    <item>
      <title>${xmlEsc(g.title.replace(/ \| 나노원격임대$/, ""))}</title>
      <link>${PUNY}/game/game/${g.file}.html</link>
      <description><![CDATA[${g.description}]]></description>
      <pubDate>${rfc822(g.updated)}</pubDate>
      <guid isPermaLink="true">${PUNY}/game/game/${g.file}.html</guid>
    </item>`).join("\n")}

  </channel>
</rss>
`;
}

// ---------- 메인 페이지 "게임별 추천 사양" 섹션 — index.html의 GAMES:START~END 사이를 교체 ----------
function updateIndexGames() {
  const file = join(ROOT, "index.html");
  const html = readFileSync(file, "utf8");
  const re = /(<!-- GAMES:START[^>]*-->)[\s\S]*?(<!-- GAMES:END -->)/;
  if (!re.test(html)) return console.log("index.html: GAMES 마커 없음 (추천 사양 섹션 생략)");
  const cards = GAMES.map((g) => `
          <a class="game-card" href="game/game/${g.file}.html" style="--gc:${g.accent}">
            <span class="game-card-name">${g.name}</span>
            <span class="game-card-desc"><span class="lbl">추천</span><span class="cpus">${g.recommend.ids.map((id) => `<b>${OPTIONS[id].name}</b>`).join(`<span class="sep"> · </span>`)}</span></span>
          </a>`).join("");
  writeFileSync(file, html.replace(re, `$1
        <div class="games-grid">${cards}
        </div>
        $2`));
  console.log("index.html (게임별 추천 사양 " + GAMES.length + "개)");
}

// ---------- sitemap.xml (이미지 사이트맵 포함) — 메인 + 게임 페이지로 매번 재생성 ----------
function renderSitemap() {
  const idx = readFileSync(join(ROOT, "index.html"), "utf8");
  // 메인 페이지의 자체 이미지(옵션·이용 화면)만 이미지 사이트맵에 포함
  const homeImgs = [...idx.matchAll(/<img src="(images\/[^"]+)"/g)].map((m) => `${PUNY}/${m[1]}`);
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const url = (loc, lastmod, freq, prio, imgs) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>${imgs.map((i) => `
    <image:image><image:loc>${i}</image:loc></image:image>`).join("")}
  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${url(`${PUNY}/`, today, "daily", "1.0", homeImgs)}
${GAMES.map((g) => url(`${PUNY}/game/game/${g.file}.html`, g.updated, "monthly", "0.8", [`${PUNY}/game/gimg/${g.img}`])).join("\n")}

</urlset>
`;
}

const only = process.argv.slice(2);
updateIndexGames();
for (const g of GAMES) if (!/^\d{4}-\d{2}-\d{2}$/.test(g.updated || "")) throw new Error(`${g.file}: updated(YYYY-MM-DD) 필요`);
writeFileSync(join(ROOT, "rss.xml"), renderRss());
writeFileSync(join(ROOT, "sitemap.xml"), renderSitemap());
console.log("sitemap.xml");
console.log("rss.xml");
for (const g of GAMES) {
  if (only.length && !only.includes(g.file)) continue;
  for (const k of LAYOUTS[g.layout]) if (!S[k]) throw new Error(`${g.file}: unknown section ${k}`);
  writeFileSync(join(ROOT, "game", "game", `${g.file}.html`), render(g));
  console.log(`${g.file}.html  (${g.layout})`);
}
