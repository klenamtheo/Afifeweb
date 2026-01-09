
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyC9FeJBMw-XdU6kwfSSEFq2XZ3N0yaucFU",
    authDomain: "afife-website.firebaseapp.com",
    projectId: "afife-website",
    storageBucket: "afife-website.firebasestorage.app",
    messagingSenderId: "218239599962",
    appId: "1:218239599962:web:07469778ab0677fa019f63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
