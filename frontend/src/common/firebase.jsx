// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCSIKG13XdEZgtiqT7Svz0dmzG9fXk0-lg",
  authDomain: "blogspace-49965.firebaseapp.com",
  projectId: "blogspace-49965",
  storageBucket: "blogspace-49965.appspot.com",
  messagingSenderId: "672920698671",
  appId: "1:672920698671:web:f90278b6b60d91a35febda",
  measurementId: "G-YH7R4QSDWZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

//google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};
