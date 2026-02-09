// ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ =====
// Используем window свойства чтобы Firebase мог их видеть и сохранять
window.kg = 0;
window.money = 0;

window.baseKgPerClick = 1;
window.bonusKgPerClick = 0;
window.rebirthMultiplier = 1;

window.rebirthLevel = 0;
window.rebirthCost = 10000;

console.log("✅ myproject.js загружен - инициализация переменных игры");

// ===== DOM =====
const kgValue = document.getElementById("kgvalue");
const moneyValue = document.getElementById("moneyvalue");
const levelValue = document.getElementById("level");
const progressBar = document.getElementById("progressbar");

// ===== ОБНОВЛЕНИЕ ЭКРАНА =====
window.updateUI = function() {
    kgValue.textContent = Math.floor(window.kg);
    moneyValue.textContent = Math.floor(window.money);
    levelValue.textContent = window.rebirthLevel;

    progressBar.max = window.rebirthCost;
    progressBar.value = Math.min(window.kg, window.rebirthCost);
}

// ===== КЛИК ПО КАРТИНКЕ =====
window.onclickbutton = function() {
    let totalClick =
        (window.baseKgPerClick + window.bonusKgPerClick) * window.rebirthMultiplier;

    window.kg += totalClick;
    window.updateUI();
    if (window.saveProgress) window.saveProgress();
}

// ===== ПРОДАЖА ЖИРА =====
document.querySelectorAll("#sellfat")[0].onclick = () => {
    window.money += window.kg * 10;
    window.kg = 0;
    window.updateUI();
    if (window.saveProgress) window.saveProgress();
};

// ===== МАГАЗИН =====
const btn = document.getElementById("salad");

btn.addEventListener("click", function handler() {
    btn.disabled = true;
    btn.innerText = "куплено";
    btn.removeEventListener("click", handler);
});


function buyItem(buttonId, price, bonus) {
    const btn = document.getElementById(buttonId);

    if (btn.disabled) return;

    if (window.money >= price) {
        window.money -= price;
        window.bonusKgPerClick += bonus;

        btn.disabled = true;
        btn.innerText = "куплено";

        window.updateUI();
        if (window.saveProgress) window.saveProgress();
    } else {
        alert("Недостаточно денег");
    }
}

const shopItems = [
    { id: "salad", price: 1000, bonus: 2 },
    { id: "pizza",  price: 10000, bonus: 5 },
    { id: "burger",  price: 50000, bonus: 10 },
    { id: "betonomeshalka",  price: 200000, bonus: 100 },
    { id: "medovik", price: 999999, bonus: 250 }
];

// кнопки магазина
document.getElementById("salad").onclick = () =>
    buyItem("salad", 1000, 2);

document.getElementById("pizza").onclick = () =>
    buyItem("pizza", 10000, 5);

document.getElementById("burger").onclick = () =>
    buyItem("burger", 50000, 10);

document.getElementById("betonomeshalka").onclick = () =>
    buyItem("betonomeshalka", 200000, 100);

document.getElementById("medovik").onclick = () =>
    buyItem("medovik", 999999, 250);

// ===== ПЕРЕРОЖДЕНИЕ =====
document.querySelectorAll("#sellfat")[1].onclick = () => {
    if (window.kg >= window.rebirthCost) {
        window.rebirthLevel++;
        window.rebirthMultiplier++;

        window.kg = 0;
        window.money = 0;
        window.bonusKgPerClick = 0;

        window.rebirthCost *= 10;

        resetShopButtons();

        alert(`Перерождение! Теперь x${window.rebirthMultiplier} к клику`);
        window.updateUI();
        if (window.saveProgress) window.saveProgress();
    } else {
        alert(`Нужно ${window.rebirthCost} KG`);
    }
};
function resetShopButtons() {
    shopItems.forEach(item => {
        const btn = document.getElementById(item.id);
        btn.disabled = false;
        btn.innerText = item.text;
    });
}

// Инициализируем UI при загрузке
window.updateUI();

console.log("🎮 Игра инициализирована!");
console.log("💾 Автосохранение каждые 30 секунд:", !!window.saveProgress);
console.log("📥 Функция загрузки доступна:", !!window.loadProgress);

// ===== ТАБЛИЦА ЛИДЕРОВ =====
async function updateLeaderboard() {
  if (!window.getLeaderboard) {
    console.warn("⚠️ window.getLeaderboard недоступна ещё");
    return;
  }
  
  const list = document.getElementById("leaderboard-list");
  if (!list) return;
  
  const leaderboard = await window.getLeaderboard();
  
  if (leaderboard.length === 0) {
    list.innerHTML = "<li>Загрузка...</li>";
    return;
  }
  
  list.innerHTML = leaderboard.map((user, index) => `
    <li>
      <strong>#${index + 1}</strong> ${user.name}
      <br>
      <small>KG: ${Math.floor(user.kg)} | Rebirth: ${user.rebirthLevel}x | 💰 ${Math.floor(user.money)}</small>
    </li>
  `).join("");
  
  console.log("📊 Таблица лидеров обновлена");
}

// Обновляем таблицу лидеров каждые 10 секунд
setInterval(updateLeaderboard, 10000);
// Обновляем один раз при загрузке (с задержкой чтобы firebase успел инициализироваться)
setTimeout(updateLeaderboard, 2000);

// Автоматическое сохранение прогресса каждые 30 секунд
setInterval(() => {
    if (window.saveProgress) {
        window.saveProgress();
    }
}, 30000);
