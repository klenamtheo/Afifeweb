import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { sendAdminNotification } from '../services/notificationService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (user) {
                const docRef = doc(db, 'users', user.uid);
                unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        setUserProfile(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user profile:", error);
                    setUserProfile(null);
                    setLoading(false);
                });
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    // Auto-logout after 20 minutes of inactivity (admin only)
    useEffect(() => {
        if (!currentUser || !userProfile || userProfile.role !== 'admin') {
            return;
        }

        const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 minutes in milliseconds
        let inactivityTimer;

        const resetTimer = () => {
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
            }
            inactivityTimer = setTimeout(() => {
                console.log('Auto-logout due to inactivity');
                logout();
            }, INACTIVITY_LIMIT);
        };

        // Activity events to monitor
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        // Attach event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Initialize the timer
        resetTimer();

        // Cleanup
        return () => {
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [currentUser, userProfile]);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const registerNative = async (email, password, fullName, phoneNumber, location) => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
            uid: res.user.uid,
            email,
            fullName,
            phoneNumber,
            location,
            role: 'native',
            status: 'pending',
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', res.user.uid), userData);

        // Send admin notification
        await sendAdminNotification('registration', {
            message: `New native registration: ${fullName}`,
            userName: fullName,
            email: email,
            location: location,
            phoneNumber: phoneNumber
        });

        return res;
    }

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userProfile,
        login,
        registerNative,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
