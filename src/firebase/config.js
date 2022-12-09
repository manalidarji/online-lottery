import { initializeApp } from "firebase/app";
import { getFirestore, collection } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4GcLDWHsq-gO7A3xen2avb50o093wDqY",
  authDomain: "online-lottery-23667.firebaseapp.com",
  projectId: "online-lottery-23667",
  storageBucket: "online-lottery-23667.appspot.com",
  messagingSenderId: "607613242004",
  appId: "1:607613242004:web:beae55903143328167c281"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const ticketsCollectionRef = collection(db, 'tickets');