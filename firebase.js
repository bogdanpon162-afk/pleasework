// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

  // создаём пользователя в БД
  await setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    photo: user.photoURL,
    kg: window.kg || 0,
    updated: Date.now()
  });

  alert(`Ты вошёл как ${user.displayName}`);
};
