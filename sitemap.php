<?php
header("Content-Type: application/xml; charset=utf-8");
$today = date("Y-m-d");
echo <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://원격임대.com/</loc>
    <lastmod>{$today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://원격임대.com/#notice</loc>
    <lastmod>{$today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://원격임대.com/#options</loc>
    <lastmod>{$today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://원격임대.com/#contact</loc>
    <lastmod>{$today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://원격임대.com/game/game/lineagem.html</loc>
    <lastmod>{$today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://원격임대.com/game/game/LC.html</loc>
    <lastmod>{$today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

</urlset>
XML;
?>
