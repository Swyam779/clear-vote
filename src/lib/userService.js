// src/lib/userService.js
import { db } from './firebase';
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';

/**
 * Generates a random 8-digit number and ensures it's unique
 * in the 'users' collection.
 */
const generateUniqueVoterId = async () => {
  let voterId;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 8-digit number (from 10,000,000 to 99,999,999)
    voterId = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Check if this ID already exists
    const q = query(collection(db, 'users'), where('voterId', '==', voterId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      isUnique = true; // The ID is unique
    }
    // If not unique, the loop will run again
  }
  return voterId;
};

/**
 * Gets or creates a user in the Firestore 'users' collection.
 * This is called after a successful Firebase Auth sign-in.
 */
export const getOrCreateUser = async (authUser) => {
  // Use the user's unique Firebase UID as the document ID
  const userRef = doc(db, 'users', authUser.uid);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    // User already exists, just return their data
    return docSnap.data();
  } else {
    // This is a new user, let's create their profile
    console.log('Creating new user profile...');
    const uniqueVoterId = await generateUniqueVoterId();

    const newUser = {
      name: authUser.displayName,
      email: authUser.email,
      photoURL: authUser.photoURL,
      createdAt: new Date(),
      voterId: uniqueVoterId, // The new unique Voter ID
    };

    // Create the document
    await setDoc(userRef, newUser);
    return newUser;
  }
};