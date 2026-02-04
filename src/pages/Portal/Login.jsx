import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Loader, ArrowLeft, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import afifeStreetView from '../../assets/afife_street_view.png';
import { sendOTP } from '../../services/notificationService';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

import { getAuthErrorMessage } from '../../utils/errorUtils';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Login, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && userProfile && step === 1) {
            // If already logged in but not in OTP step, 
            // we should technically decide if we want to force OTP or just redirect.
            // For security, if they just refreshed, they might need to re-verify OTP.
            // But let's handle the initial login flow first.
            if (userProfile.role === 'native' && userProfile.status === 'approved') {
                // navigate('/portal/dashboard');
            } else if (currentUser.email === 'afifetownweb@gmail.com') {
                navigate('/admin/dashboard');
            }
        }
    }, [currentUser, userProfile, navigate, step]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(email, password);

            // Check account status before proceeding to OTP
            const userDoc = await getDoc(doc(db, 'users', res.user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            if (!userData || userData.status !== 'approved') {
                // Account not approved, log them out immediately and show generic error
                await logout();
                setError('Invalid email and or password'); // Obfuscated error message
                return;
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otp);

            // Send OTP
            const success = await sendOTP(email, otp, userData.fullName || 'Afife Native');

            if (success) {
                setStep(2);
            } else {
                setError('Failed to send verification code. Please try again.');
            }
        } catch (err) {
            setError(getAuthErrorMessage(err));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (otpInput === generatedOtp) {
            sessionStorage.setItem('otp_verified', 'true');
            if (userProfile?.role === 'native') {
                navigate('/portal/dashboard');
            } else {
                navigate('/admin/dashboard');
            }
        } else {
            setError('Invalid verification code. Please check your email.');
            setLoading(false);
        }
    };

    const handleBackToLogin = async () => {
        setLoading(true);
        try {
            await logout();
            setStep(1);
            setOtpInput('');
            setGeneratedOtp('');
            setError('');
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-stretch transition-colors" style={{ backgroundColor: 'var(--bg-main)' }}>
            {/* Image Side */}
            <div className="hidden lg:block w-1/2 relative">
                <img
                    src={afifeStreetView}
                    alt="Afife Street View"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-afife-primary/80 flex flex-col justify-end p-12 text-white">
                    <h1 className="text-4xl font-heading font-bold mb-4">Welcome Home.</h1>
                    <p className="text-lg opacity-90">Access exclusive community services, updates and more through the official Afife Native Portal.</p>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-24 relative">
                <Link to="/" className="lg:absolute lg:top-8 lg:left-8 mb-8 lg:mb-0 self-start flex items-center gap-2 font-medium transition-colors hover:text-afife-primary" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={20} /> Back to Website
                </Link>

                <div className="w-full max-w-md mx-auto">
                    {step === 1 ? (
                        <>
                            <div className="mb-10 font-heading">
                                <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-main)' }}>Login</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Please sign in to your verified account.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
                                    <Lock size={16} /> {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border rounded-full focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 border rounded-full focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-afife-primary text-white py-4 rounded-full font-bold hover:bg-afife-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-afife-primary/30"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
                                </button>
                            </form>

                            <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                Don't have an account yet?{' '}
                                <Link to="/portal/register" className="text-afife-primary font-bold hover:underline">
                                    Register as a Native
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-10 font-heading">
                                <div className="w-16 h-16 bg-afife-primary/10 rounded-2xl flex items-center justify-center mb-6 text-afife-primary">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-main)' }}>Verify Identity</h2>
                                <p style={{ color: 'var(--text-muted)' }}>We've sent a 6-digit verification code to <span className="text-afife-primary font-bold">{email}</span></p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
                                    <Lock size={16} /> {error}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Verification Code</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-6 py-4 border rounded-full focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all text-center text-2xl font-black tracking-[0.5em]"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                        placeholder="000000"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-afife-primary text-white py-4 rounded-full font-bold hover:bg-afife-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-afife-primary/30"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : 'Verify & Access'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleBackToLogin}
                                    className="w-full py-4 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} /> Back to Login
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
