import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5_AXXlb9RZ2GPi5Ac_wThuywY7gL0s7s",
  authDomain: "hackutd-2024auth.firebaseapp.com",
  projectId: "hackutd-2024auth",
  storageBucket: "hackutd-2024auth.firebasestorage.app",
  messagingSenderId: "137198633875",
  appId: "1:137198633875:web:11f69a9a5aac4d0e8b9e66"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);