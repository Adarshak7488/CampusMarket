import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../lib/utils';
import { Search, Filter, SlidersHorizontal, Loader2, PackageX } from 'lucide-react';
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

  useEffect(() => {
    fetchProducts();
  }, [category, condition]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'products'), where('status', '==', 'active'));

      if (category !== 'All') {
        q = query(q, where('category', '==', category));
      }

      if (condition !== 'All') {
        q = query(q, where('condition', '==', condition));
      }

      // Note: Firestore requires indexes for complex ordering with where
      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Client side sorting for simplicity if index not present
      if (priceSort === 'recent') {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (priceSort === 'asc') {
        results.sort((a, b) => a.price - b.price);
      } else {
        results.sort((a, b) => b.price - a.price);
      }

      setProducts(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Discover Deals</h1>
          <p className="text-slate-500 text-sm mt-1">Found {filteredProducts.length} items in the marketplace</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select 
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none appearance-none pr-10 cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400">
               <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[256px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-white border border-slate-200 p-6 flex flex-col gap-8 shadow-sm rounded-xl h-fit">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h3>
            <ul className="space-y-1">
              {CATEGORIES.map(cat => (
                <li
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-between transition-all",
                    category === cat 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-700 hover:bg-blue-50/50 hover:text-blue-600"
                  )}
                >
                  <span>{cat}</span>
                  {category === cat && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </li>
              ))}
            </ul>
          </section>

          <section>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Condition</h3>
             <ul className="space-y-1">
               {CONDITIONS.map(cond => (
                 <li
                    key={cond}
                    onClick={() => setCondition(cond)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium cursor-pointer flex items-center justify-between transition-all",
                      condition === cond 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-slate-700 hover:bg-blue-50/50 hover:text-blue-600"
                    )}
                  >
                    <span>{cond}</span>
                  </li>
               ))}
             </ul>
          </section>

          <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
            <p className="text-xs text-slate-500">Campus Trust Program</p>
            <button className="mt-2 text-xs font-bold text-blue-600 underline">Learn More</button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="min-h-[400px]">
          {/* Main search bar moved to header style as per design */}
          <div className="relative mb-8 max-w-xl">
             <input 
                type="text" 
                placeholder="Search textbooks, electronics, furniture..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full py-2.5 px-6 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all shadow-sm"
             />
             <div className="absolute right-4 top-2.5 text-slate-400">
                <Search className="w-5 h-5" />
             </div>
          </div>
          {loading ? (
            <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <PackageX className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No items found</h3>
              <p className="text-slate-500 max-w-xs font-medium">Try adjusting your filters or search keywords to find what you're looking for.</p>
              <button 
                onClick={() => { setCategory('All'); setCondition('All'); setSearch(''); }}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
