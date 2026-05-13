document.addEventListener("DOMContentLoaded", () => {

  // ===== 네비게이션: 스크롤 시 배경 추가 =====
  const navbar = document.querySelector(".navbar");
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ===== 게임 드랍다운 =====
  const dropdownBtn = document.querySelector(".nav-dropdown-btn");
  const dropdownMenu = document.querySelector(".nav-dropdown-menu");
  dropdownBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.toggle("open");
    dropdownBtn.setAttribute("aria-expanded", isOpen);
  });
  document.addEventListener("click", () => dropdownMenu?.classList.remove("open"));

  // ===== 모바일 메뉴 토글 =====
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  navToggle?.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen);
    mobileMenu.setAttribute("aria-hidden", !isOpen);
  });

  mobileMenu?.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });

  // ===== 파티클 배경 =====
  const canvas = document.getElementById("heroParticles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 5;
        this.size = Math.random() * 1.2 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = -(Math.random() * 0.35 + 0.1);
        this.opacity = Math.random() * 0.45 + 0.1;
        this.life = 1;
        this.decay = Math.random() * 0.0025 + 0.001;
        this.cyan = Math.random() > 0.55;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        if (this.life <= 0 || this.y < -10) this.reset();
      }
      draw() {
        ctx.globalAlpha = this.life * this.opacity;
        ctx.fillStyle = this.cyan ? "#00e5ff" : "#7c3aed";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    resize();
    particles = Array.from({ length: 70 }, () => new Particle());

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 연결선
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 90) {
            ctx.globalAlpha = (1 - d/90) * 0.05;
            ctx.strokeStyle = "#00e5ff";
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => { p.update(); p.draw(); });
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
  }

  // ===== 스크롤 fade-in =====
  const fadeEls = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = entry.target.parentElement.querySelectorAll(".fade-in");
          let delay = 0;
          siblings.forEach((sib, idx) => {
            if (sib === entry.target) delay = idx * 100;
          });
          setTimeout(() => entry.target.classList.add("visible"), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.07, rootMargin: "0px 0px -24px 0px" }
  );
  fadeEls.forEach(el => observer.observe(el));

  // ===== 구글 시트 재고 =====
  function animateCount(el, to) {
    const from = parseInt(el.textContent) || 0;
    const duration = 900;
    const start = performance.now();
    const update = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(from + (to - from) * eased)}대`;
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  function fetchStock() {
    fetch("https://docs.google.com/spreadsheets/d/1vwCFM0exXmgkN5vz06IA9j4LJxa95oeqtd-ew5cJFVc/gviz/tq?tqx=out:json&tq=select%20A&sheet=Sheet1")
      .then(r => r.text())
      .then(text => {
        const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
        [0,1,2,3].forEach(i => {
          const el = document.querySelector(`#stock${i+1} .count`);
          if (el) animateCount(el, json.table.rows[i]?.c[0]?.v ?? 0);
        });
      })
      .catch(() => {
        document.querySelectorAll(".stock-box .count").forEach(el => { el.textContent = "0대"; });
      });
  }
  fetchStock();
  setInterval(fetchStock, 30000);

  // ===== 갤러리 오버레이 =====
  const overlay = document.getElementById("overlay");
  const overlayImg = document.getElementById("overlay-img");
  const overlayClose = document.querySelector(".overlay-close");

  const openOverlay = (src, alt) => {
    overlayImg.src = src;
    overlayImg.alt = alt;
    overlay.classList.add("show");
    overlay.focus();
    document.body.style.overflow = "hidden";
  };
  const closeOverlay = () => {
    overlay.classList.remove("show");
    overlayImg.src = "";
    document.body.style.overflow = "";
  };

  // gallery-item 클릭
  document.querySelectorAll(".gallery-item").forEach(item => {
    const img = item.querySelector("img");
    const activate = () => openOverlay(img.src, img.alt);
    item.addEventListener("click", activate);
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });
  });

  overlay.addEventListener("click", e => { if (e.target === overlay) closeOverlay(); });
  overlayClose?.addEventListener("click", closeOverlay);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && overlay.classList.contains("show")) closeOverlay();
  });

  // ===== FAQ 아코디언 =====
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isActive = item.classList.contains("active");

      document.querySelectorAll(".faq-item.active").forEach(a => {
        if (a !== item) {
          a.classList.remove("active");
          a.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("active", !isActive);
      btn.setAttribute("aria-expanded", !isActive);
    });
  });

  // ===== 부드러운 앵커 스크롤 =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
    });
  });

  // ===== 마우스 패럴랙스 (모니터) =====
  const monWrap = document.querySelector(".monitor-wrap");
  if (monWrap) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 5;
      monWrap.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

});
