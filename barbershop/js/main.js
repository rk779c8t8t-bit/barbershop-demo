(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var whatsapp = String(cfg.whatsapp || "").replace(/\D/g, "");
  var telegram = String(cfg.telegram || "").trim().replace(/^@/, "");

  /* ---------- Мобильное меню ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
      setFab(false);
    }
  });
  window.matchMedia("(min-width: 860px)").addEventListener("change", function (m) {
    if (m.matches) setMenu(false);
  });

  /* ---------- Тень у шапки при прокрутке ---------- */
  var header = document.querySelector(".header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Подсказка и всплывающее сообщение ---------- */
  var notice = document.getElementById("notice");
  var noticeText = document.getElementById("notice-text");
  var toast = document.getElementById("toast");
  var toastTimer;

  function showNotice(name) {
    noticeText.textContent = "Это демонстрационная версия сайта: ссылка на " + name +
      " ещё не указана. Владелец сайта добавляет её в файле js/config.js.";
    if (typeof notice.showModal === "function") notice.showModal();
    else window.alert(noticeText.textContent);
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 5000);
  }

  /* ---------- Открытие мессенджеров ---------- */
  function openWhatsApp(text) {
    if (!whatsapp) { showNotice("WhatsApp"); return; }
    var url = "https://wa.me/" + whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
    window.open(url, "_blank", "noopener");
  }

  function openTelegram(text) {
    if (!telegram) { showNotice("Telegram"); return; }
    // Telegram не умеет подставлять текст в личный чат, поэтому копируем его.
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("Текст заявки скопирован — вставьте его в чат Telegram.");
      }).catch(function () {});
    }
    window.open("https://t.me/" + encodeURIComponent(telegram), "_blank", "noopener");
  }

  function contact(kind, text) {
    if (kind === "whatsapp") openWhatsApp(text);
    else openTelegram(text);
  }

  document.querySelectorAll("[data-contact]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFab(false);
      contact(btn.getAttribute("data-contact"), "Здравствуйте! Хочу записаться в барбершоп.");
    });
  });

  /* ---------- Плавающая кнопка ---------- */
  var fabToggle = document.querySelector(".fab__toggle");
  var fabMenu = document.getElementById("fab-menu");

  function setFab(open) {
    fabToggle.setAttribute("aria-expanded", String(open));
    fabMenu.hidden = !open;
  }
  fabToggle.addEventListener("click", function () {
    setFab(fabToggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#fab")) setFab(false);
  });

  /* ---------- Форма записи ---------- */
  var form = document.getElementById("booking-form");
  var select = document.getElementById("b-service");
  var nameInput = document.getElementById("b-name");
  var nameError = document.getElementById("b-name-error");

  // Список услуг берётся из прайса, чтобы не дублировать его вручную.
  document.querySelectorAll(".price-item").forEach(function (item) {
    var opt = document.createElement("option");
    var price = item.querySelector(".price-item__price");
    opt.value = item.getAttribute("data-service");
    opt.textContent = opt.value + (price ? " — " + price.textContent : "");
    select.appendChild(opt);
  });

  // Кнопка у каждой услуги — сразу выбрать её в форме записи.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".price-item").forEach(function (item) {
    var service = item.getAttribute("data-service");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "price-item__btn";
    btn.setAttribute("aria-label", "Записаться: " + service);
    item.appendChild(btn);
    btn.addEventListener("click", function () {
      select.value = service;
      document.getElementById("booking").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(function () { nameInput.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
    });
  });

  nameInput.addEventListener("input", function () {
    if (nameInput.value.trim()) {
      nameError.hidden = true;
      nameInput.removeAttribute("aria-invalid");
      nameInput.removeAttribute("aria-describedby");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var kind = (e.submitter && e.submitter.getAttribute("data-messenger")) || "whatsapp";
    var name = nameInput.value.trim();
    if (!name) {
      nameError.hidden = false;
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.setAttribute("aria-describedby", "b-name-error");
      nameInput.focus();
      return;
    }
    var lines = ["Здравствуйте! Хочу записаться.", "Имя: " + name];
    lines.push("Услуга: " + (select.value || "нужна консультация"));
    var time = document.getElementById("b-time").value.trim();
    if (time) lines.push("Удобное время: " + time);
    contact(kind, lines.join("\n"));
  });

  /* ---------- Контакты из настроек ---------- */
  function fill(id, value, emptyText, href) {
    var el = document.getElementById(id);
    if (!value) {
      el.textContent = emptyText;
      el.classList.add("is-empty");
      return;
    }
    if (href) {
      var a = document.createElement("a");
      a.href = href;
      a.textContent = value;
      if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
      el.appendChild(a);
    } else {
      el.textContent = value;
    }
  }

  var phoneDigits = String(cfg.phone || "").replace(/[^\d+]/g, "");
  fill("c-address", cfg.address, "Адрес не указан (демо-версия)", cfg.address && cfg.mapUrl ? cfg.mapUrl : "");
  fill("c-hours", cfg.hours, "Уточняйте в мессенджере");
  fill("c-phone", cfg.phone, "Не указан (демо-версия)", phoneDigits ? "tel:" + phoneDigits : "");
})();
