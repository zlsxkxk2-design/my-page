<?php
header("Content-Type: application/xml; charset=utf-8");
$today = date("Y-m-d");

$base = "https://원격임대.com";
$game_dir = __DIR__ . "/game/game";
$game_files = glob($game_dir . "/*.html");

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

$static = [
  ["loc" => "$base/",          "changefreq" => "daily",   "priority" => "1.0"],
  ["loc" => "$base/#notice",   "changefreq" => "weekly",  "priority" => "0.8"],
  ["loc" => "$base/#options",  "changefreq" => "weekly",  "priority" => "0.8"],
  ["loc" => "$base/#contact",  "changefreq" => "monthly", "priority" => "0.6"],
];

foreach ($static as $url) {
  echo "  <url>\n";
  echo "    <loc>{$url['loc']}</loc>\n";
  echo "    <lastmod>{$today}</lastmod>\n";
  echo "    <changefreq>{$url['changefreq']}</changefreq>\n";
  echo "    <priority>{$url['priority']}</priority>\n";
  echo "  </url>\n";
}

foreach ($game_files as $file) {
  $filename = basename($file);
  echo "  <url>\n";
  echo "    <loc>{$base}/game/game/{$filename}</loc>\n";
  echo "    <lastmod>" . date("Y-m-d", filemtime($file)) . "</lastmod>\n";
  echo "    <changefreq>monthly</changefreq>\n";
  echo "    <priority>0.8</priority>\n";
  echo "  </url>\n";
}

echo '</urlset>';
?>
