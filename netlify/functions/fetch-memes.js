import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const handler = async () => {
  try {
    const memesRef = collection(db, "memes");
    const querySnapshot = await getDocs(memesRef);

    const memes = [];
    querySnapshot.forEach((doc) => memes.push(doc.data()));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, memes }),
    };
  } catch (error) {
    console.error("Error fetching memes:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Failed to fetch memes." }),
    };
  }
};
