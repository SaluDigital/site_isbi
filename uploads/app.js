/* ============================================================
   ISBI Odonto — Landing Page interactions
   ============================================================ */
(function () {
  "use strict";

  /* --- GTM dataLayer helper --- */
  window.dataLayer = window.dataLayer || [];
  function track(event, extra) {
    window.dataLayer.push(Object.assign({ event: event }, extra || {}));
  }
  // expose for inline onclick attributes
  window.isbiTrack = track;

  function init() {
    /* ---------- Header scroll state ---------- */
    var header = document.querySelector(".header");
    var onScroll = function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile drawer ---------- */
    var drawer = document.getElementById("drawer");
    var openBtn = document.getElementById("burger");
    var closeBtn = document.getElementById("drawerClose");
    function setDrawer(open) {
      if (!drawer) return;
      drawer.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (openBtn) openBtn.addEventListener("click", function () { setDrawer(true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setDrawer(false); });
    if (drawer) drawer.addEventListener("click", function (e) {
      if (e.target === drawer) setDrawer(false);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".drawer a"), function (a) {
      a.addEventListener("click", function () { setDrawer(false); });
    });

    /* ---------- FAQ accordion ---------- */
    Array.prototype.forEach.call(document.querySelectorAll(".faq-item"), function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        if (open) {
          item.classList.remove("is-open");
          a.style.maxHeight = "0px";
        } else {
          item.classList.add("is-open");
          a.style.maxHeight = a.scrollHeight + "px";
          track("faq_open", { faq_question: q.textContent.trim() });
        }
      });
    });

    /* ---------- Scroll reveal (scroll-position based, robust) ---------- */
    var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    function checkReveal() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = reveals.length - 1; i >= 0; i--) {
        var el = reveals[i];
        var top = el.getBoundingClientRect().top;
        if (top < vh * 0.92) {
          el.classList.add("is-in");
          reveals.splice(i, 1);
        }
      }
    }
    checkReveal();
    window.addEventListener("scroll", checkReveal, { passive: true });
    window.addEventListener("resize", checkReveal);
    // safety net: ensure nothing stays hidden
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function (el) {
        el.classList.add("is-in");
      });
    }, 2500);

    /* ---------- Reviews carousel ---------- */
    Array.prototype.forEach.call(document.querySelectorAll(".review-carousel"), function (carousel) {
      var viewport = carousel.querySelector(".review-viewport");
      var trackEl = carousel.querySelector(".review-track");
      var cards = Array.prototype.slice.call(carousel.querySelectorAll(".review-card"));
      var dotsWrap = carousel.querySelector(".review-dots");
      if (!viewport || !trackEl || !cards.length || !dotsWrap) return;

      var page = 0;
      var pageCount = 1;
      var autoplayId = null;
      var pauseAutoplay = false;

      function getCols() {
        if (window.matchMedia("(max-width:640px)").matches) return 1;
        if (window.matchMedia("(max-width:1000px)").matches) return 2;
        return 3;
      }

      function buildDots() {
        dotsWrap.innerHTML = "";
        for (var i = 0; i < pageCount; i++) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", "Ir para depoimentos " + (i + 1));
          dot.addEventListener("click", (function (nextPage) {
            return function () {
              page = nextPage;
              update();
              restartAutoplay();
            };
          })(i));
          dotsWrap.appendChild(dot);
        }
      }

      function update() {
        var cols = getCols();
        pageCount = Math.max(1, Math.ceil(cards.length / cols));
        if (page >= pageCount) page = 0;

        var cardWidth = cards[0].getBoundingClientRect().width;
        var gap = parseFloat(window.getComputedStyle(trackEl).gap || "0");
        var offset = page * cols * (cardWidth + gap);
        trackEl.style.transform = "translateX(-" + offset + "px)";

        var dots = dotsWrap.querySelectorAll("button");
        if (dots.length !== pageCount) {
          buildDots();
          dots = dotsWrap.querySelectorAll("button");
        }
        Array.prototype.forEach.call(dots, function (dot, index) {
          dot.classList.toggle("is-active", index === page);
        });
      }

      function stopAutoplay() {
        if (autoplayId) window.clearInterval(autoplayId);
        autoplayId = null;
      }

      function startAutoplay() {
        stopAutoplay();
        autoplayId = window.setInterval(function () {
          if (pauseAutoplay || pageCount <= 1) return;
          page = (page + 1) % pageCount;
          update();
        }, 4500);
      }

      function restartAutoplay() {
        startAutoplay();
      }

      carousel.addEventListener("mouseenter", function () { pauseAutoplay = true; });
      carousel.addEventListener("mouseleave", function () { pauseAutoplay = false; });
      carousel.addEventListener("focusin", function () { pauseAutoplay = true; });
      carousel.addEventListener("focusout", function () { pauseAutoplay = false; });

      buildDots();
      update();
      startAutoplay();
      window.addEventListener("resize", update);
    });

    /* ---------- About carousel ---------- */
    console.log("[ISBI] about-carousel init v2");
    Array.prototype.forEach.call(document.querySelectorAll(".about-carousel"), function (carousel) {
      var trackEl = carousel.querySelector(".about-track");
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".about-photo"));
      var dotsWrap = carousel.querySelector(".about-carousel__dots");
      var prevBtn = carousel.querySelector(".about-carousel__nav--prev");
      var nextBtn = carousel.querySelector(".about-carousel__nav--next");
      console.log("[ISBI] track:", !!trackEl, "slides:", slides.length, "dots:", !!dotsWrap, "prev:", !!prevBtn, "next:", !!nextBtn);
      if (!trackEl || slides.length < 2 || !dotsWrap || !prevBtn || !nextBtn) return;

      var index = 0;
      var total = slides.length;
      var autoplayId = null;
      var pauseAutoplay = false;

      function buildDots() {
        dotsWrap.innerHTML = "";
        for (var i = 0; i < total; i++) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", "Ir para foto " + (i + 1));
          dot.addEventListener("click", (function (si) {
            return function () { index = si; update(); restartAutoplay(); };
          })(i));
          dotsWrap.appendChild(dot);
        }
      }

      function update() {
        trackEl.style.transform = "translateX(-" + (index * 100) + "%)";
        var dots = dotsWrap.querySelectorAll("button");
        for (var i = 0; i < dots.length; i++) {
          dots[i].classList.toggle("is-active", i === index);
        }
      }

      function goTo(n) {
        index = (n % total + total) % total;
        update();
      }

      prevBtn.addEventListener("click", function () { goTo(index - 1); restartAutoplay(); });
      nextBtn.addEventListener("click", function () { goTo(index + 1); restartAutoplay(); });

      carousel.addEventListener("mouseenter", function () { pauseAutoplay = true; });
      carousel.addEventListener("mouseleave", function () { pauseAutoplay = false; });

      function restartAutoplay() {
        if (autoplayId) clearInterval(autoplayId);
        autoplayId = setInterval(function () {
          if (!pauseAutoplay) goTo(index + 1);
        }, 4200);
      }

      buildDots();
      update();
      restartAutoplay();
    });

    /* ---------- Sticky mobile CTA ---------- */
    if (window.matchMedia("(max-width:640px)").matches) {
      document.body.classList.add("has-sticky");
    }

    /* ---------- UTM / click-id capture ---------- */
    var params = new URLSearchParams(window.location.search);
    var fields = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
    function store(k, v) { try { if (v) sessionStorage.setItem(k, v); } catch (e) {} }
    function recall(k) { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }
    fields.forEach(function (f) {
      var v = params.get(f);
      if (v) store(f, v);
      var inp = document.querySelector('[name="' + f + '"]');
      if (inp) inp.value = v || recall(f);
    });
    var lp = document.querySelector('[name="landing_page"]');
    if (lp) lp.value = window.location.href.split("?")[0];

    /* ---------- Optional short form -> WhatsApp ---------- */
    var form = document.getElementById("leadForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var nome = (form.querySelector('[name="nome"]') || {}).value || "";
        var tel = (form.querySelector('[name="whatsapp"]') || {}).value || "";
        var trat = (form.querySelector('[name="tratamento"]') || {}).value || "Implante dentário";
        track("cta_whatsapp_form", { tratamento_interesse: trat });
        var msg = "Olá, vim pelo Google e gostaria de mais informações sobre implante dentário."
          + (nome ? " Meu nome é " + nome + "." : "")
          + (tel ? " Telefone: " + tel + "." : "")
          + " Interesse: " + trat + ".";
        var url = "https://wa.me/554132281313?text=" + encodeURIComponent(msg);
        window.open(url, "_blank", "noopener");
      });
    }

    /* ---------- Footer year ---------- */
    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
