// 구글 서치콘솔 사이트맵 제출 / 색인 상태 조회
// 서비스 계정 키(JSON)는 저장소 밖에 둔다: %USERPROFILE%\.nano\gsc-key.json (또는 환경변수 GSC_KEY)
//
// 사용법:
//   node tools/google-search-console.mjs sites                          (접근 가능한 속성 목록)
//   node tools/google-search-console.mjs sitemap                        (sitemap.xml 제출)
//   node tools/google-search-console.mjs inspect game/game/dk.html      (색인 상태 조회)
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";

const KEY_PATH = process.env.GSC_KEY || join(homedir(), ".nano", "gsc-key.json");
const ORIGIN = "https://원격임대.com/";
const SITEMAP = ORIGIN + "sitemap.xml";

const b64url = (v) => Buffer.from(v).toString("base64url");

async function getToken() {
  let key;
  try {
    key = JSON.parse(readFileSync(KEY_PATH, "utf8"));
  } catch {
    throw new Error(`서비스 계정 키 파일이 없습니다: ${KEY_PATH}`);
  }
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const sig = createSign("RSA-SHA256").update(`${head}.${claim}`).sign(key.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${claim}.${sig}`,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("토큰 발급 실패: " + JSON.stringify(data));
  return { token: data.access_token, email: key.client_email };
}

async function api(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body && { "Content-Type": "application/json" }) },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

// 서치콘솔 속성 찾기: 도메인 속성(sc-domain:) 우선, 없으면 URL 접두어 속성
async function findSite(token) {
  const { siteEntry = [] } = await api(token, "GET", "https://www.googleapis.com/webmasters/v3/sites");
  const host = new URL(ORIGIN).hostname; // punycode
  const match = siteEntry.find((s) => s.siteUrl === `sc-domain:${host}`)
    || siteEntry.find((s) => new URL(s.siteUrl.replace(/^sc-domain:/, "https://")).hostname === host);
  if (!match) throw new Error(`서치콘솔 속성을 찾을 수 없습니다. 서비스 계정을 ${host} 속성에 '소유자'로 추가했는지 확인하세요.\n접근 가능 속성: ${siteEntry.map((s) => s.siteUrl).join(", ") || "(없음)"}`);
  return match.siteUrl;
}

const [cmd, arg] = process.argv.slice(2);
const { token, email } = await getToken();

if (cmd === "sites") {
  const { siteEntry = [] } = await api(token, "GET", "https://www.googleapis.com/webmasters/v3/sites");
  console.log(`서비스 계정: ${email}`);
  for (const s of siteEntry) console.log(`${s.siteUrl}  (${s.permissionLevel})`);
  if (!siteEntry.length) console.log("접근 가능한 속성이 없습니다.");
} else if (cmd === "sitemap") {
  const site = await findSite(token);
  const base = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(new URL(SITEMAP).href)}`;
  await api(token, "PUT", base);
  const info = await api(token, "GET", base);
  console.log(`사이트맵 제출 완료: ${SITEMAP}`);
  console.log(`속성: ${site} / 마지막 제출: ${info.lastSubmitted} / 마지막 다운로드: ${info.lastDownloaded || "-"} / 오류 ${info.errors ?? 0} / 경고 ${info.warnings ?? 0}`);
} else if (cmd === "inspect" && arg) {
  const site = await findSite(token);
  const url = new URL(arg.replace(/^\//, ""), ORIGIN).href;
  const { inspectionResult: r } = await api(token, "POST", "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    inspectionUrl: url,
    siteUrl: site,
    languageCode: "ko",
  });
  const i = r.indexStatusResult;
  console.log(`URL: ${url}`);
  console.log(`판정: ${i.verdict} / 상태: ${i.coverageState}`);
  console.log(`마지막 크롤링: ${i.lastCrawlTime || "-"} / 구글 선택 canonical: ${i.googleCanonical || "-"}`);
} else {
  console.log("사용법: node tools/google-search-console.mjs sites | sitemap | inspect <경로>");
  process.exit(1);
}
