/* ElFoxo — демоверсия: каталог, фильтры, быстрый просмотр, корзина. Без сторонних библиотек. */
(function () {
  "use strict";

  var DATA = window.ELFOXO_CATALOG;
  var CFG = window.ELFOXO_CONFIG || {};
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };

  var byId = {};
  DATA.products.forEach(function (p) { byId[p.id] = p; });
  var catName = {};
  DATA.categories.forEach(function (c) { catName[c.id] = c.name; });

  /* ---------- утилиты ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function money(n) { return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽"; }
  function minPrice(p) { return Math.min.apply(null, p.variants.map(function (v) { return v.price; })); }
  function priceLabel(p) { return (p.variants.length > 1 ? "от " : "") + money(minPrice(p)); }
  function img(id, color, w) { return "images/products/" + id + "-" + color + "-" + w + ".webp"; }
  function srcset(id, color) { return img(id, color, 480) + " 480w, " + img(id, color, 960) + " 960w"; }
  function colorName(k) { return DATA.colors[k].name; }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* приватный режим */ } }
  };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function scrollToEl(el) { el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }

  /* ---------- тексты из настроек ---------- */
  $$("[data-config]").forEach(function (el) {
    var v = String(CFG[el.getAttribute("data-config")] || "").trim();
    el.textContent = v || "Условия будут указаны владельцем магазина.";
    el.classList.toggle("is-placeholder", !v);
  });
  (function contacts() {
    var list = $("[data-contacts]"), rows = [];
    var phone = String(CFG.phone || "").trim(), email = String(CFG.email || "").trim();
    var tg = String(CFG.telegram || "").trim().replace(/^@/, ""), wa = String(CFG.whatsapp || "").replace(/\D/g, "");
    if (phone) rows.push('<li><a href="tel:' + esc(phone.replace(/[^\d+]/g, "")) + '">' + esc(phone) + "</a></li>");
    if (email) rows.push('<li><a href="mailto:' + esc(email) + '">' + esc(email) + "</a></li>");
    if (tg) rows.push('<li><a href="https://t.me/' + esc(tg) + '" target="_blank" rel="noopener">Telegram</a></li>');
    if (wa) rows.push('<li><a href="https://wa.me/' + esc(wa) + '" target="_blank" rel="noopener">WhatsApp</a></li>');
    if (CFG.address) rows.push("<li>" + esc(CFG.address) + "</li>");
    if (CFG.hours) rows.push("<li>" + esc(CFG.hours) + "</li>");
    list.innerHTML = rows.length ? rows.join("") :
      '<li class="is-placeholder">Контакты будут добавлены владельцем магазина.</li>';
  })();
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- состояние каталога ---------- */
  var state = { cat: "all", collection: null, q: "", sort: "popular" };
  var cardColor = {};

  function countIn(cat) { return DATA.products.filter(function (p) { return p.category === cat; }).length; }

  /* Категории (крупные карточки) */
  $("[data-categories]").innerHTML = DATA.categories.map(function (c) {
    var n = countIn(c.id);
    return '<li><button class="category" type="button" data-cat="' + c.id + '" data-reveal>' +
      '<span class="category__media"><img src="images/scenes/' + c.image + '-480.webp" srcset="images/scenes/' + c.image +
      '-480.webp 480w, images/scenes/' + c.image + '-960.webp 960w" sizes="(min-width: 1024px) 20vw, (min-width: 600px) 38vw, 62vw"' +
      ' width="480" height="600" loading="lazy" decoding="async" alt=""></span>' +
      '<span class="category__name">' + esc(c.name) + '<span class="category__count">' + n + " " +
      plural(n, "модель", "модели", "моделей") + "</span></span></button></li>";
  }).join("");

  /* Фильтр-чипсы */
  var chips = $("[data-chips]");
  chips.innerHTML = [{ id: "all", name: "Все" }].concat(DATA.categories).map(function (c) {
    return '<button class="chip" type="button" data-chip="' + c.id + '" aria-pressed="' + (c.id === "all") + '">' + esc(c.name) + "</button>";
  }).join("");

  /* Подвал: ссылки на категории */
  $("[data-footer-cats]").innerHTML = DATA.categories.map(function (c) {
    return '<li><a href="#catalog" data-cat="' + c.id + '">' + esc(c.name) + "</a></li>";
  }).join("");

  /* Мини-список коллекции */
  $("[data-collection-list]").innerHTML = DATA.products.filter(function (p) { return p.collection === "forest"; })
    .slice(0, 3).map(function (p) {
      return '<li><a class="mini" href="#product=' + p.id + '"><img src="' + img(p.id, p.colors[0], 480) +
        '" width="64" height="80" loading="lazy" decoding="async" alt=""><span class="mini__name">' + esc(p.name) +
        '</span><span class="mini__price">' + priceLabel(p) + "</span></a></li>";
    }).join("");

  function visibleProducts() {
    var q = state.q.toLowerCase();
    var list = DATA.products.filter(function (p) {
      if (state.cat !== "all" && p.category !== state.cat) return false;
      if (state.collection && p.collection !== state.collection) return false;
      if (q) {
        var hay = (p.name + " " + catName[p.category] + " " + p.sku + " " + p.colors.map(colorName).join(" ")).toLowerCase();
        return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
      }
      return true;
    });
    var sorters = {
      popular: function (a, b) { return b.popular - a.popular; },
      "new": function (a, b) { return (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.popular - a.popular; },
      "price-asc": function (a, b) { return minPrice(a) - minPrice(b); },
      "price-desc": function (a, b) { return minPrice(b) - minPrice(a); }
    };
    return list.sort(sorters[state.sort]);
  }

  function cardHTML(p, i) {
    var c = cardColor[p.id] || p.colors[0];
    return '<li class="card" style="animation-delay:' + Math.min(i, 8) * 40 + 'ms">' +
      '<div class="card__media">' +
        '<img src="' + img(p.id, c, 480) + '" srcset="' + srcset(p.id, c) + '" sizes="(min-width: 1200px) 23vw, (min-width: 768px) 31vw, 47vw"' +
        ' width="480" height="600" loading="lazy" decoding="async" alt="' + esc(p.name + ", цвет: " + colorName(c).toLowerCase()) + '" data-card-img>' +
        (p.badge ? '<span class="card__badge">' + esc(p.badge) + "</span>" : "") +
        '<button class="card__quick" type="button" data-open="' + p.id + '">Быстрый просмотр</button>' +
      "</div>" +
      '<div class="card__body">' +
        '<div class="swatches" role="group" aria-label="Цвет">' + p.colors.map(function (k) {
          return '<button class="swatch" type="button" style="--c:' + DATA.colors[k].hex + '" data-swatch="' + p.id + "|" + k +
            '" aria-pressed="' + (k === c) + '" aria-label="' + esc(colorName(k)) + '" title="' + esc(colorName(k)) + '"></button>';
        }).join("") + "</div>" +
        '<h3 class="card__title"><a href="#product=' + p.id + '">' + esc(p.name) + "</a></h3>" +
        '<p class="card__sizes">Размеры: ' + esc(p.sizes.join(" · ")) + "</p>" +
        '<p class="card__price">' + priceLabel(p) + "</p>" +
      "</div></li>";
  }

  var grid = $("[data-products]"), countEl = $("[data-count]"), emptyEl = $("[data-empty]");
  var clearCol = $("[data-clear-collection]");
  function render() {
    var list = visibleProducts();
    grid.innerHTML = list.map(cardHTML).join("");
    emptyEl.hidden = list.length > 0;
    countEl.textContent = list.length ? "Показано " + list.length + " " + plural(list.length, "товар", "товара", "товаров") : "";
    $$(".chip", chips).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-chip") === state.cat)); });
    if (state.collection) {
      clearCol.hidden = false;
      clearCol.innerHTML = "Коллекция «" + esc(DATA.collections[state.collection].name) +
        '» <svg class="icon" aria-hidden="true"><use href="#i-close"/></svg><span class="visually-hidden">— сбросить</span>';
    } else clearCol.hidden = true;
  }

  function setCategory(cat, scroll) {
    state.cat = cat;
    render();
    if (scroll) scrollToEl($("#catalog"));
  }

  chips.addEventListener("click", function (e) {
    var b = e.target.closest("[data-chip]");
    if (b) setCategory(b.getAttribute("data-chip"));
  });
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-cat]");
    if (c) { e.preventDefault(); state.collection = null; setCategory(c.getAttribute("data-cat"), true); }
    var sc = e.target.closest("[data-show-collection]");
    if (sc) { state.collection = sc.getAttribute("data-show-collection"); state.cat = "all"; state.q = ""; search.value = ""; render(); scrollToEl($("#catalog")); }
  });
  clearCol.addEventListener("click", function () { state.collection = null; render(); });
  $("[data-reset]").addEventListener("click", function () {
    state = { cat: "all", collection: null, q: "", sort: state.sort }; search.value = ""; render();
  });

  var search = $("#catalog-search"), searchTimer;
  search.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { state.q = search.value.trim(); render(); }, 150);
  });
  $("#catalog-sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });

  grid.addEventListener("click", function (e) {
    var sw = e.target.closest("[data-swatch]");
    if (sw) {
      var parts = sw.getAttribute("data-swatch").split("|"), p = byId[parts[0]], k = parts[1];
      cardColor[p.id] = k;
      var card = sw.closest(".card"), im = $("[data-card-img]", card);
      im.srcset = srcset(p.id, k); im.src = img(p.id, k, 480);
      im.alt = p.name + ", цвет: " + colorName(k).toLowerCase();
      $$(".swatch", card).forEach(function (b) { b.setAttribute("aria-pressed", String(b === sw)); });
      return;
    }
    var q = e.target.closest("[data-open]");
    if (q) location.hash = "product=" + q.getAttribute("data-open");
  });

  render();

  /* ---------- диалоги ---------- */
  function openDialog(d) {
    if (!d.open) {
      if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    }
    document.body.classList.add("is-locked");
  }
  function closeDialog(d) { if (d.open) { if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); } }
  $$("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) {
      if (e.target === d || e.target.closest("[data-close]")) closeDialog(d);
    });
    d.addEventListener("close", function () {
      if (!$("dialog[open]")) document.body.classList.remove("is-locked");
    });
  });

  /* ---------- быстрый просмотр ---------- */
  var pdDialog = $("#product-dialog"), pdRoot = $("[data-pd]"), pd = null;

  function renderPD() {
    var p = pd.p, v = p.variants.filter(function (x) { return x.id === pd.variant; })[0];
    pdRoot.innerHTML =
      '<div class="pd__gallery">' +
        '<img class="pd__main" src="' + img(p.id, pd.color, 960) + '" srcset="' + srcset(p.id, pd.color) + '" sizes="(min-width: 768px) 520px, 100vw"' +
        ' width="960" height="1200" alt="' + esc(p.name + ", цвет: " + colorName(pd.color).toLowerCase()) + '">' +
        '<div class="pd__thumbs">' + p.colors.map(function (k) {
          return '<button class="pd__thumb" type="button" data-pd-color="' + k + '" aria-pressed="' + (k === pd.color) +
            '" aria-label="Показать цвет: ' + esc(colorName(k)) + '"><img src="' + img(p.id, k, 480) + '" width="52" height="64" alt=""></button>';
        }).join("") + "</div>" +
        '<span class="demo-tag">Демо-иллюстрация</span>' +
      "</div>" +
      '<div class="pd__info">' +
        "<div>" +
          '<p class="pd__sku">Арт. ' + esc(p.sku) + " · " + esc(catName[p.category]) + "</p>" +
          '<h2 class="pd__title" id="pd-title">' + esc(p.name) + "</h2>" +
        "</div>" +
        '<p class="pd__price" aria-live="polite">' + money(v.price) + "</p>" +
        "<div>" +
          '<p class="pd__label" id="pd-color-l">Цвет <span>' + esc(colorName(pd.color)) + "</span></p>" +
          '<div class="swatches" role="radiogroup" aria-labelledby="pd-color-l">' + p.colors.map(function (k) {
            return '<button class="swatch" type="button" role="radio" style="--c:' + DATA.colors[k].hex + '" data-pd-color="' + k +
              '" aria-checked="' + (k === pd.color) + '" aria-pressed="' + (k === pd.color) + '" aria-label="' + esc(colorName(k)) + '" title="' + esc(colorName(k)) + '"></button>';
          }).join("") + "</div>" +
        "</div>" +
        "<div>" +
          '<p class="pd__label"><span id="pd-size-l" style="color:inherit;font-weight:600">Размер' + (/\d–\d/.test(p.sizes[0]) && p.category !== "aksessuary" ? ", обхват головы (см)" : "") +
          '</span><button class="link-btn" type="button" data-action="sizes">Таблица размеров</button></p>' +
          '<div class="opts' + (pd.sizeError ? " is-error" : "") + '" role="radiogroup" aria-labelledby="pd-size-l">' + p.sizes.map(function (s) {
            return '<button class="opt" type="button" role="radio" data-pd-size="' + esc(s) + '" aria-checked="' + (s === pd.size) + '">' + esc(s) + "</button>";
          }).join("") + "</div>" +
          (pd.sizeError ? '<p class="pd__error" role="alert">Выберите размер</p>' : "") +
        "</div>" +
        (p.variants.length > 1 ?
          "<div>" +
            '<p class="pd__label" id="pd-var-l">Комплектность</p>' +
            '<div class="opts" role="radiogroup" aria-labelledby="pd-var-l">' + p.variants.map(function (x) {
              return '<button class="opt" type="button" role="radio" data-pd-variant="' + x.id + '" aria-checked="' + (x.id === pd.variant) + '">' +
                esc(x.name) + " · " + money(x.price) + "</button>";
            }).join("") + "</div>" +
          "</div>" : "") +
        '<div class="pd__buy">' +
          '<div class="qty" role="group" aria-label="Количество">' +
            '<button type="button" data-pd-qty="-1" aria-label="Меньше"><svg class="icon"><use href="#i-minus"/></svg></button>' +
            "<output>" + pd.qty + "</output>" +
            '<button type="button" data-pd-qty="1" aria-label="Больше"><svg class="icon"><use href="#i-plus"/></svg></button>' +
          "</div>" +
          '<button class="btn btn--accent" type="button" data-pd-add>Добавить в корзину</button>' +
        "</div>" +
        '<p class="pd__text">' + esc(p.text) + "</p>" +
        '<dl class="pd__meta">' +
          "<dt>Коллекция</dt><dd>" + esc(DATA.collections[p.collection].name) + "</dd>" +
          "<dt>Сезон</dt><dd>" + esc(DATA.collections[p.collection].season) + "</dd>" +
          "<dt>Цвета</dt><dd>" + esc(p.colors.map(colorName).join(", ")) + "</dd>" +
        "</dl>" +
        '<p class="hint">Товар, цена и иллюстрация — демонстрационные.</p>' +
      "</div>";
  }

  function openProduct(id) {
    var p = byId[id];
    if (!p) return;
    pd = { p: p, color: cardColor[id] || p.colors[0], size: p.sizes.length === 1 ? p.sizes[0] : null, variant: p.variants[0].id, qty: 1 };
    renderPD();
    openDialog(pdDialog);
    pdRoot.scrollTop = 0; pdDialog.scrollTop = 0;
  }

  pdRoot.addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-pd-color]"))) { pd.color = t.getAttribute("data-pd-color"); cardColor[pd.p.id] = pd.color; }
    else if ((t = e.target.closest("[data-pd-size]"))) { pd.size = t.getAttribute("data-pd-size"); pd.sizeError = false; }
    else if ((t = e.target.closest("[data-pd-variant]"))) { pd.variant = t.getAttribute("data-pd-variant"); }
    else if ((t = e.target.closest("[data-pd-qty]"))) { pd.qty = Math.max(1, Math.min(20, pd.qty + Number(t.getAttribute("data-pd-qty")))); }
    else if (e.target.closest("[data-pd-add]")) {
      if (!pd.size) { pd.sizeError = true; renderPD(); var f = $(".opt", pdRoot); if (f) f.focus(); return; }
      addToCart(pd.p.id, pd.color, pd.size, pd.variant, pd.qty);
      closeDialog(pdDialog);
      return;
    } else return;
    var focusKey = t.getAttribute("data-pd-color") ? "[data-pd-color='" + t.getAttribute("data-pd-color") + "']." + t.className.split(" ")[0]
      : t.getAttribute("data-pd-size") ? "[data-pd-size='" + t.getAttribute("data-pd-size") + "']"
      : t.getAttribute("data-pd-variant") ? "[data-pd-variant='" + t.getAttribute("data-pd-variant") + "']"
      : "[data-pd-qty='" + t.getAttribute("data-pd-qty") + "']";
    renderPD();
    var again = $(focusKey, pdRoot);
    if (again) again.focus();
    if (t.hasAttribute("data-pd-color")) render(); // карточка в каталоге показывает выбранный цвет
  });

  /* Адрес #product=<id> открывает товар — ссылкой можно поделиться */
  function route() {
    var m = /^#product=([\w-]+)$/.exec(location.hash);
    if (m && byId[m[1]]) openProduct(m[1]);
    else closeDialog(pdDialog);
  }
  window.addEventListener("hashchange", route);
  pdDialog.addEventListener("close", function () {
    if (/^#product=/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
  });
  route();

  /* ---------- корзина ---------- */
  var cart = (store.get("elfoxo-cart") || []).filter(function (l) { return byId[l.id]; });
  var cartDialog = $("#cart-dialog"), cartBody = $("[data-cart-body]"), cartFoot = $("[data-cart-foot]");
  var countBadge = $("[data-cart-count]"), cartBtn = $(".cart-btn");

  function linePrice(l) { return byId[l.id].variants.filter(function (v) { return v.id === l.variant; })[0].price; }
  function variantName(l) { return byId[l.id].variants.filter(function (v) { return v.id === l.variant; })[0].name; }
  function totalQty() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }
  function totalSum() { return cart.reduce(function (s, l) { return s + l.qty * linePrice(l); }, 0); }

  function saveCart(bump) {
    store.set("elfoxo-cart", cart);
    var n = totalQty();
    countBadge.hidden = n === 0;
    countBadge.textContent = n;
    cartBtn.setAttribute("aria-label", "Корзина, товаров: " + n);
    if (bump && !reduceMotion) { countBadge.classList.remove("is-bump"); void countBadge.offsetWidth; countBadge.classList.add("is-bump"); }
    renderCart();
  }

  function renderCart() {
    if (!cart.length) {
      cartBody.innerHTML = '<div class="cart-empty"><p class="empty__title">Корзина пуста</p><p>Добавьте понравившиеся модели из каталога.</p>' +
        '<a class="btn btn--primary" href="#catalog" data-close>Перейти в каталог</a></div>';
      cartFoot.innerHTML = "";
      return;
    }
    cartBody.innerHTML = '<ul>' + cart.map(function (l, i) {
      var p = byId[l.id];
      return '<li class="line"><img src="' + img(l.id, l.color, 480) + '" width="76" height="95" alt="">' +
        "<div><p class=\"line__name\">" + esc(p.name) + "</p>" +
        '<p class="line__opts">' + esc(colorName(l.color)) + " · " + esc(l.size) + (p.variants.length > 1 ? " · " + esc(variantName(l)) : "") + "</p>" +
        '<div class="line__row"><div class="qty" role="group" aria-label="Количество">' +
          '<button type="button" data-line="' + i + '" data-delta="-1" aria-label="Меньше"><svg class="icon"><use href="#i-minus"/></svg></button>' +
          "<output>" + l.qty + "</output>" +
          '<button type="button" data-line="' + i + '" data-delta="1" aria-label="Больше"><svg class="icon"><use href="#i-plus"/></svg></button></div>' +
          '<span class="line__price">' + money(l.qty * linePrice(l)) + "</span>" +
          '<button class="icon-btn line__remove" type="button" data-remove="' + i + '" aria-label="Удалить ' + esc(p.name) + '"><svg class="icon"><use href="#i-trash"/></svg></button>' +
        "</div></div></li>";
    }).join("") + "</ul>";
    cartFoot.innerHTML = '<p class="drawer__total"><span>Итого</span><span>' + money(totalSum()) + "</span></p>" +
      '<p class="drawer__note">Демоверсия: цены условные, оплата не подключена.</p>' +
      '<button class="btn btn--accent btn--block" type="button" data-checkout>Оформить заказ</button>';
  }

  function addToCart(id, color, size, variant, qty) {
    var key = [id, color, size, variant].join("|");
    var found = cart.filter(function (l) { return [l.id, l.color, l.size, l.variant].join("|") === key; })[0];
    if (found) found.qty = Math.min(20, found.qty + qty);
    else cart.push({ id: id, color: color, size: size, variant: variant, qty: qty });
    saveCart(true);
    toast("Добавлено в корзину", "Открыть", function () { openDialog(cartDialog); });
  }

  cartBody.addEventListener("click", function (e) {
    var b = e.target.closest("[data-delta]"), r = e.target.closest("[data-remove]");
    if (b) {
      var l = cart[Number(b.getAttribute("data-line"))];
      l.qty = Math.max(1, Math.min(20, l.qty + Number(b.getAttribute("data-delta"))));
      saveCart();
      var same = $("[data-line='" + b.getAttribute("data-line") + "'][data-delta='" + b.getAttribute("data-delta") + "']", cartBody);
      if (same) same.focus();
    } else if (r) {
      cart.splice(Number(r.getAttribute("data-remove")), 1);
      saveCart();
      var next = $("[data-remove]", cartBody) || $(".btn", cartBody);
      if (next) next.focus();
    }
  });

  /* ---------- демо-оформление ---------- */
  var coDialog = $("#checkout-dialog");
  function orderText() {
    return cart.map(function (l) {
      var p = byId[l.id];
      return p.name + " (" + p.sku + "), " + colorName(l.color).toLowerCase() + ", " + l.size +
        (p.variants.length > 1 ? ", " + variantName(l).toLowerCase() : "") + " — " + l.qty + " шт. × " + money(linePrice(l));
    }).join("\n") + "\nИтого: " + money(totalSum());
  }
  cartFoot.addEventListener("click", function (e) {
    if (!e.target.closest("[data-checkout]")) return;
    $("[data-checkout-summary]").textContent = orderText();
    closeDialog(cartDialog);
    openDialog(coDialog);
  });
  $("[data-copy-order]").addEventListener("click", function () {
    var text = orderText();
    function done() { toast("Состав заказа скопирован"); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      coDialog.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (err) { toast("Не удалось скопировать"); }
      ta.remove();
    }
  });

  /* ---------- уведомление ---------- */
  var toastEl = $("[data-toast]"), toastTimer;
  function toast(text, actionLabel, action) {
    toastEl.innerHTML = "<span>" + esc(text) + "</span>" + (actionLabel ? '<button type="button">' + esc(actionLabel) + "</button>" : "");
    if (action) $("button", toastEl).addEventListener("click", function () { hideToast(); action(); });
    requestAnimationFrame(function () { toastEl.classList.add("is-visible"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
  }
  function hideToast() { toastEl.classList.remove("is-visible"); }

  /* ---------- шапка: меню, поиск, корзина ---------- */
  var burger = $(".header__burger"), mnav = $("#mobile-nav"), header = $(".header");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    $("use", burger).setAttribute("href", open ? "#i-close" : "#i-menu");
    mnav.hidden = !open;
    mnav.classList.toggle("is-open", open);
  }
  burger.addEventListener("click", function () { setMenu(mnav.hidden); });
  mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !mnav.hidden) { setMenu(false); burger.focus(); }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-action]");
    if (!a) return;
    var act = a.getAttribute("data-action");
    if (act === "cart") { setMenu(false); openDialog(cartDialog); }
    if (act === "sizes") openDialog($("#sizes-dialog"));
    if (act === "search") {
      setMenu(false);
      scrollToEl($("#catalog"));
      setTimeout(function () { search.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
    }
  });
  // ссылки внутри диалогов (например, «Перейти в каталог» из пустой корзины)
  document.addEventListener("click", function (e) {
    var a = e.target.closest("dialog a[href^='#']");
    if (a) { var d = a.closest("dialog"); closeDialog(d); }
  });

  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- активный пункт меню и появление блоков ---------- */
  if ("IntersectionObserver" in window) {
    var links = $$(".nav__link");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.setAttribute("aria-current", String(l.getAttribute("href") === "#" + en.target.id)); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["catalog", "collection", "about", "order", "contacts"].forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$("[data-reveal]").forEach(function (el) { io.observe(el); });
  } else {
    $$("[data-reveal]").forEach(function (el) { el.classList.add("is-visible"); });
  }

  saveCart();
})();
