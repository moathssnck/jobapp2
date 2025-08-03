import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  // Your Firebase config will go here
  apiKey: "AIzaSyBYrLI1nXUX-fxem9pLVUYog4-ApAgdbl8",
  authDomain: "jonvbapp.firebaseapp.com",
  projectId: "jonvbapp",
  storageBucket: "jonvbapp.firebasestorage.app",
  messagingSenderId: "853579155809",
  appId: "1:853579155809:web:11b8177eb64c864dfd5d20",
  measurementId: "G-J44N9Q40E6"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
