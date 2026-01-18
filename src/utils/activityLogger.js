
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs a portal activity to Firestore
 * @param {string} userId - ID of the user performing the action
 * @param {string} userName - Name of the user
 * @param {string} action - Description of the action (e.g., 'Submitted Permit')
 * @param {string} type - Category of activity (e.g., 'permit', 'request', 'report')
 * @param {string} metadata - Optional additional info
 */
export const logActivity = async (userId, userName, action, type, metadata = '') => {
    try {
        await addDoc(collection(db, 'portal_activities'), {
            userId,
            userName,
            action,
            type,
            metadata,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};
