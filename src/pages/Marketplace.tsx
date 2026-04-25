import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, Loader2, PackageX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = ['All', 'Textbooks', 'Electronics', 'Hostel Gear', 'Cycles', 'Calculators', 'Clothing', 'Other'];
const CONDITIONS = ['All', 'New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'recent'>('recent');

  useEffect(() => { fetchProducts(); }, [category, condition]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'products'), where('status', '==', 'active'));
      if (category !== 'All') q = query(q, where('category', '==', category));
      if (condition !== 'All') q = query(q, where('condition', '==', condition));
      const snap = await getDocs(q);
      let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      if (priceSort === 'recent') results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else if (priceSort === 'asc') results.sort((a, b) => a.price - b.price);
      else results.sort((a, b) => b.price - a.price);
      setProducts(results);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20" style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'rgba(120,20,20,0.08)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'rgba(60,40,0,0.08)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>MARKETPLACE</p>
            <h1 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Discover <em className="italic" style={{ color: 'rgba(255,255,255,0.3)' }}>deals.</em>
            </h1>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {filtered.length} items in the marketplace
            </p>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={priceSort}
              onChange={e => setPriceSort(e.target.value as any)}
              className="pl-4 pr-10 py-2.5 rounded-full text-sm outline-none appearance-none cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}
            >
              <option value="recent">Recently Added</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">

          {/* Sidebar */}
          <aside className="h-fit rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <section className="mb-7">
              <h3 className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>CATEGORIES</h3>
              <ul className="space-y-0.5">
                {CATEGORIES.map(cat => (
                  <li key={cat} onClick={() => setCategory(cat)}
                    className="px-3 py-2 rounded-xl text-sm cursor-pointer flex items-center justify-between transition-all"
                    style={{
                      background: category === cat ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: category === cat ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    }}
                    onMouseEnter={e => { if (category !== cat) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
                    onMouseLeave={e => { if (category !== cat) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
                  >
                    <span>{cat}</span>
                    {category === cat && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.6)' }} />}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>CONDITION</h3>
              <ul className="space-y-0.5">
                {CONDITIONS.map(cond => (
                  <li key={cond} onClick={() => setCondition(cond)}
                    className="px-3 py-2 rounded-xl text-sm cursor-pointer transition-all"
                    style={{
                      background: condition === cond ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: condition === cond ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    }}
                    onMouseEnter={e => { if (condition !== cond) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
                    onMouseLeave={e => { if (condition !== cond) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
                  >
                    {cond}
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          {/* Main */}
          <div>
            {/* Search */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search textbooks, electronics, furniture..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-5 py-3 rounded-full text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {loading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="rounded-3xl p-20 text-center flex flex-col items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <PackageX className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
                </div>
                <h3 className="text-lg font-light text-white mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>No items found</h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Try adjusting your filters or search keywords.
                </p>
                <button
                  onClick={() => { setCategory('All'); setCondition('All'); setSearch(''); }}
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = 'white'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
