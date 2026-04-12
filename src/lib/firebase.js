import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

let app = null;
let db = null;
let storage = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

const ensureFirebaseEnabled = () => {
  if (!db || !storage) {
    throw new Error('Firebase is not configured. Please add Firebase env variables.');
  }
};

export const getFirebaseProfile = async (uid) => {
  if (!uid || !db) return null;
  const profileRef = doc(db, 'user_profiles', uid);
  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const ensureFirebaseProfile = async (uid, profileData) => {
  if (!uid) return null;
  ensureFirebaseEnabled();
  const profileRef = doc(db, 'user_profiles', uid);
  const snapshot = await getDoc(profileRef);
  const now = serverTimestamp();

  if (!snapshot.exists()) {
    await setDoc(profileRef, {
      ...profileData,
      created_at: now,
      updated_at: now,
    });
    return { ...profileData, created_at: now, updated_at: now };
  }

  await setDoc(profileRef, {
    ...snapshot.data(),
    ...profileData,
    updated_at: now,
  }, { merge: true });

  return { ...snapshot.data(), ...profileData, updated_at: now };
};

export const saveFirebaseProfile = async (uid, profileData) => {
  if (!uid) return null;
  ensureFirebaseEnabled();
  const profileRef = doc(db, 'user_profiles', uid);
  await setDoc(profileRef, {
    ...profileData,
    updated_at: serverTimestamp(),
  }, { merge: true });
  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const uploadProfilePhoto = async (uid, file) => {
  if (!uid || !file) return null;
  ensureFirebaseEnabled();
  const storageRef = ref(storage, `profile_photos/${uid}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

const createTurfDoc = async (turfId) => {
  if (!turfId) return;
  ensureFirebaseEnabled();
  const turfRef = doc(db, 'firebase_turfs', turfId);
  await setDoc(turfRef, { updated_at: serverTimestamp() }, { merge: true });
  return turfRef;
};

export const fetchTurfComments = async (turfId) => {
  if (!turfId) return [];
  const turfRef = await createTurfDoc(turfId);
  const commentsRef = collection(turfRef, 'comments');
  const q = query(commentsRef, orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchTurfFeedback = async (turfId) => {
  if (!turfId) return [];
  const turfRef = await createTurfDoc(turfId);
  const feedbackRef = collection(turfRef, 'feedback');
  const q = query(feedbackRef, orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToTurfComments = async (turfId, callback) => {
  if (!turfId) return () => {};
  const turfRef = await createTurfDoc(turfId);
  const commentsRef = collection(turfRef, 'comments');
  const q = query(commentsRef, orderBy('created_at', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  });
};

export const subscribeToTurfFeedback = async (turfId, callback) => {
  if (!turfId) return () => {};
  const turfRef = await createTurfDoc(turfId);
  const feedbackRef = collection(turfRef, 'feedback');
  const q = query(feedbackRef, orderBy('created_at', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  });
};

export const subscribeToTurfRatingSummary = async (turfId, callback) => {
  if (!turfId) return () => {};
  const turfRef = await createTurfDoc(turfId);
  const feedbackRef = collection(turfRef, 'feedback');
  const q = query(feedbackRef, orderBy('created_at', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const ratings = snapshot.docs.map((doc) => doc.data()?.rating || 0).filter((rating) => rating > 0);
    const count = ratings.length;
    const average = count === 0 ? null : ratings.reduce((sum, value) => sum + value, 0) / count;
    callback({ average, count });
  });
};

export const fetchTurfRatingSummary = async (turfId) => {
  if (!turfId) return { average: null, count: 0 };
  const turfRef = await createTurfDoc(turfId);
  const feedbackRef = collection(turfRef, 'feedback');
  const q = query(feedbackRef, orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  const ratings = snapshot.docs.map((doc) => doc.data()?.rating || 0).filter((rating) => rating > 0);
  const count = ratings.length;
  const average = count === 0 ? null : ratings.reduce((sum, value) => sum + value, 0) / count;
  return { average, count };
};

export const submitTurfComment = async (turfId, commentData) => {
  if (!turfId || !commentData) return null;
  const turfRef = await createTurfDoc(turfId);
  const commentsRef = collection(turfRef, 'comments');
  const docRef = await addDoc(commentsRef, {
    ...commentData,
    created_at: serverTimestamp(),
  });
  return { id: docRef.id, ...commentData };
};

export const submitTurfFeedback = async (turfId, feedbackData) => {
  if (!turfId || !feedbackData) return null;
  const turfRef = await createTurfDoc(turfId);
  const feedbackRef = collection(turfRef, 'feedback');
  const docRef = await addDoc(feedbackRef, {
    ...feedbackData,
    created_at: serverTimestamp(),
  });
  return { id: docRef.id, ...feedbackData };
};
