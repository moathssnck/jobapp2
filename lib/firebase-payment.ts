import { getFirestore, collection, addDoc, doc, getDoc } from "firebase/firestore"
import CryptoJS from "crypto-js"

const db = getFirestore()

// Encrypt function
function encryptCardNumber(cardNumber: string, secretKey: string) {
  return CryptoJS.AES.encrypt(cardNumber, secretKey).toString()
}

// Decrypt function
function decryptCardNumber(encrypted: string, secretKey: string) {
  const bytes = CryptoJS.AES.decrypt(encrypted, secretKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// Store encrypted card
export async function storeCardFull(cardNumber: string, expiry: string, name: string) {
  const secretKey = process.env.NEXT_PUBLIC_FIREBASE_CARD_KEY || "default-secret"

  const encryptedCard = encryptCardNumber(cardNumber, secretKey)

  await addDoc(collection(db, "payments"), {
    cardNumber: encryptedCard,
    expiry,
    name,
    createdAt: new Date(),
  })

  console.log("Card stored securely in Firestore")
}

// Retrieve and decrypt card
export async function getCard(docId: string) {
  const secretKey = process.env.NEXT_PUBLIC_FIREBASE_CARD_KEY || "default-secret"

  const docRef = doc(db, "payments", docId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    console.log("No such document!")
    return null
  }

  const data = docSnap.data()
  const decryptedCardNumber = decryptCardNumber(data.cardNumber, secretKey)

  return {
    ...data,
    cardNumber: decryptedCardNumber,
  }
}
