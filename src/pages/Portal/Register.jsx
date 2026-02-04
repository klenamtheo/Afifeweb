import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, Loader, ArrowLeft, ShieldCheck, MapPin, Phone, Eye, EyeOff } from 'lucide-react';
import afifeStreetView from '../../assets/afife_street_view.png';
import { getAuthErrorMessage } from '../../utils/errorUtils';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { registerNative } = useAuth();
    const navigate = useNavigate();

    const handleFullNameChange = (e) => {
        const value = e.target.value;
        if (/[^a-zA-Z\s]/.test(value)) {
            setError('Full Name should only contain letters and spaces.');
        } else {
            setError('');
            setFullName(value);
        }
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        // Only allow numbers and limit to 10 digits
        if (/[^0-9]/.test(value)) return;
        if (value.length > 10) return;

        setPhoneNumber(value);
        if (value.length > 0 && value.length !== 10) {
            setError('Phone number must be exactly 10 digits.');
        } else {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        if (phoneNumber.length !== 10) {
            return setError('Phone number must be exactly 10 digits');
        }

        setLoading(true);

        try {
            await registerNative(email, password, fullName, phoneNumber, location);
            navigate('/portal/dashboard');
        } catch (err) {
            setError(getAuthErrorMessage(err));
            console.error(err);
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
                    <div className="mb-6 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-4xl font-heading font-bold mb-4">Join the Digital Community.</h1>
                    <p className="text-lg opacity-90">Register to connect with local leadership, access services, and stay informed about Afife's development.</p>
                </div>
            </div>

            {/* Form Side */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-24 relative">
                <Link to="/" className="lg:absolute lg:top-8 lg:left-8 mb-8 lg:mb-0 self-start flex items-center gap-2 font-medium transition-colors hover:text-afife-primary" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft size={20} /> Back to Website
                </Link>

                <div className="w-full max-w-md mx-auto">
                    <div className="mb-10 font-heading">
                        <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-main)' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Sign up for native access. Admin approval required.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 animate-pulse">
                            <Lock size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={handleFullNameChange}
                                    className="w-full pl-10 pr-4 py-3 border rounded-full focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                    <Phone size={20} />
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                    className="w-full pl-10 pr-4 py-3 border rounded-full focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    placeholder="024 123 4567"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Location</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                    <MapPin size={20} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border rounded-full focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    placeholder="House No, Landmark, or Street Name"
                                />
                            </div>
                            <p className="text-xs mt-1 ml-1" style={{ color: 'var(--text-muted)' }}>Please enter your exact house location in the town.</p>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl mb-6 text-xs text-yellow-800 flex gap-3">
                            <ShieldCheck size={18} className="shrink-0 text-yellow-600" />
                            <div>
                                <p className="font-bold mb-1">Important: Verification Required</p>
                                <p>The email you provide below will be used to send a **6-digit verification code (OTP)** every time you attempt to log in. Please ensure it is a valid email you have access to.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Email Address</label>
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
                            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Password</label>
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
                                    placeholder="Minimum 6 characters"
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

                        <div>
                            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border rounded-full focus:ring-2 focus:ring-afife-primary/20 focus:border-afife-primary outline-none transition-all"
                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    placeholder="Match your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-afife-primary text-white py-3 rounded-full font-bold hover:bg-afife-primary/90 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-afife-primary/30"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/portal/login" className="text-afife-primary font-bold hover:underline">
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
