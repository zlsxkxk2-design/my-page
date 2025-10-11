// script.js
document.addEventListener("DOMContentLoaded", () => {
  /* ========== 재고 표시 유틸 ========== */
  const updateStockDisplay = (stockId, count) => {
    const box = document.getElementById(stockId);
    if (!box) return;
    const countElement  = box.querySelector(".count");
    const statusElement = box.querySelector(".stock-status");

    const n = Number(count) || 0;
    if (n > 0) {
      countElement.textContent  = `${n}대`;
      countElement.style.color  = "#4CAF50";
      statusElement.textContent = "임대 가능";
      statusElement.style.color = "#4CAF50";
    } else {
      countElement.textContent  = "0대";
      countElement.style.color  = "#ff6b6b";
      statusElement.textContent = "임대 불가";
      statusElement.style.color = "#ff6b6b";
    }
  };

  const showError = (message) => {
    document.querySelectorAll(".stock-box .count").forEach(el => {
      el.textContent = "연결 실패";
      el.style.color = "#ff6b6b";
    });
    document.querySelectorAll(".stock-box .stock-status").forEach(el => {
      el.textContent = "잠시 후 다시 시도해주세요";
      el.style.color = "#ff6b6b";
    });
    console.error("재고 정보 불러오기 실패:", message);
  };

  /* ========== 구글시트 fetch (gviz → 실패 시 opensheet 백업) ========== */
  const SHEET_ID   = "1vwCFM0exXmgkN5vz06IA9j4LJxa95oeqtd-ew5cJFVc";
  const SHEET_NAME = "Sheet1";

  const fetchWithTimeout = (url, ms = 8000) => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort("timeout"), ms);
    return fetch(url, { signal: ctrl.signal })
      .finally(() => clearTimeout(tid));
  };

  const parseGviz = (text) => {
    const start = text.indexOf("{");
    const end   = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("GViz 응답 파싱 실패");
    const json = JSON.parse(text.substring(start, end + 1));
    if (!json.table || !json.table.rows) throw new Error("GViz 데이터 구조 오류");

    // 세로로 A열에 1~3행이 각각 수량이라고 가정
    const r = json.table.rows;
    const v = (i) => (r[i] && r[i].c && r[i].c[0] && (r[i].c[0].v ?? r[i].c[0].f)) ?? 0;
    return [v(0), v(1), v(2)].map(Number);
  };

  const parseOpensheet = (arr) => {
    // opensheet는 [{A:"10"},{A:"12"},{A:"7"}] 형태(헤더가 A/B/C) 또는
    // 사용자가 붙인 헤더명으로 올 수 있음. 우선 A, 첫키, 숫자만 뽑기.
    const getVal = (row) => {
      if (row.A != null) return row.A;
      const keys = Object.keys(row);
      return keys.length ? row[keys[0]] : 0;
    };
    const a = Number(getVal(arr[0]) || 0);
    const b = Number(getVal(arr[1]) || 0);
    const c = Number(getVal(arr[2]) || 0);
    return [a, b, c];
  };

  const loadStocks = async () => {
    try {
      // 1차: gviz
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=select%20A&sheet=${encodeURIComponent(SHEET_NAME)}`;
      const res = await fetchWithTimeout(gvizUrl, 8000);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();
      const [s1, s2, s3] = parseGviz(text);

      updateStockDisplay("stock1", s1);
      updateStockDisplay("stock2", s2);
      updateStockDisplay("stock3", s3);
      console.log("재고(gviz) 업데이트:", { s1, s2, s3 });
    } catch (e1) {
      console.warn("GViz 실패, opensheet로 재시도:", e1?.message || e1);
      try {
        // 2차: opensheet 백업
        const osUrl = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(SHEET_NAME)}`;
        const res2 = await fetchWithTimeout(osUrl, 8000);
        if (!res2.ok) throw new Error(`HTTP ${res2.status} ${res2.statusText}`);
        const data = await res2.json();
        const [s1, s2, s3] = parseOpensheet(data);

        updateStockDisplay("stock1", s1);
        updateStockDisplay("stock2", s2);
        updateStockDisplay("stock3", s3);
        console.log("재고(opensheet) 업데이트:", { s1, s2, s3 });
      } catch (e2) {
        showError(e2?.message || e2);
      }
    }
  };

  loadStocks();

  /* ========== 갤러리 확대 오버레이 ========== */
  const galleryImgs = document.querySelectorAll(".gallery img");
  const overlay     = document.getElementById("overlay");
  const overlayImg  = document.getElementById("overlay-img");

  let currentImageIndex = 0;
  let imageList = [];

  const openOverlay = (img, index) => {
    overlayImg.src = img.src;
    overlayImg.alt = img.alt || "";
    currentImageIndex = index;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  const closeOverlay = () => {
    overlay.style.display = "none";
    overlayImg.src = "";
    overlayImg.alt = "";
    document.body.style.overflow = "auto";
  };

  const showNextImage = () => {
    if (!imageList.length) return;
    currentImageIndex = (currentImageIndex + 1) % imageList.length;
    const nextImg = imageList[currentImageIndex];
    overlayImg.src = nextImg.src;
    overlayImg.alt = nextImg.alt || "";
  };

  const showPrevImage = () => {
    if (!imageList.length) return;
    currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
    const prevImg = imageList[currentImageIndex];
    overlayImg.src = prevImg.src;
    overlayImg.alt = prevImg.alt || "";
  };

  // 이미지 클릭/키 접근성
  galleryImgs.forEach((img, index) => {
    img.addEventListener("click", () => {
      imageList = Array.from(galleryImgs);
      openOverlay(img, index);
    });
    img.setAttribute("tabindex", "0");
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        imageList = Array.from(galleryImgs);
        openOverlay(img, index);
      }
    });
  });

  // 오버레이 클릭으로 닫기
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target === overlayImg) closeOverlay();
  });

  // 키보드 제어 (← → ESC)
  document.addEventListener("keydown", (e) => {
    if (overlay.style.display === "flex") {
      if (e.key === "Escape") closeOverlay();
      else if (e.key === "ArrowRight") { e.preventDefault(); showNextImage(); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); showPrevImage(); }
    }
  }); // ✅ ←←← 빠져있던 닫는 괄호/세미콜론

  /* ========== FAQ 토글 ========== */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const q = item.querySelector(".faq-question");
    if (!q) return;
    q.addEventListener("click", () => {
      // 하나만 열리도록
      faqItems.forEach(other => { if (other !== item) other.classList.remove("active"); });
      item.classList.toggle("active");
    });
  });
});
