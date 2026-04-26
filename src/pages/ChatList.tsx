import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Chat } from '../types';
import { ShoppingBag, Clock, Search, ChevronRight, Loader2, MessageCircleX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

const ChatList = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.id),
      orderBy('lastTimestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const filteredChats = chats.filter(c =>
    c.productTitle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-20 relative overflow-hidden"
      style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[100px]" style={{ background: 'rgba(180,30,30,0.18)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[90px]" style={{ background: 'rgba(140,60,0,0.15)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[110px]" style={{ background: 'rgba(160,40,10,0.12)' }} />
      </div>

      {/* Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] -z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>MESSAGES</p>
            <h1 className="text-4xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
              My <em className="italic" style={{ color: 'rgba(255,255,255,0.35)' }}>chats.</em>
            </h1>
            <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Coordinate your campus trades securely.
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
        </motion.div>

        {/* Chat list */}
        <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {filteredChats.length > 0 ? (
            <div>
              {filteredChats.map((chat, i) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/chat/${chat.id}`}
                    className="flex items-center gap-4 p-5 transition-all group"
                    style={{ borderBottom: i < filteredChats.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center text-base font-medium flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {chat.productTitle.charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-medium truncate pr-4 transition-colors"
                          style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {chat.productTitle}
                        </h3>
                        <div className="flex items-center gap-1 text-xs whitespace-nowrap flex-shrink-0"
                          style={{ color: 'rgba(255,255,255,0.2)' }}>
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(chat.lastTimestamp))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShoppingBag className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Item Inquiry</span>
                      </div>
                      <p className="text-xs line-clamp-1 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        "{chat.lastMessage}"
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                      style={{ color: 'rgba(255,255,255,0.15)' }} />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MessageCircleX className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.15)' }} />
              </div>
              <h3 className="text-lg font-light text-white mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
                No messages yet
              </h3>
              <p className="text-sm mb-8 max-w-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Conversations with buyers or sellers will appear here once you start chatting.
              </p>
              <Link to="/marketplace"
                className="px-6 py-3 rounded-full text-sm transition-all"
                style={{ background: 'white', color: 'black' }}>
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
