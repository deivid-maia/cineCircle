import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDqSw7bEBsJWcbyVGfCMhwQSc9gpIFY6nU",
    authDomain: "cinecircle-ed59d.firebaseapp.com",
    databaseURL: "https://cinecircle-ed59d-default-rtdb.firebaseio.com",
    projectId: "cinecircle-ed59d",
    storageBucket: "cinecircle-ed59d.firebasestorage.app",
    messagingSenderId: "1065097417540",
    appId: "1:1065097417540:web:d0b709539471be53bafd11",
    measurementId: "G-GGXBQ9HYDG"
};

// Inicializar Firebase apenas se ainda não estiver inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase inicializado com sucesso');
} else {
    console.log('Firebase já estava inicializado');
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export default firebase;