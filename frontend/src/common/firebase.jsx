// Import the functions you need from the SDKs you need
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCX25ClsHDqsi2mnaX9fBOv1fEhybAOE38",
  authDomain: "reactjs-blog-website-82409.firebaseapp.com",
  projectId: "reactjs-blog-website-82409",
  storageBucket: "reactjs-blog-website-82409.appspot.com",
  messagingSenderId: "1087672755167",
  appId: "1:1087672755167:web:1f0e2ef25feaf54e949a6a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// google auth

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
