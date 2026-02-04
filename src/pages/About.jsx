import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="bg-afife-bg min-h-screen">
            {/* Hero Header */}
            <section className="bg-afife-primary py-20 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-heading text-4xl md:text-5xl font-bold mb-4"
                    >
                        Our Journey & Heritage
                    </motion.h1>
                    <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                        Discover the origins, the people and the enduring spirit of Afife.
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1599908680371-b0e79dc0248c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            </section>

            {/* Origin Story */}
            <section className="py-20 container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="md:w-1/2"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80"
                            alt="Historical Landscape"
                            className="rounded-2xl shadow-xl w-full"
                        />
                    </motion.div>
                    <div className="md:w-1/2">
                        <span className="text-afife-secondary font-bold uppercase tracking-wider text-sm mb-2 block">The Origins</span>
                        <h2 className="font-heading text-3xl font-bold text-afife-accent mb-6">A Legacy of Resilience</h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                The story of Afife is one of bravery, migration, and settlement.
                                Legend has it that our ancestors migrated from Notsie, seeking freedom and fertile lands.
                                Led by visionary elders, they settled in this rich landscape, protected by the divinity of the land.
                            </p>
                            <p>
                                "Afife" translates to a place of peace and white dust, symbolizing the purity of our intentions
                                and the resilience of our spirit. Over centuries, we have grown from a small settlement
                                into a thriving traditional area, renowned for our agriculture and cultural vibrancy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cultural Values */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-heading text-3xl font-bold text-afife-accent mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <h3 className="font-bold text-xl mb-3 text-afife-primary">Unity</h3>
                            <p className="text-gray-600">We believe in the strength of togetherness. "Afife nya, wo bo na" - In Afife, we are one.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <h3 className="font-bold text-xl mb-3 text-afife-primary">Tradition</h3>
                            <p className="text-gray-600">Our customs are our compass. We honor our ancestors through festivals like Nyiglaza and daily reverence.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-xl">
                            <h3 className="font-bold text-xl mb-3 text-afife-primary">Progress</h3>
                            <p className="text-gray-600">While rooted in the past, we embrace education and development for a prosperous future.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
