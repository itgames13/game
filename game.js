
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

let s = JSON.parse(localStorage.getItem("catSave") || "null") || {
  coins: 0, gems: 10, xp: 0,
  power: 1, tapLevel: 1,
  income: 0, incomeLevel: 0,
  chance: 2, gemLevel: 0,
  lastSpin: 0
};

let coinBoost = 0;
let xpBoost = 0;

function save() {
  localStorage.setItem("catSave", JSON.stringify(s));
  render();
}

function render() {
  coins.textContent = Math.floor(s.coins);
  gems.textContent = s.gems;
  xp.textContent = s.xp;
  power.textContent = s.power;
  tapCost.textContent = Math.ceil(25 * 1.65 ** (s.tapLevel - 1));
  incomeCost.textContent = Math.ceil(100 * 1.75 ** s.incomeLevel);
  gemCost.textContent = Math.ceil(10 * 1.8 ** s.gemLevel);
  chance.textContent = s.chance;
}

function tap() {
  let amount = s.power * (Date.now() < coinBoost ? 2 : 1);
  s.coins += amount;
  s.xp += Date.now() < xpBoost ? 2 : 1;

  if (Math.random() * 100 < s.chance) {
    s.gems++;
  }

  tg?.HapticFeedback?.impactOccurred("light");
  save();
}

function show(id) {
  ["home","upgrades","boxes","wheel"].forEach(x => {
    document.getElementById(x).hidden = x !== id;
  });
}

function buyTap() {
  let cost = Math.ceil(25 * 1.65 ** (s.tapLevel - 1));
  if (s.coins < cost) return alert("Мало монет!");
  s.coins -= cost;
  s.power++;
  s.tapLevel++;
  save();
}

function buyIncome() {
  let cost = Math.ceil(100 * 1.75 ** s.incomeLevel);
  if (s.coins < cost) return alert("Мало монет!");
  s.coins -= cost;
  s.income++;
  s.incomeLevel++;
  save();
}

function buyGem() {
  let cost = Math.ceil(10 * 1.8 ** s.gemLevel);
  if (s.gems < cost || s.chance >= 30)
    return alert("Недостатньо кристалів!");
  s.gems -= cost;
  s.chance = Math.min(30, s.chance + 2);
  s.gemLevel++;
  save();
}

function potion(type) {
  if (s.gems < 3) return alert("Мало кристалів!");
  s.gems -= 3;
  if (type === "coins") coinBoost = Date.now() + 30000;
  else xpBoost = Date.now() + 30000;
  boost.textContent = "🧪 Бонус активний 30 секунд!";
  save();
}

function openBox(type) {
  const boxes = {
    common: [100,"coins",[
      ["50 монет",50,0,0],
      ["150 монет",150,0,0],
      ["1 кристал",0,1,0],
      ["20 XP",0,0,20],
      ["+1 сила",0,0,10]
    ]],
    rare: [500,"coins",[
      ["300 монет",300,0,0],
      ["700 монет",700,0,0],
      ["5 кристалів",0,5,0],
      ["100 XP",0,0,100],
      ["+2 сили",0,0,50]
    ]],
    epic: [15,"gems",[
      ["10 кристалів",0,10,0],
      ["1500 монет",1500,0,0],
      ["250 XP",0,0,250],
      ["+5 сили",0,0,100]
    ]],
    legendary: [50,"gems",[
      ["25 кристалів",0,25,0],
      ["5000 монет",5000,0,0],
      ["1000 XP",0,0,1000],
      ["+15 сили",0,0,300]
    ]]
  };

  let b = boxes[type];
  if (s[b[1]] < b[0]) return alert("Недостатньо ресурсів!");

  s[b[1]] -= b[0];
  let r = b[2][Math.floor(Math.random() * b[2].length)];
  s.coins += r[1];
  s.gems += r[2];
  s.xp += r[3];

  if (r[0].includes("сили")) {
    s.power += type === "common" ? 1 :
      type === "rare" ? 2 :
      type === "epic" ? 5 : 15;
  }

  boxResult.textContent = "🎉 Тобі випало: " + r[0];
  save();
}

function spin() {
  const cooldown = 12 * 60 * 60 * 1000;
  if (Date.now() - s.lastSpin < cooldown)
    return alert("Колесо ще відновлюється!");

  const rewards = [
    ["200 монет", () => s.coins += 200],
    ["3 кристали", () => s.gems += 3],
    ["100 XP", () => s.xp += 100],
    ["500 монет", () => s.coins += 500],
    ["10 кристалів", () => s.gems += 10],
    ["+2 сили", () => s.power += 2],
    ["1000 монет", () => s.coins += 1000],
    ["5 кристалів", () => s.gems += 5]
  ];

  const r = rewards[Math.floor(Math.random() * rewards.length)];
  const disc = document.getElementById("wheel");
  disc.style.transition = "transform 3s";
  disc.style.transform = "rotate(1800deg)";

  setTimeout(() => {
    r[1]();
    s.lastSpin = Date.now();
    wheelResult.textContent = "🎉 Виграш: " + r[0];
    save();
  }, 3000);
}

setInterval(() => {
  if (s.income > 0) {
    s.coins += s.income;
    s.xp += Math.max(1, Math.floor(s.income / 5));
    save();
  }
}, 60000);

render();

// ===== ПРОМОКОД Vitaliy41 =====

const PROMO_CODE = "Vitaliy41";
const PROMO_DURATION = 24 * 60 * 60 * 1000;

// Перевірка, чи промокод уже активували
if (localStorage.getItem("vitaliy41_used") === "true") {
    console.log("Промокод уже використано");
}

// Активація промокоду
function activatePromo() {
    const input = document.getElementById("promoInput");
    const message = document.getElementById("promoMessage");

    if (!input || !message) return;

    const code = input.value.trim();

    if (localStorage.getItem("vitaliy41_used") === "true") {
        message.textContent = "❌ Цей промокод уже активовано!";
        return;
    }

    if (code !== PROMO_CODE) {
        message.textContent = "❌ Неправильний промокод!";
        return;
    }

    const expires = Date.now() + PROMO_DURATION;

    localStorage.setItem("vitaliy41_used", "true");
    localStorage.setItem("promoExpires", expires);

    message.textContent = "🎉 Промокод активовано! Усі бонуси x2 на 24 години!";

    if (typeof render === "function") render();
}

// Перевірка активного бонусу
function isPromoActive() {
    const expires = Number(localStorage.getItem("promoExpires") || 0);
    return expires > Date.now();
}

// Множник монет, сили та XP
function getPromoMultiplier() {
    return isPromoActive() ? 2 : 1;
}

// Святковий кіт
function getPromoCat() {
    return isPromoActive() ? "🐱🎂🎉" : "🐱";
}
