// Firebase設定ファイル

const firebaseConfig = {
    apiKey: "AIzaSyDMYBzJwO-SOj6AYLvKKNbLbgOkcbZ9d54",
    authDomain: "omorifudosan.firebaseapp.com",
    projectId: "omorifudosan",
    storageBucket: "omorifudosan.firebasestorage.app",
    messagingSenderId: "550441896181",
    appId: "1:550441896181:web:788f2d8a71a5bc96685dbc",
    measurementId: "G-4277KHWC0X"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);

// Firebaseサービスの初期化
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// コレクション名
const COLLECTIONS = {
    properties: 'properties',
    news: 'news',
    works: 'works'
};
