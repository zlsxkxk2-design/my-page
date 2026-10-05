# 네이버 IndexNow 색인 요청
# 사용법:
#   powershell -File tools/indexnow.ps1 game/game/dk.html game/game/dokkaebi.html   (특정 페이지)
#   powershell -File tools/indexnow.ps1 -All                                       (sitemap.xml 전체)
param(
  [switch]$All,
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$Paths
)

$Key  = 'acf4f169846da306f06e75b21cbabdd6'
$Host_ = 'xn--i89a73jyusvua.com'   # 원격임대.com (punycode)
$Root = Split-Path $PSScriptRoot -Parent

if ($All) {
  $urls = Select-String -Path (Join-Path $Root 'sitemap.xml') -Pattern '<loc>(.+?)</loc>' |
    ForEach-Object { $_.Matches[0].Groups[1].Value -replace '#.*$', '' } |
    Sort-Object -Unique
} else {
  $urls = $Paths | ForEach-Object { 'https://원격임대.com/' + $_.TrimStart('/') }
}
$urls = $urls | ForEach-Object { $_ -replace '원격임대\.com', $Host_ }
if (-not $urls) { Write-Error '전송할 URL이 없습니다.'; exit 1 }

$body = @{
  host        = $Host_
  key         = $Key
  keyLocation = "https://$Host_/$Key.txt"
  urlList     = @($urls)
} | ConvertTo-Json

try {
  $r = Invoke-WebRequest 'https://searchadvisor.naver.com/indexnow' -Method Post -UseBasicParsing `
    -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
  "네이버 IndexNow 응답: $($r.StatusCode) ($($urls.Count)개 URL)"
} catch {
  "네이버 IndexNow 실패: $($_.Exception.Message)"
  exit 1
}
$urls
