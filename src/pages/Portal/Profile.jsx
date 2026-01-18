import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Mail, Phone, MapPin, Camera, Moon, Sun, Loader, Save, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { getAuthErrorMessage } from '../../utils/errorUtils';
import { motion } from 'framer-motion';
import { logActivity } from '../../utils/activityLogger';

const Profile = () => {
    const { userProfile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const [theme, setTheme] = useState(userProfile?.theme || 'light');

    // Sync theme if it changes from AuthContext
    useEffect(() => {
        if (userProfile?.theme) {
            setTheme(userProfile.theme);
        }
    }, [userProfile?.theme]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `profiles/${userProfile.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateDoc(doc(db, 'users', userProfile.uid), {
                photoURL: downloadURL
            });

            // Note: userProfile in AuthContext should update automatically via onSnapshot
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setUploading(false);
        }
    };

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { currentUser } = useAuth(); // Needed for reauth

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setSaving(true);
        try {
            // Re-authenticate
            const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, passwordData.newPassword);

            // Log activity
            await logActivity(currentUser.uid, userProfile.fullName, 'Changed account password', 'security');

            setPasswordSuccess("Password updated successfully");
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordError(getAuthErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleThemeToggle = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await updateDoc(doc(db, 'users', userProfile.uid), {
                theme: newTheme
            });
        } catch (error) {
            console.error("Error updating theme:", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Profile Settings</h1>
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Manage your account information and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Avatar and Theme */}
                <div className="space-y-8">
                    <div className="p-6 md:p-8 rounded-[2.5rem] border flex flex-col items-center shadow-lg transition-colors"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 shadow-inner flex items-center justify-center transition-colors"
                                style={{ backgroundColor: 'var(--bg-main)', borderColor: 'rgba(46, 125, 50, 0.1)' }}>
                                {userProfile?.photoURL ? (
                                    <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-gray-300" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-afife-primary text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-all border-4 border-white"
                                disabled={uploading}
                            >
                                {uploading ? <Loader className="animate-spin" size={18} /> : <Camera size={18} />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                        <h2 className="mt-6 text-xl font-bold" style={{ color: 'var(--text-main)' }}>{userProfile?.fullName}</h2>
                        <p className="text-xs font-black text-afife-primary uppercase tracking-[0.2em] mt-1">Native Citizen</p>
                    </div>

                    <div className="p-6 rounded-[2.5rem] border shadow-lg transition-colors"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Preferences</h3>
                        <button
                            onClick={handleThemeToggle}
                            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-indigo-900/40 text-indigo-400' : 'bg-orange-100 text-orange-600'}`}>
                                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                </div>
                                <span className="font-bold" style={{ color: 'var(--text-bold)' }}>Display Theme</span>
                            </div>
                            <span className="text-xs font-black text-afife-primary uppercase tracking-widest">{theme}</span>
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="p-6 md:p-10 rounded-[2.5rem] border shadow-lg transition-colors"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <h3 className="text-lg font-black tracking-tight mb-8" style={{ color: 'var(--text-main)' }}>Personal Details</h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                                        <User size={18} className="text-afife-primary/50" />
                                        <span className="font-bold">{userProfile?.fullName}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                                        <Mail size={18} className="text-afife-primary/50" />
                                        <span className="font-bold">{userProfile?.email}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                                        <Phone size={18} className="text-afife-primary/50" />
                                        <span className="font-bold">{userProfile?.phoneNumber || 'Not provided'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Location</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl border transition-colors"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
                                        <MapPin size={18} className="text-afife-primary/50" />
                                        <span className="font-bold">{userProfile?.location || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="p-6 rounded-3xl border transition-colors"
                                    style={{ backgroundColor: 'rgba(46, 125, 50, 0.05)', borderColor: 'rgba(46, 125, 50, 0.1)' }}>
                                    <div className="flex gap-4">
                                        <div className="bg-afife-primary/10 p-2 rounded-xl h-fit">
                                            <CheckCircle size={20} className="text-afife-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Verified Citizen Account</p>
                                            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                                Your account information is securely stored. Some basic details like your phone and location are visible to council administrators for permit processing.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="mt-8 p-6 md:p-10 rounded-[2.5rem] border shadow-lg transition-colors"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <h3 className="text-lg font-black tracking-tight mb-8" style={{ color: 'var(--text-main)' }}>Security Settings</h3>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                                <div className="flex items-center gap-3 p-4 rounded-2xl border transition-colors relative"
                                    style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                                    <Lock size={18} className="text-afife-primary/50" />
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="bg-transparent w-full outline-none font-bold placeholder-gray-400 pr-10"
                                        placeholder="Enter current password"
                                        style={{ color: 'var(--text-main)' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 text-gray-400 hover:text-afife-primary transition-colors"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl border transition-colors relative"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                                        <Lock size={18} className="text-afife-primary/50" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="bg-transparent w-full outline-none font-bold placeholder-gray-400 pr-10"
                                            placeholder="Min. 6 characters"
                                            style={{ color: 'var(--text-main)' }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 text-gray-400 hover:text-afife-primary transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl border transition-colors relative"
                                        style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                                        <Lock size={18} className="text-afife-primary/50" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="bg-transparent w-full outline-none font-bold placeholder-gray-400 pr-10"
                                            placeholder="Confirm new password"
                                            style={{ color: 'var(--text-main)' }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 text-gray-400 hover:text-afife-primary transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {passwordError && (
                                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="p-4 rounded-xl bg-green-50 text-green-600 text-sm font-bold border border-green-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-afife-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                >
                                    {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
