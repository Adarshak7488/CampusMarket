import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Chat } from '../types';
import { MessageSquare, ShoppingBag, Clock, Search, ChevronRight, Loader2, MessageCircleX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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
      const chatData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(chatData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const filteredChats = chats.filter(c => 
    c.productTitle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">My Messages</h1>
          <p className="text-slate-500 font-medium">Coordinate your campus trades securely.</p>
        </div>
        
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {filteredChats.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filteredChats.map((chat) => (
              <Link 
                key={chat.id} 
                to={`/chat/${chat.id}`}
                className="flex items-center gap-5 p-6 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex flex-shrink-0 items-center justify-center text-blue-600 font-black text-xl border border-blue-200">
                  {chat.productTitle.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 truncate pr-4 group-hover:text-blue-600 transition-colors">
                      {chat.productTitle}
                    </h3>
                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(chat.lastTimestamp))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingBag className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 truncate">Item Inquiry</span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1 font-medium italic">
                    "{chat.lastMessage}"
                  </p>
                </div>
                
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <MessageCircleX className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No messages yet</h3>
            <p className="text-slate-500 max-w-xs font-medium">Conversations with buyers or sellers will appear here once you start chatting.</p>
            <Link to="/marketplace" className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
               Browse Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
