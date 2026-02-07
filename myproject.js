// ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ =====
let kg = 0;
let money = 0;

let baseKgPerClick = 1;
let bonusKgPerClick = 0;
let rebirthMultiplier = 1;

let rebirthLevel = 0;
let rebirthCost = 10000;

// ===== DOM =====
const kgValue = document.getElementById("kgvalue");
const moneyValue = document.getElementById("moneyvalue");
const levelValue = document.getElementById("level");
const progressBar = document.getElementById("progressbar");

// ===== ОБНОВЛЕНИЕ ЭКРАНА =====
function updateUI() {
    kgValue.textContent = Math.floor(kg);
    moneyValue.textContent = Math.floor(money);
    levelValue.textContent = rebirthLevel;

    progressBar.max = rebirthCost;
    progressBar.value = Math.min(kg, rebirthCost);
}

// ===== КЛИК ПО КАРТИНКЕ =====
function onclickbutton() {
    let totalClick =
        (baseKgPerClick + bonusKgPerClick) * rebirthMultiplier;

    kg += totalClick;
    updateUI();
}

// ===== ПРОДАЖА ЖИРА =====
document.querySelectorAll("#sellfat")[0].onclick = () => {
    money += kg * 10;
    kg = 0;
    updateUI();
};

// ===== МАГАЗИН =====
function buyItem(price, bonus) {
    if (money >= price) {
        money -= price;
        bonusKgPerClick += bonus;
        updateUI();
    } else {
        alert("Недостаточно денег");
    }
}

// кнопки магазина
document.getElementById("salad").onclick = () => buyItem(1000, 2);
document.getElementById("pizza").onclick = () => buyItem(10000, 5);
document.getElementById("burger").onclick = () => buyItem(50000, 10);
document.getElementById("betonomeshalka").onclick = () => buyItem(200000, 100);
document.getElementById("medovik").onclick = () => buyItem(999999, 250);

// ===== ПЕРЕРОЖДЕНИЕ =====
document.querySelectorAll("#sellfat")[1].onclick = () => {
    if (kg >= rebirthCost) {
        rebirthLevel++;
        rebirthMultiplier++;

        kg = 0;
        money = 0;
        bonusKgPerClick = 0;

        rebirthCost *= 10;

        alert(`Перерождение! Теперь x${rebirthMultiplier} к клику`);
        updateUI();
    } else {
        alert(`Нужно ${rebirthCost} KG`);
    }
};

updateUI();