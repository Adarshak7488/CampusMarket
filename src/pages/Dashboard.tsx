import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ShoppingBag, MessageSquare, Heart, PlusCircle, LayoutDashboard, User as UserIcon, ChevronRight, Loader2, ArrowUpRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-center text-green-500 font-bold text-xs">
        <ArrowUpRight className="w-3 h-3 mr-1" />
        +12%
      </div>
    </div>
    <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [activeListings, setActiveListings] = useState<Product[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch active listings
      const qActive = query(
        collection(db, 'products'),
        where('sellerId', '==', user?.id),
        orderBy('createdAt', 'desc'),
        limit(4)
      );
      const activeSnap = await getDocs(qActive);
      setActiveListings(activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

      // Fetch saved items
      const qSaved = query(
        collection(db, 'products'),
        where('savedBy', 'array-contains', user?.id),
        limit(4)
      );
      const savedSnap = await getDocs(qSaved);
      setSavedItems(savedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-blue-600 font-black text-sm uppercase tracking-widest mb-3 block">Dashboard</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">Welcome, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 font-medium">Manage your items, conversations, and saved finds.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/sell" className="flex items-center gap-2 px-6 py-2.5 btn-primary text-sm shadow-md shadow-blue-100">
            <PlusCircle className="w-5 h-5" />
            <span>New Listing</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard title="Active Items" value={activeListings.length} icon={ShoppingBag} color="bg-blue-600" />
        <StatCard title="Total Saved" value={savedItems.length} icon={Heart} color="bg-pink-500" />
        <StatCard title="Messages" value="4" icon={MessageCircle} color="bg-indigo-500" />
        <StatCard title="Total Sold" value="$420" icon={PlusCircle} color="bg-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Active Listings Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Your Active Listings</h2>
            <Link to="/profile/me" className="text-sm font-bold text-blue-600 hover:underline flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {activeListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeListings.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[40px] border border-dashed border-slate-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-bold mb-6">You don't have any active listings.</p>
              <Link to="/sell" className="text-blue-600 font-black flex items-center gap-2 hover:bg-blue-50 px-6 py-3 rounded-2xl transition-colors">
                <PlusCircle className="w-5 h-5" /> Create your first listing
              </Link>
            </div>
          )}

          {/* Saved Items Section */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Saved for Later</h2>
              <Link to="/marketplace" className="text-sm font-bold text-blue-600 hover:underline flex items-center">
                Explore Marketplace <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {savedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {savedItems.map(item => (
                  <ProductCard key={item.id} product={item} isSaved={true} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-12 rounded-[40px] border border-white text-center">
                <p className="text-slate-400 font-bold">No saved items yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Edit Profile', icon: UserIcon, path: '/settings' },
                { label: 'Your Inbox', icon: MessageSquare, path: '/chats' },
                { label: 'Saved Items', icon: Heart, path: '/saved' },
                { label: 'Marketplace', icon: LayoutDashboard, path: '/marketplace' }
              ].map((action, i) => (
                <Link 
                  key={i} 
                  to={action.path}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{action.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Verification Badge */}
          <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <ShieldCheck className="w-12 h-12 mb-6 text-blue-200" />
            <h3 className="text-xl font-bold mb-3">Verified Student</h3>
            <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">
              Logged in via verified {user?.college} portal. Your trust score is excellent!
            </p>
            <div className="h-2 w-full bg-blue-500 rounded-full overflow-hidden">
              <div className="h-full w-[95%] bg-blue-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
