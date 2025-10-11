document.addEventListener("DOMContentLoaded", () => {
  // ===== 구글 시트 재고 불러오기 =====
  const updateStockDisplay = (stockId, count) => {
    const countElement = document.querySelector(`#${stockId} .count`);
    const statusElement = document.querySelector(`#${stockId} .stock-status`);
    
    if (count > 0) {
      countElement.innerText = `${count}대`;
      countElement.style.color = "#4CAF50";
      statusElement.innerText = "임대 가능";
      statusElement.style.color = "#4CAF50";
    } else {
      countElement.innerText = "0대";
      countElement.style.color = "#ff6b6b";
      statusElement.innerText = "임대 불가";
      statusElement.style.color = "#ff6b6b";
    }
  };

  const showError = (message) => {
    document.querySelectorAll(".stock-box .count").forEach(el => {
      el.innerText = "연결 실패";
      el.style.color = "#ff6b6b";
    });
    document.querySelectorAll(".stock-box .stock-status").forEach(el => {
      el.innerText = "잠시 후 다시 시도해주세요";
      el.style.color = "#ff6b6b";
    });
    console.error("재고 정보 불러오기 실패:", message);
  };

  fetch("https://docs.google.com/spreadsheets/d/1vwCFM0exXmgkN5vz06IA9j4LJxa95oeqtd-ew5cJFVc/gviz/tq?tqx=out:json&tq=select%20A&sheet=Sheet1")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.text();
    })
    .then(text => {
      try {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        
        if (start === -1 || end === -1) {
          throw new Error("유효하지 않은 응답 형식");
        }
        
        const jsonText = text.substring(start, end + 1);
        const json = JSON.parse(jsonText);

        if (!json.table || !json.table.rows) {
          throw new Error("데이터 구조가 올바르지 않음");
        }

        const stock1 = json.table.rows[0]?.c[0]?.v ?? 0;
        const stock2 = json.table.rows[1]?.c[0]?.v ?? 0;
        const stock3 = json.table.rows[2]?.c[0]?.v ?? 0;

        updateStockDisplay("stock1", stock1);
        updateStockDisplay("stock2", stock2);
        updateStockDisplay("stock3", stock3);
        
        console.log("재고 정보 업데이트 완료:", { stock1, stock2, stock3 });
      } catch (parseError) {
        throw new Error(`데이터 파싱 실패: ${parseError.message}`);
      }
    })
    .catch(err => {
      showError(err.message);
    });

  // ===== 갤러리 확대 오버레이 =====
  const galleryImgs = document.querySelectorAll(".gallery img");
  const overlay = document.getElementById("overlay");
  const overlayImg = document.getElementById("overlay-img");
  
  let currentImageIndex = 0;
  let imageList = [];

  const openOverlay = (img, index) => {
    overlayImg.src = img.src;
    overlayImg.alt = img.alt;
    currentImageIndex = index;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden"; // 스크롤 방지
  };

  const closeOverlay = () => {
    overlay.style.display = "none";
    overlayImg.src = "";
    overlayImg.alt = "";
    document.body.style.overflow = "auto"; // 스크롤 복원
  };

  const showNextImage = () => {
    if (imageList.length > 0) {
      currentImageIndex = (currentImageIndex + 1) % imageList.length;
      const nextImg = imageList[currentImageIndex];
      overlayImg.src = nextImg.src;
      overlayImg.alt = nextImg.alt;
    }
  };

  const showPrevImage = () => {
    if (imageList.length > 0) {
      currentImageIndex = (currentImageIndex - 1 + imageList.length) % imageList.length;
      const prevImg = imageList[currentImageIndex];
      overlayImg.src = prevImg.src;
      overlayImg.alt = prevImg.alt;
    }
  };

  // 갤러리 이미지 클릭 이벤트
  galleryImgs.forEach((img, index) => {
    img.addEventListener("click", () => {
      imageList = Array.from(galleryImgs);
      openOverlay(img, index);
    });
    
    // 키보드 접근성
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
    if (e.target === overlay || e.target === overlayImg) {
      closeOverlay();
    }
  });

  // 키보드 이벤트
  document.addEventListener("keydown", (e) => {
    if (overlay.style.display === "flex") {
      switch(e.key) {
        case "Escape":
          closeOverlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          showNextImage();
          break;
        case "ArrowLeft":
          e.preventDefault();
          showPrevImage();
          break;
      }
    }
  });
});
