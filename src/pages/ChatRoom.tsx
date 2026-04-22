import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Message, Chat, Product } from '../types';
import { Send, ArrowLeft, Loader2, Info, ShoppingBag, ShieldCheck, User } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const ChatRoom = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;

    // Fetch chat metadata
    const chatRef = doc(db, 'chats', id);
    const unsubChat = onSnapshot(chatRef, async (snap) => {
      if (snap.exists()) {
        const chatData = { id: snap.id, ...snap.data() } as Chat;
        setChat(chatData);
        
        // Fetch product info if not already fetched
        if (!product) {
          const prodDoc = await getDoc(doc(db, 'products', chatData.productId));
          if (prodDoc.exists()) {
            setProduct({ id: prodDoc.id, ...prodDoc.data() } as Product);
          }
        }
      } else {
        navigate('/chats');
      }
    });

    // Sub to messages
    const qMessages = query(
      collection(db, 'chats', id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [id, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chat || !id) return;

    const text = newMessage;
    setNewMessage('');
    
    const receiverId = chat.participants.find(p => p !== user.id) || '';

    try {
      await addDoc(collection(db, 'chats', id, 'messages'), {
        chatId: id,
        senderId: user.id,
        receiverId,
        text,
        timestamp: new Date().toISOString()
      });

      await updateDoc(doc(db, 'chats', id), {
        lastMessage: text,
        lastTimestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col pt-4">
      {/* Chat Header */}
      <div className="max-w-4xl w-full mx-auto px-4 mb-4">
        <div className="bg-white rounded-[32px] border border-slate-100 p-4 shadow-lg shadow-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/chats')} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-500">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black">
               {chat?.productTitle.charAt(0)}
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 leading-none mb-1">{chat?.productTitle}</h2>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Online now</span>
                </div>
              </div>
            </div>
          </div>
          <Link to={`/product/${chat?.productId}`} className="hidden sm:flex items-center gap-2 px-6 py-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-xs font-bold text-slate-600 border border-slate-100">
            <ShoppingBag className="w-4 h-4" />
            <span>View Item</span>
          </Link>
        </div>
      </div>

      {/* Product Mini Info */}
      <AnimatePresence>
        {product && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl w-full mx-auto px-4 mb-4"
          >
            <div className="bg-blue-600 rounded-3xl p-4 text-white flex items-center justify-between shadow-xl shadow-blue-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="flex items-center gap-4 relative z-10">
                <img src={product.images[0]} className="w-12 h-12 rounded-xl object-cover border-2 border-blue-400" alt="" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 leading-none mb-1">Active Negotiation</p>
                  <p className="font-bold text-sm leading-none">${product.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Safe Trade</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
          <div className="flex justify-center py-8">
            <div className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Trade initiated {format(new Date(chat?.createdAt || Date.now()), 'PPP')}
            </div>
          </div>

          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.id;
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-5 py-3.5 rounded-[24px] font-medium text-sm transition-all",
                  isMe 
                    ? "bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-100" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm"
                )}>
                  {msg.text}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 px-1">
                  {format(new Date(msg.timestamp), 'p')}
                </span>
              </motion.div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full pl-6 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-medium text-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-14 h-14 bg-blue-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <div className="mt-3 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
               <ShieldCheck className="w-3 h-3" />
               Your messages are encrypted and restricted to {user?.college}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
