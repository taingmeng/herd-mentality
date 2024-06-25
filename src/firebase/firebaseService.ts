import { firestore } from "./firebase";
import { addDoc, collection, documentId, doc } from "firebase/firestore"; 

 export const postData = async () => {
  try {
    const docRef = await addDoc(collection(firestore, "fake-artist"), {
      first: "Alan",
      middle: "Mathison",
      last: "Turing",
      born: 1912
    });
  
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getData = (gameCode: string) => {
  return doc(firestore, "fake-artist", gameCode);
};