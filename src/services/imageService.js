
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export const uploadToImgBB = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.error?.message || 'ImgBB upload failed');
        }
    } catch (error) {
        console.error('[imageService] ImgBB Upload Error:', error);
        throw error;
    }
};

export const uploadImage = async (file, folder) => {
    if (!file) return null;

    console.log(`[imageService] Preparing upload for ${file.name}`);

    // Try ImgBB first as it's the requested and more reliable free option
    if (IMGBB_API_KEY && IMGBB_API_KEY !== 'your_imgbb_api_key_here') {
        try {
            console.log(`[imageService] Attempting ImgBB upload...`);
            const url = await uploadToImgBB(file);
            if (url) return url;
        } catch (error) {
            console.warn(`[imageService] ImgBB upload failed, falling back to Firebase (if possible):`, error);
        }
    }

    // Fallback: Firebase Storage
    // NOTE: If you are on Spark plan, this will likely fail with permissions error 
    // if Storage is not enabled or configured.
    try {
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `${timestamp}_${sanitizedName}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);

        console.log(`[imageService] Starting uploadBytes to ${folder}/${fileName}...`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("[imageService] ERROR during upload fallback:", error);
        // Provide more helpful message for Spark plan users
        if (error.code === 'storage/unauthorized' || error.message?.includes('permission')) {
            throw new Error("Upload failed. ImgBB failed and Firebase Storage is unauthorized (Spark plan). Check your ImgBB API key.");
        }
        throw error;
    }
};
