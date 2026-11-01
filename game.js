
const $ = id => document.getElementById(id);

const PROMO_DURATION = 24 * 60 * 60 * 1000;

let saved = localStorage.getItem("catCombatSave");

let game = saved ? JSON.parse(saved) : {
    coins: 0,
    gems: 0,
    xp: 0,
    power: 1,
    income: 0,
    powerCost: 50,
    incomeCost: 100,
    gemCost: 10,
    gemChance: 10,
    potionUntil: 0,
    wheelUntil: 0
};

function save() {
    localStorage.setItem("catCombatSave", JSON.stringify(game));
}

function promoActive() {
    return Number(localStorage.getItem("promoExpires") || 0) > Date.now();
}

function multiplier() {
    return promoActive() ? 2 : 1;
}

function render() {
    $("coins").textContent = Math.floor(game.coins);
    $("gems").textContent = game.gems;
    $("xp").textContent = game.xp;
    $("power").textContent = game.power * multiplier();
    $("income").textContent = game.income * multiplier();

    $("powerCost").textContent = game.powerCost;
    $("incomeCost").textContent = game.incomeCost;
    $("gemCost").textContent = game.gemCost;

    $("cat").textContent = promoActive() ? "🐱🎂🎉" : "🐱";

    $("promoStatus").textContent = promoActive()
        ? "🎉 Подвійні бонуси активні!"
        : "Промокод дає бонуси на 24 години";

    $("potionStatus").textContent =
        Date.now() < game.potionUntil ? "🧪 Зілля активне!" : "";

    save();
}

function tapCat() {
    let power = game.power * multiplier();

    if (Date.now() < game.potionUntil) {
        power *= 2;
    }

    game.coins += power;
    game.xp += multiplier();

    if (Math.random() * 100 < game.gemChance) {
        game.gems++;
    }

    render();
}

function buyUpgrade(type) {
    if (type === "power" && game.coins >= game.powerCost) {
        game.coins -= game.powerCost;
        game.power++;
        game.powerCost = Math.floor(game.powerCost * 1.7);
    }

    if (type === "income" && game.coins >= game.incomeCost) {
        game.coins -= game.incomeCost;
        game.income++;
        game.incomeCost = Math.floor(game.incomeCost * 1.7);
    }

    if (type === "gems" && game.gems >= game.gemCost) {
        game.gems -= game.gemCost;
        game.gemChance += 5;
        game.gemCost = Math.floor(game.gemCost * 1.8);
    }

    render();
}

function buyPotion() {
    if (game.coins < 200) return;

    game.coins -= 200;
    game.potionUntil = Date.now() + 30000;

    render();
}

function openBox(type) {
    const costs = {
        common: 100,
        rare: 500,
        epic: 15,
        legendary: 50
    };

    if (type === "common" || type === "rare") {
        if (game.coins < costs[type]) return;
        game.coins -= costs[type];
    } else {
        if (game.gems < costs[type]) return;
        game.gems -= costs[type];
    }

    let reward = Math.floor(Math.random() * 4);

    if (reward === 0) {
        let amount = 100 * (type === "legendary" ? 20 : 1);
        game.coins += amount;
        $("boxResult").textContent = "🪙 +" + amount + " монет!";
    } else if (reward === 1) {
        game.xp += 50;
        $("boxResult").textContent = "⭐ +50 XP!";
    } else if (reward === 2) {
        game.power++;
        $("boxResult").textContent = "💪 +1 сила!";
    } else {
        game.gems += 3;
        $("boxResult").textContent = "💎 +3 кристали!";
    }

    render();
}

function spinWheel() {
    if (Date.now() < game.wheelUntil) {
        $("wheelResult").textContent = "⏳ Колесо ще відновлюється!";
        return;
    }

    game.wheelUntil = Date.now() + 12 * 60 * 60 * 1000;

    let reward = Math.floor(Math.random() * 4);

    if (reward === 0) {
        game.coins += 500 * multiplier();
        $("wheelResult").textContent = "🪙 +500 монет!";
    } else if (reward === 1) {
        game.gems += 10;
        $("wheelResult").textContent = "💎 +10 кристалів!";
    } else if (reward === 2) {
        game.xp += 100 * multiplier();
        $("wheelResult").textContent = "⭐ +100 XP!";
    } else {
        game.power++;
        $("wheelResult").textContent = "💪 +1 сила!";
    }

    render();
}

function activatePromo() {
    const message = $("promoMessage");
    const input = $("promoInput");

    if (localStorage.getItem("vitaliy41_used") === "true") {
        message.textContent = "❌ Промокод уже використано!";
        return;
    }

    if (input.value.trim() !== "Vitaliy41") {
        message.textContent = "❌ Неправильний промокод!";
        return;
    }

    localStorage.setItem("vitaliy41_used", "true");
    localStorage.setItem("promoExpires", Date.now() + PROMO_DURATION);

    message.textContent = "🎉 Успішно! Усі бонуси x2 на 24 години!";
    input.disabled = true;

    render();
}

function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    $(page).classList.add("active");
}

setInterval(() => {
    game.coins += game.income * multiplier();
    render();
}, 60000);

render();


