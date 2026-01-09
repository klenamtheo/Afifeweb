import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-afife-accent text-white pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-afife-secondary rounded-md flex items-center justify-center">
                                <span className="text-afife-accent font-heading font-bold text-lg">A</span>
                            </div>
                            <span className="font-heading font-bold text-xl tracking-tight">Afife<span className="text-afife-secondary">Town</span></span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            A comprehensive portal for the people of Afife. Celebrating our heritage, empowering our future, and connecting our community globally.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-afife-secondary hover:text-white transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-afife-secondary hover:text-white transition-all">
                                <Twitter size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-afife-secondary hover:text-white transition-all">
                                <Instagram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-heading font-semibold text-lg mb-4 text-afife-secondary">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li><Link to="/about" className="hover:text-white transition-colors">About Afife</Link></li>
                            <li><Link to="/council" className="hover:text-white transition-colors">Traditional Council</Link></li>
                            <li><Link to="/festival" className="hover:text-white transition-colors">Nyigbla Festival</Link></li>
                            <li><Link to="/news" className="hover:text-white transition-colors">Town News</Link></li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="font-heading font-semibold text-lg mb-4 text-afife-secondary">Community</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                            <li><Link to="/skills" className="hover:text-white transition-colors">Skills Board</Link></li>
                            <li><Link to="/report" className="hover:text-white transition-colors">Report Issue</Link></li>
                            <li><Link to="/donate" className="hover:text-white transition-colors">Donate</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-heading font-semibold text-lg mb-4 text-afife-secondary">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-slate-300">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-afife-secondary mt-0.5" />
                                <span>Afife Traditional Area,<br />Volta Region, Ghana</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-afife-secondary" />
                                <span>+233 54 27 7605</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-afife-secondary" />
                                <span>afifetownweb@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Afife Town Portal. All rights reserved.</p>
                    <br /> Built by KLENAMdev
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
