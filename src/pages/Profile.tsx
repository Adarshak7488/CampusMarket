import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Star, MapPin, Calendar, ShieldCheck, ShoppingBag, Loader2, PackageX, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProfileData(id);
  }, [id]);

  const fetchProfileData = async (userId: string) => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setProfile({ id: userDoc.id, ...userDoc.data() } as User);
        
        // Fetch user's listings
        const q = query(
          collection(db, 'products'),
          where('sellerId', '==', userId),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        );
        const listingSnap = await getDocs(q);
        setListings(listingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  if (!profile) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-slate-800">User not found</h2>
      <Link to="/marketplace" className="mt-4 inline-block text-blue-600 font-bold hover:underline">Back to Marketplace</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="bg-white rounded-[48px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40 mb-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -mr-48 -mt-48 -z-10" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative">
            <img 
              src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
              alt={profile.name}
              className="w-40 h-40 rounded-full border-8 border-white shadow-2xl object-cover bg-slate-50"
            />
            <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full border-4 border-white p-1.5 shadow-lg">
              <CheckCircle2 className="text-white w-6 h-6" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-4xl font-black text-slate-900 leading-tight">{profile.name}</h1>
              <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100">
                <ShieldCheck className="w-3 h-3" /> Verified Student
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 font-bold mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>{profile.college}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span>Joined {format(new Date(profile.joinedAt), 'MMMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <span className="text-slate-900 font-black tracking-tight">{profile.rating || '5.0'}</span>
                <span className="text-slate-400 text-sm">(12 reviews)</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-8 py-4 bg-slate-50 rounded-3xl border border-slate-100 min-w-[140px] text-center">
                <div className="text-3xl font-black text-slate-900 mb-1">{listings.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Listings</div>
              </div>
              <div className="px-8 py-4 bg-slate-50 rounded-3xl border border-slate-100 min-w-[140px] text-center">
                <div className="text-3xl font-black text-slate-900 mb-1">24</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Items Sold</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Listings Grid */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900">Current Listings</h2>
          <div className="h-px flex-1 bg-slate-100 mx-8 hidden md:block" />
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4" /> 
            {listings.length} Items Available
          </div>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listings.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] border border-slate-100 p-24 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-8">
              <PackageX className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No active listings</h3>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">This student hasn't listed any items for sale at the moment. Check back later!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
