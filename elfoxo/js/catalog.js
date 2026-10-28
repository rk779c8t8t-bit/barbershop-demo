/*
  ДЕМОНСТРАЦИОННЫЙ КАТАЛОГ ElFoxo.
  Все товары, артикулы, цены и иллюстрации ниже — условные, для показа дизайна.
  Это не реальный ассортимент бренда. Чтобы подключить настоящий каталог,
  замените данные в этом файле (или загрузите их из CMS в том же формате).

  Картинка товара берётся по шаблону:
  images/products/<id>-<цвет>-480.webp и …-960.webp
*/
window.ELFOXO_CATALOG = {
  categories: [
    { id: "shapki",     name: "Шапки",            image: "cat-shapki" },
    { id: "panamy",     name: "Панамы",           image: "cat-panamy" },
    { id: "kepki",      name: "Кепки",            image: "cat-kepki" },
    { id: "komplekty",  name: "Комплекты",        image: "cat-komplekty" },
    { id: "aksessuary", name: "Снуды и варежки",  image: "cat-aksessuary" }
  ],

  collections: {
    forest: { name: "Лесная осень", season: "Осень — зима" },
    basic:  { name: "Базовая линия", season: "Всесезонно" },
    summer: { name: "Лето", season: "Весна — лето" }
  },

  colors: {
    ryzhiy:   { name: "Рыжий",       hex: "#C46F3E" },
    moloko:   { name: "Молочный",    hex: "#EEE5D6" },
    grafit:   { name: "Графит",      hex: "#4B4B4E" },
    pudra:    { name: "Пудровый",    hex: "#D7AFA3" },
    shalfey:  { name: "Шалфей",      hex: "#9AA88F" },
    pesok:    { name: "Песочный",    hex: "#D1B48D" },
    goluboy:  { name: "Голубой",     hex: "#A7BCCD" },
    sinij:    { name: "Тёмно-синий", hex: "#36445B" },
    gorchica: { name: "Горчичный",   hex: "#C89A3C" },
    shokolad: { name: "Шоколадный",  hex: "#6E4C3B" }
  },

  products: [
    {
      id: "fox-beanie", sku: "DEMO-101", art: "fox",
      name: "Шапка-бини «Лисёнок» с ушками",
      category: "shapki", collection: "forest", badge: "Новинка", popular: 100,
      colors: ["ryzhiy", "moloko", "grafit"],
      sizes: ["46–48", "48–50", "50–52"],
      variants: [
        { id: "hat", name: "Шапка", price: 1490 },
        { id: "set", name: "Шапка + снуд", price: 2390 }
      ],
      text: "Вязаная шапка с объёмными ушками и широким отворотом. Отворот можно подгибать, чтобы шапка «росла» вместе с ребёнком."
    },
    {
      id: "pompom-hat", sku: "DEMO-102", art: "pompom",
      name: "Шапка с помпоном «Сугроб»",
      category: "shapki", collection: "forest", badge: "Новинка", popular: 92,
      colors: ["moloko", "pudra", "shalfey"],
      sizes: ["46–48", "48–50", "50–52", "52–54"],
      variants: [
        { id: "hat", name: "Шапка", price: 1690 },
        { id: "set", name: "Шапка + варежки", price: 2490 }
      ],
      text: "Классическая зимняя шапка с пушистым помпоном и двойным отворотом."
    },
    {
      id: "rib-beanie", sku: "DEMO-103", art: "rib",
      name: "Шапка-бини в рубчик",
      category: "shapki", collection: "basic", popular: 80,
      colors: ["pesok", "grafit", "goluboy"],
      sizes: ["48–50", "50–52", "52–54"],
      variants: [{ id: "hat", name: "Шапка", price: 1190 }],
      text: "Лаконичная шапка эластичной вязки «резинка» на каждый день."
    },
    {
      id: "helmet", sku: "DEMO-104", art: "helmet",
      name: "Шапка-шлем «Тёплый»",
      category: "shapki", collection: "basic", popular: 74,
      colors: ["grafit", "pesok", "sinij"],
      sizes: ["46–48", "48–50", "50–52"],
      variants: [{ id: "hat", name: "Шапка-шлем", price: 1790 }],
      text: "Закрывает уши и шею — удобно под капюшон и для прогулок в ветреную погоду."
    },
    {
      id: "panama-cotton", sku: "DEMO-201", art: "panama",
      name: "Панама из хлопка",
      category: "panamy", collection: "summer", popular: 88,
      colors: ["pesok", "shalfey", "moloko"],
      sizes: ["46–48", "48–50", "50–52", "52–54"],
      variants: [{ id: "panama", name: "Панама", price: 990 }],
      text: "Лёгкая панама с мягкими полями и отстрочкой. Защищает от солнца на прогулке."
    },
    {
      id: "panama-reversible", sku: "DEMO-202", art: "panama2",
      name: "Панама двусторонняя в горошек",
      category: "panamy", collection: "summer", popular: 70,
      colors: ["goluboy", "pudra", "gorchica"],
      sizes: ["48–50", "50–52", "52–54"],
      variants: [{ id: "panama", name: "Панама", price: 1290 }],
      text: "Две панамы в одной: однотонная сторона и сторона с принтом в горошек."
    },
    {
      id: "cap-baseball", sku: "DEMO-301", art: "cap",
      name: "Кепка-бейсболка",
      category: "kepki", collection: "summer", popular: 76,
      colors: ["pesok", "sinij", "shalfey"],
      sizes: ["48–50", "50–52", "52–54"],
      variants: [{ id: "cap", name: "Кепка", price: 1090 }],
      text: "Кепка из шести клиньев с регулируемой застёжкой сзади."
    },
    {
      id: "cap-twotone", sku: "DEMO-302", art: "cap2",
      name: "Кепка с контрастным козырьком",
      category: "kepki", collection: "basic", popular: 64,
      colors: ["moloko", "gorchica"],
      sizes: ["48–50", "50–52"],
      variants: [{ id: "cap", name: "Кепка", price: 1190 }],
      text: "Кепка с козырьком контрастного цвета — легко найти на детской площадке."
    },
    {
      id: "set-snood", sku: "DEMO-401", art: "setSnood",
      name: "Комплект «Лесная прогулка»: шапка и снуд",
      category: "komplekty", collection: "forest", badge: "Новинка", popular: 96,
      colors: ["ryzhiy", "gorchica", "shokolad"],
      sizes: ["46–48", "48–50", "50–52"],
      variants: [{ id: "set", name: "Шапка + снуд", price: 2690 }],
      text: "Шапка с ушками и снуд из одной пряжи — готовый образ для прогулок осенью."
    },
    {
      id: "set-mittens", sku: "DEMO-402", art: "setMitt",
      name: "Комплект: шапка и варежки",
      category: "komplekty", collection: "basic", popular: 82,
      colors: ["pudra", "moloko", "sinij"],
      sizes: ["46–48", "48–50"],
      variants: [{ id: "set", name: "Шапка + варежки", price: 2490 }],
      text: "Шапка с помпоном и варежки на шнурке — не потеряются по дороге из садика."
    },
    {
      id: "snood", sku: "DEMO-501", art: "snood",
      name: "Снуд вязаный",
      category: "aksessuary", collection: "forest", badge: "Новинка", popular: 78,
      colors: ["gorchica", "moloko", "shokolad"],
      sizes: ["Единый"],
      variants: [{ id: "snood", name: "Снуд", price: 990 }],
      text: "Мягкий снуд-труба: надевается через голову, без завязок и длинных концов."
    },
    {
      id: "mittens", sku: "DEMO-502", art: "mittens",
      name: "Варежки на шнурке",
      category: "aksessuary", collection: "basic", popular: 72,
      colors: ["ryzhiy", "shalfey", "grafit"],
      sizes: ["1–2 года", "3–4 года", "5–6 лет"],
      variants: [{ id: "mittens", name: "Варежки", price: 790 }],
      text: "Варежки с длинной манжетой, соединённые шнурком."
    }
  ]
};
