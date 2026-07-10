import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const app = initializeApp(config);

// Connect to the specific firestore database specified in config
export const db = getFirestore(app, config.firestoreDatabaseId || undefined);
