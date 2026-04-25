import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Message, Chat, Product } from '../types';
import { Send, ArrowLeft, Loader2, ShoppingBag, ShieldCheck } from 'lucide-react';
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
    const chatRef = doc(db, 'chats', id);
    const unsubChat = onSnapshot(chatRef, async (snap) => {
      if (snap.exists()) {
        const chatData = { id: snap.id, ...snap.data() } as Chat;
        setChat(chatData);
        if (!product) {
          const prodDoc = await getDoc(doc(db, 'products', chatData.productId));
          if (prodDoc.exists()) setProduct({ id: prodDoc.id, ...prodDoc.data() } as Product);
        }
      } else { navigate('/chats'); }
    });

    const qMessages = query(collection(db, 'chats', id, 'messages'), orderBy('timestamp', 'asc'));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => { unsubChat(); unsubMessages(); };
  }, [id, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chat || !id) return;
    const text = newMessage;
    setNewMessage('');
    const receiverId = chat.participants.find(p => p !== user.id) || '';
    try {
      await addDoc(collection(db, 'chats', id, 'messages'), {
        chatId: id, senderId: user.id, receiverId, text,
        timestamp: new Date().toISOString()
      });
      await updateDoc(doc(db, 'chats', id), {
        lastMessage: text, lastTimestamp: new Date().toISOString()
      });
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
    </div>
  );

  return (
    <div className="h-screen flex flex-col" style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'rgba(160,30,30,0.12)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(120,50,0,0.1)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-20 pb-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between p-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/chats')}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'white'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                {chat?.productTitle.charAt(0)}
              </div>
              <div>
                <h2 className="text-sm font-medium text-white leading-none mb-1">{chat?.productTitle}</h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(100,220,150,0.8)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Online now</span>
                </div>
              </div>
            </div>
            <Link to={`/product/${chat?.productId}`}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}>
              <ShoppingBag className="w-3 h-3" />
              View Item
            </Link>
          </div>
        </div>
      </div>

      {/* Product mini card */}
      <AnimatePresence>
        {product && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 px-4 pb-3"
          >
            <div className="max-w-3xl mx-auto">
              <div className="p-3 rounded-2xl flex items-center justify-between overflow-hidden relative"
                style={{ background: 'rgba(180,60,20,0.15)', border: '1px solid rgba(200,80,20,0.2)' }}>
                <div className="absolute inset-0 blur-[40px]" style={{ background: 'rgba(160,40,10,0.1)' }} />
                <div className="flex items-center gap-3 relative z-10">
                  <img src={product.images[0]} className="w-10 h-10 rounded-xl object-cover"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }} alt="" />
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(255,180,100,0.6)', letterSpacing: '0.08em' }}>ACTIVE NEGOTIATION</p>
                    <p className="text-sm font-medium text-white">₹{product.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full relative z-10"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-xs">Safe Trade</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-4 py-6">
          {/* Date chip */}
          <div className="flex justify-center">
            <div className="px-4 py-1.5 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
              Trade initiated {format(new Date(chat?.createdAt || Date.now()), 'PPP')}
            </div>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn("flex flex-col max-w-[75%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <div className="px-4 py-3 rounded-2xl text-sm"
                  style={isMe ? {
                    background: 'rgba(255,255,255,0.9)',
                    color: '#0A0A0A',
                    borderBottomRightRadius: '6px',
                  } : {
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderBottomLeftRadius: '6px',
                  }}>
                  {msg.text}
                </div>
                <span className="text-xs mt-1.5 px-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {format(new Date(msg.timestamp), 'p')}
                </span>
              </motion.div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 px-4 pb-6 pt-3"
        style={{ background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-2xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <button type="submit" disabled={!newMessage.trim()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: newMessage.trim() ? 'white' : 'rgba(255,255,255,0.08)',
                color: newMessage.trim() ? 'black' : 'rgba(255,255,255,0.2)',
              }}>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Messages restricted to {user?.college}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
