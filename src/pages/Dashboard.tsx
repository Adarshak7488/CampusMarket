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

const StatCard = ({ title, value, icon: Icon, i }: { title: string, value: string | number, icon: any, i: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.1 }}
    className="p-6 rounded-2xl relative overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <Icon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
      </div>
      <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(100,220,150,0.8)' }}>
        <ArrowUpRight className="w-3 h-3" />
        +12%
      </div>
    </div>
    <div className="text-3xl font-light text-white mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>{value}</div>
    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>{title.toUpperCase()}</div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [activeListings, setActiveListings] = useState<Product[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const qActive = query(collection(db, 'products'), where('sellerId', '==', user?.id), orderBy('createdAt', 'desc'), limit(4));
      const activeSnap = await getDocs(qActive);
      setActiveListings(activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

      const qSaved = query(collection(db, 'products'), where('savedBy', 'array-contains', user?.id), limit(4));
      const savedSnap = await getDocs(qSaved);
      setSavedItems(savedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center" style={{ background: '#080808' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-20" style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-0 overflow-hidden">
       <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px]" style={{ background: 'rgba(180,30,30,0.18)' }} />
       <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] rounded-full blur-[90px]" style={{ background: 'rgba(140,60,0,0.15)' }} />
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[110px]" style={{ background: 'rgba(160,40,10,0.12)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>DASHBOARD</p>
            <h1 className="text-4xl md:text-5xl font-light text-white mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Welcome, <em className="italic" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.name?.split(' ')[0]}.</em>
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Manage your items, conversations, and saved finds.</p>
          </motion.div>
          <Link to="/sell"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all"
            style={{ background: 'white', color: 'black' }}
          >
            <PlusCircle className="w-4 h-4" />
            New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard title="Active Items" value={activeListings.length} icon={ShoppingBag} i={0} />
          <StatCard title="Total Saved" value={savedItems.length} icon={Heart} i={1} />
          <StatCard title="Messages" value="4" icon={MessageCircle} i={2} />
          <StatCard title="Total Sold" value="₹420" icon={PlusCircle} i={3} />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* Main */}
          <div className="lg:col-span-2 space-y-12">

            {/* Active Listings */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>Your active listings</h2>
                <Link to="/profile/me" className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}>
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {activeListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {activeListings.map(item => <ProductCard key={item.id} product={item} />)}
                </div>
              ) : (
                <div className="p-12 rounded-3xl text-center flex flex-col items-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <ShoppingBag className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.15)' }} />
                  </div>
                  <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>No active listings yet.</p>
                  <Link to="/sell" className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'white'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}>
                    <PlusCircle className="w-4 h-4" /> Create your first listing
                  </Link>
                </div>
              )}
            </div>

            {/* Saved Items */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>Saved for later</h2>
                <Link to="/marketplace" className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}>
                  Explore <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              {savedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {savedItems.map(item => <ProductCard key={item.id} product={item} isSaved={true} />)}
                </div>
              ) : (
                <div className="p-10 rounded-3xl text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No saved items yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-light text-white mb-6" style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px' }}>Quick actions</h3>
              <div className="space-y-1">
                {[
                  { label: 'Edit Profile', icon: UserIcon, path: '/settings' },
                  { label: 'Your Inbox', icon: MessageSquare, path: '/chats' },
                  { label: 'Saved Items', icon: Heart, path: '/saved' },
                  { label: 'Marketplace', icon: LayoutDashboard, path: '/marketplace' },
                ].map((action, i) => (
                  <Link key={i} to={action.path}
                    className="flex items-center justify-between p-3 rounded-xl transition-all group"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{action.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Verified badge */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px]" style={{ background: 'rgba(100,200,150,0.08)' }} />
              <ShieldCheck className="w-8 h-8 mb-4" style={{ color: 'rgba(100,220,150,0.6)' }} />
              <h3 className="text-base font-light text-white mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>Verified student</h3>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {user?.college} portal verified. Your trust score is excellent!
              </p>
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: '95%', background: 'rgba(100,220,150,0.5)' }} />
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(100,220,150,0.5)' }}>95% trust score</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
