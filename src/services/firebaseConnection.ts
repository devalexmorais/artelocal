
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAPLhk2IvcsgvELitAG12MYpph4_FpH2Y",
  authDomain: "artesequador.firebaseapp.com",
  projectId: "artesequador",
  storageBucket: "artesequador.appspot.com",
  messagingSenderId: "354131608882",
  appId: "1:354131608882:web:e198668c125d71bdfe032b"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage};