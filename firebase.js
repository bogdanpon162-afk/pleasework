// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0iFc7XEFrQGKPppfuQHPklO1Lb58cwqA",
  authDomain: "iiyaclikccer.firebaseapp.com",
  projectId: "iiyaclikccer",
  storageBucket: "iiyaclikccer.firebasestorage.app",
  messagingSenderId: "125619400765",
  appId: "1:125619400765:web:a4b0aa7e8f0261aec57a54"
};

// 🔥 ИНИЦИАЛИЗАЦИЯ
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

console.log("🔥 Firebase инициализирован");
console.log("📧 Project ID:", firebaseConfig.projectId);
console.log("🔐 Auth domain:", firebaseConfig.authDomain);

// ===== ВХОД ЧЕРЕЗ GOOGLE =====
window.loginWithGoogle = async function () {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Ошибка при входе:", error);
    alert("Ошибка при входе: " + error.message);
  }
};

// Обработка результата редиректа при загрузке страницы
getRedirectResult(auth)
  .then(async (result) => {
    if (result && result.user) {
      const user = result.user;
      
      // при входе создаём/обновляем профиль без перезаписи прогресса
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName,
          photo: user.photoURL,
          updated: Date.now(),
        },
        { merge: true }
      );

      alert(`Ты вошёл как ${user.displayName}`);
    }
  })
  .catch((error) => {
    console.error("Ошибка при обработке входа:", error);
  });

// Сохраняет прогресс текущего игрока (merge: true)
window.saveProgress = async function () {
  const user = auth.currentUser;
  if (!user) {
    console.log("Не авторизован - прогресс не сохраняется");
    return;
  }
  try {
    console.log("💾 Сохраняю прогресс...");
    await setDoc(
      doc(db, "users", user.uid),
      {
        kg: window.kg || 0,
        money: window.money || 0,
        bonusKgPerClick: window.bonusKgPerClick || 0,
        baseKgPerClick: window.baseKgPerClick || 1,
        rebirthMultiplier: window.rebirthMultiplier || 1,
        rebirthLevel: window.rebirthLevel || 0,
        rebirthCost: window.rebirthCost || 10000,
        updated: Date.now(),
      },
      { merge: true }
    );
    console.log("✅ Прогресс сохранён!");
  } catch (e) {
    console.error("❌ saveProgress failed", e);
    alert("Ошибка при сохранении: " + e.message);
  }
};

// Загружает прогресс пользователя и применяет в окне
window.loadProgress = async function () {
  const user = auth.currentUser;
  if (!user) {
    console.log("Не авторизован - прогресс не загружается");
    return;
  }
  try {
    console.log("📥 Загружаю прогресс...");
    const d = await getDoc(doc(db, "users", user.uid));
    if (!d.exists()) {
      console.log("📝 Новый профиль - прогресса нет");
      return;
    }
    const data = d.data();
    if (typeof data.kg === "number") window.kg = data.kg;
    if (typeof data.money === "number") window.money = data.money;
    if (typeof data.bonusKgPerClick === "number") window.bonusKgPerClick = data.bonusKgPerClick;
    if (typeof data.baseKgPerClick === "number") window.baseKgPerClick = data.baseKgPerClick;
    if (typeof data.rebirthMultiplier === "number") window.rebirthMultiplier = data.rebirthMultiplier;
    if (typeof data.rebirthLevel === "number") window.rebirthLevel = data.rebirthLevel;
    if (typeof data.rebirthCost === "number") window.rebirthCost = data.rebirthCost;
    if (window.updateUI) window.updateUI();
    console.log("✅ Прогресс загружен!");
  } catch (e) {
    console.error("❌ loadProgress failed", e);
    alert("Ошибка при загрузке прогресса: " + e.message);
  }
};

// Получает топ 10 пользователей по KG
window.getLeaderboard = async function () {
  try {
    console.log("📊 Загружаю таблицу лидеров...");
    const q = query(
      collection(db, "users"),
      orderBy("kg", "desc"),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        name: data.name || "Аноним",
        kg: data.kg || 0,
        rebirthLevel: data.rebirthLevel || 0,
        money: data.money || 0,
      });
    });
    
    console.log("✅ Таблица лидеров загружена!", leaderboard);
    return leaderboard;
  } catch (e) {
    console.error("❌ getLeaderboard failed", e);
    return [];
  }
};

window.logout = async function () {
  try {
    console.log("👋 Сохраняю прогресс перед выходом...");
    await window.saveProgress();
    await signOut(auth);
    console.log("✅ Вышли из аккаунта");
  } catch (error) {
    console.error("Ошибка при выходе:", error);
  }
};

// Функция для обновления UI кнопок авторизации
function updateAuthUI(user) {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const userName = document.getElementById("user-name");

  if (user) {
    // Пользователь авторизован
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    userName.style.display = "inline";
    userName.textContent = `👤 ${user.displayName || user.email}`;
    console.log(`🎮 Авторизован как: ${user.displayName || user.email}`);
  } else {
    // Пользователь не авторизован
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
    userName.style.display = "none";
    console.log("❌ Не авторизован");
  }
}

// Слушаем изменения состояния аутентификации — загружаем прогресс и обновляем UI
onAuthStateChanged(auth, async (user) => {
  updateAuthUI(user);
  if (user) {
    console.log("🔐 Состояние аутентификации изменилось - загружаю прогресс...");
    await window.loadProgress();
  }
});
