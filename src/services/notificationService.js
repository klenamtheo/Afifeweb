
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Sends a notification to the admin dashboard and triggers an email alert.
 * @param {string} type - The type of activity (e.g., 'registration', 'suggestion', 'application', 'permit', 'report')
 * @param {object} data - Relevant details about the activity
 */
export const sendAdminNotification = async (type, data) => {
    try {
        const timestamp = serverTimestamp();

        // 1. Store in admin_notifications for the dashboard
        await addDoc(collection(db, 'admin_notifications'), {
            type,
            ...data,
            read: false,
            createdAt: timestamp
        });

        // 2. Trigger Email (compatible with Firebase Trigger Email extension)
        await addDoc(collection(db, 'mail'), {
            to: 'klenamtheophilus@gmail.com',
            message: {
                subject: `Afife Portal: New ${type.charAt(0).toUpperCase() + type.slice(1)} Update`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
                        <h2 style="color: #2E7D32;">Afife Town Portal Update</h2>
                        <p>A new activity has been recorded on the portal:</p>
                        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #FDD835; margin: 20px 0;">
                            <p><strong>Activity Type:</strong> ${type.toUpperCase()}</p>
                            <p><strong>Details:</strong> ${data.message || 'Check the admin dashboard for full details.'}</p>
                            ${data.userName ? `<p><strong>User:</strong> ${data.userName}</p>` : ''}
                            ${data.email ? `<p><strong>User Email:</strong> ${data.email}</p>` : ''}
                        </div>
                        <p>Log in to the <a href="https://afifetown.org/admin" style="color: #2E7D32; font-weight: bold;">Admin Dashboard</a> to take action.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999;">This is an automated notification from the Afife Town Traditional Council Portal.</p>
                    </div>
                `
            }
        });

        console.log(`Admin notification sent for type: ${type}`);
    } catch (error) {
        console.error("Error sending admin notification:", error);
    }
};
