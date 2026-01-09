import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Phone, MapPin, Tag, Loader } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const Marketplace = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'market'), orderBy('createdAt', 'desc'));

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 8000); // 8s safety timeout

        const unsubscribe = onSnapshot(q, (snapshot) => {
            clearTimeout(timeout);
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching market items:", error);
            clearTimeout(timeout);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const categories = ['All', 'Food', 'Crafts', 'Services', 'Other'];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.vendor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-afife-bg min-h-screen font-body">
            {/* Hero Section */}
            <section className="bg-afife-primary pt-32 pb-20 text-white text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-afife-secondary/20 border border-afife-secondary/50 text-afife-secondary text-sm font-bold mb-4 backdrop-blur-sm">PROMOTING LOCAL COMMERCE</span>
                    <h1 className="font-heading text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        Afife <span className="text-afife-secondary">Marketplace</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto mb-8">
                        Discover fresh farm produce, handmade crafts, and professional services from our community.
                    </p>
                </div>
            </section>

            {/* Search and Filter */}
            <section className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for yams, kente, or mechanics..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-afife-primary focus:ring-2 focus:ring-green-100 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-afife-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="container mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-afife-primary" size={40} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No items found</h3>
                        <p className="text-gray-400">Try adjusting your search or category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-50">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ShoppingBag size={40} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-afife-primary shadow-sm flex items-center gap-1">
                                        <Tag size={12} /> {product.category}
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-afife-secondary text-afife-text font-bold px-3 py-1 rounded-lg shadow-sm">₵{product.price}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-heading font-bold text-xl text-gray-800 mb-2">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-afife-primary">
                                                {product.vendor.charAt(0)}
                                            </div>
                                            <span>{product.vendor}</span>
                                        </div>
                                        <a href={`tel:${product.phone}`} className="flex items-center gap-2 text-afife-primary font-bold hover:underline">
                                            <Phone size={16} /> Contact
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Marketplace;
