import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Calendar, Tag, Loader, FileText } from 'lucide-react';

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const docRef = doc(db, 'news', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setArticle({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such document!");
                    navigate('/news'); // Redirect if not found
                }
            } catch (error) {
                console.error("Error fetching article:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-afife-bg flex justify-center items-center">
                <Loader className="animate-spin text-afife-primary" size={40} />
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="min-h-screen bg-afife-bg">
            {/* Header / Hero */}
            <div className={`relative ${article.imageUrl ? 'h-96' : 'h-64 bg-afife-primary'} w-full`}>
                {article.imageUrl && (
                    <>
                        <div className="absolute inset-0 bg-black/40 z-10"></div>
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                    </>
                )}
                <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-12">
                    <Link to="/news" className="text-white/80 hover:text-white flex items-center gap-2 mb-6 transition-colors w-fit">
                        <ArrowLeft size={20} /> Back to News
                    </Link>
                    <div className="flex items-center gap-4 text-white/90 mb-4 text-sm font-medium">
                        <span className="bg-afife-secondary text-afife-primary px-3 py-1 rounded-full font-bold">{article.category}</span>
                        <span className="flex items-center gap-1"><Calendar size={16} /> {article.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-heading font-bold text-white max-w-4xl">{article.title}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 -mt-8 relative z-30">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-4xl">
                    <p className="text-xl text-gray-500 font-medium mb-8 leading-relaxed border-l-4 border-afife-primary pl-4 italic">
                        {article.excerpt}
                    </p>

                    <div className="prose prose-lg prose-green max-w-none text-gray-700 whitespace-pre-line">
                        {article.content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
