
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, AlertTriangle, Info } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    const icons = {
        danger: <AlertCircle className="text-red-500" size={32} />,
        warning: <AlertTriangle className="text-orange-500" size={32} />,
        info: <Info className="text-blue-500" size={32} />
    };

    const buttonStyles = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-orange-500 hover:bg-orange-600',
        info: 'bg-afife-primary hover:bg-afife-accent'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl p-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            <div className={`p-4 rounded-full mb-4 ${type === 'danger' ? 'bg-red-50' : type === 'warning' ? 'bg-orange-50' : 'bg-blue-50'}`}>
                                {icons[type]}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                {message}
                            </p>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 ${buttonStyles[type]}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
