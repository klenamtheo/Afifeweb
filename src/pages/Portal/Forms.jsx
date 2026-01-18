
import { FileText, Download, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

const Forms = () => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    // Mock data for forms - in real app, fetch from Firestore or Storage
    const forms = [
        { id: 1, title: "Customary Land Registration", description: "Application form for registering family or stool lands.", size: "PDF", locked: false },
        { id: 2, title: "Building Permit Application", description: "Official request for construction or renovation within town limits.", size: "PDF", locked: true },
        { id: 3, title: "Scholarship Application 2026", description: "Education fund application for tertiary students.", size: "PDF", locked: false },
        { id: 4, title: "Market Stall Lease Agreement", description: "Standard agreement for market vendors.", size: "PDF", locked: false },
    ];

    const downloadPDF = (form) => {
        const doc = new jsPDF();

        // Add Header
        doc.setFontSize(22);
        doc.setTextColor(46, 125, 50); // Afife Primary Green
        doc.text("AFIFE TOWN PORTAL", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Official Community Document", 105, 28, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Form Title
        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text(form.title.toUpperCase(), 20, 50);

        // Description
        doc.setFontSize(12);
        doc.text("Description:", 20, 65);
        doc.setFont("helvetica", "normal");
        const splitDescription = doc.splitTextToSize(form.description, 170);
        doc.text(splitDescription, 20, 72);

        // Date
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Downloaded on: ${new Date().toLocaleDateString()}`, 20, 270);

        // Signature Area
        doc.setTextColor(0);
        doc.line(130, 250, 180, 250);
        doc.text("Official Stamp/Signature", 130, 255);

        // Save
        doc.save(`${form.title.toLowerCase().replace(/ /g, '_')}_form.pdf`);
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold" style={{ color: 'var(--text-main)' }}>Documents & Forms</h1>
                <p style={{ color: 'var(--text-muted)' }}>Download official forms. Some may require admin approval before access.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {forms.map(form => (
                    <div key={form.id} className="p-6 rounded-xl border flex items-start gap-4 hover:border-afife-primary/30 transition-colors group shadow-lg"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                        <div className={`p-4 rounded-lg flex-shrink-0 ${form.locked ? 'bg-black/10 text-gray-400' : 'bg-blue-500/10 text-blue-500'}`}>
                            {form.locked ? <Lock size={24} /> : <FileText size={24} />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold mb-1 group-hover:text-afife-primary transition-colors" style={{ color: 'var(--text-main)' }}>{form.title}</h3>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{form.description}</p>
                            {form.locked ? (
                                <button disabled className="text-xs font-bold text-gray-400 flex items-center gap-1 bg-black/10 px-3 py-1.5 rounded-full inline-flex cursor-not-allowed">
                                    <Lock size={12} /> Access Restricted
                                </button>
                            ) : (
                                <button
                                    onClick={() => downloadPDF(form)}
                                    className="text-xs font-bold text-blue-500 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-full inline-flex hover:bg-blue-500/20 transition-colors"
                                >
                                    <Download size={12} /> Download PDF ({form.size})
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default Forms;
