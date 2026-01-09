
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadImage = async (file, folder) => {
    if (!file) return null;

    console.log(`[imageService] Preparing upload for ${file.name} to folder ${folder}`);
    // Create a unique filename to prevent overwrites and organizing by folder
    const timestamp = Date.now();
    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    try {
        console.log(`[imageService] Starting uploadBytes to ${folder}/${fileName}...`);
        const snapshot = await uploadBytes(storageRef, file);
        console.log(`[imageService] Upload complete, fetching download URL...`);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`[imageService] Got download URL: ${downloadURL}`);
        return downloadURL;
    } catch (error) {
        console.error("[imageService] ERROR during upload:", error);
        throw error;
    }
};
