// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
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

// ===== ВХОД ЧЕРЕЗ GOOGLE =====
window.loginWithGoogle = async function () {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // при первом входе создаём/обновляем профиль без перезаписи прогресса
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
};

// Сохраняет прогресс текущего игрока (merge: true)
window.saveProgress = async function () {
  const user = auth.currentUser;
  if (!user) return;
  try {
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
  } catch (e) {
    console.error("saveProgress failed", e);
  }
};

// Загружает прогресс пользователя и применяет в окне
window.loadProgress = async function () {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const d = await getDoc(doc(db, "users", user.uid));
    if (!d.exists()) return;
    const data = d.data();
    if (typeof data.kg === "number") window.kg = data.kg;
    if (typeof data.money === "number") window.money = data.money;
    if (typeof data.bonusKgPerClick === "number") window.bonusKgPerClick = data.bonusKgPerClick;
    if (typeof data.baseKgPerClick === "number") window.baseKgPerClick = data.baseKgPerClick;
    if (typeof data.rebirthMultiplier === "number") window.rebirthMultiplier = data.rebirthMultiplier;
    if (typeof data.rebirthLevel === "number") window.rebirthLevel = data.rebirthLevel;
    if (typeof data.rebirthCost === "number") window.rebirthCost = data.rebirthCost;
    if (window.updateUI) window.updateUI();
  } catch (e) {
    console.error("loadProgress failed", e);
  }
};

window.logout = async function () {
  await signOut(auth);
};

// Слушаем изменения состояния аутентификации — загружаем прогресс
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await window.loadProgress();
  }
});
