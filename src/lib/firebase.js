import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2vHKt3P3TL92tgdM2U36DCtM54MQmgtY",
  authDomain: "moneta-web-9be7f.firebaseapp.com",
  projectId: "moneta-web-9be7f",
  storageBucket: "moneta-web-9be7f.firebasestorage.app",
  messagingSenderId: "972604234029",
  appId: "1:972604234029:web:3d1e054dd9024493b09ba4",
  measurementId: "G-9QEN14DNZV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
