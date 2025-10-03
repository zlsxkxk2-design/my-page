// 구글 시트 재고 불러오기
fetch("https://docs.google.com/spreadsheets/d/1vwCFM0exXmgkN5vz06IA9j4LJxa95oeqtd-ew5cJFVc/gviz/tq?tqx=out:json&tq=select%20A&sheet=Sheet1")
  .then(res => res.text())
  .then(text => {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const jsonText = text.substring(start, end + 1);
    const json = JSON.parse(jsonText);

    const stock1 = json.table.rows[0]?.c[0]?.v || 0;
    const stock2 = json.table.rows[1]?.c[0]?.v || 0;
    const stock3 = json.table.rows[2]?.c[0]?.v || 0;

    document.querySelector("#stock1 .count").innerText = `${stock1}대`;
    document.querySelector("#stock2 .count").innerText = `${stock2}대`;
    document.querySelector("#stock3 .count").innerText = `${stock3}대`;
  })
  .catch(err => {
    console.error("불러오기 실패", err);
    document.querySelectorAll(".stock-box .count").forEach(el => el.innerText = "0대");
  });

// 갤러리 확대 오버레이
const galleryImgs = document.querySelectorAll(".gallery img");
const overlay = document.getElementById("overlay");
const overlayImg = document.getElementById("overlay-img");

galleryImgs.forEach(img => {
  img.addEventListener("click", () => {
    overlayImg.src = img.src;
    overlay.style.display = "flex";
  });
});

overlay.addEventListener("click", () => {
  overlay.style.display = "none";
});
