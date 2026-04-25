import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Product, User } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { ShieldCheck, MapPin, Clock, Heart, MessageSquare, AlertTriangle, ArrowLeft, Loader2, Star, CheckCircle2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

const ParallaxSection = ({ children, speed = 0.3 }: { children: React.ReactNode, speed?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40 * speed, -40 * speed]);
  const smoothY = useSpring(y, { stiffness: 80, damping: 25 });
  return <motion.div ref={ref} style={{ y: smoothY }}>{children}</motion.div>;
};

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => { if (id) fetchProductData(id); }, [id, user]);

  const fetchProductData = async (productId: string) => {
    setLoading(true);
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        const data = { id: productDoc.id, ...productDoc.data() } as Product;
        setProduct(data);
        setIsSaved(data.savedBy?.includes(user?.id || ''));
        const sellerDoc = await getDoc(doc(db, 'users', data.sellerId));
        if (sellerDoc.exists()) setSeller({ id: sellerDoc.id, ...sellerDoc.data() } as User);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!user || !product) return navigate('/login');
    setIsSaved(!isSaved);
    try {
      await updateDoc(doc(db, 'products', product.id), {
        savedBy: isSaved ? arrayRemove(user.id) : arrayUnion(user.id)
      });
    } catch { setIsSaved(isSaved); }
  };

  const handleContactSeller = async () => {
    if (!user || !product) return navigate('/login');
    if (user.id === product.sellerId) return;
    setChatLoading(true);
    try {
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.id), where('productId', '==', product.id));
      const snap = await getDocs(q);
      let chatId = '';
      const existing = snap.docs.find(d => d.data().participants.includes(product.sellerId));
      if (existing) { chatId = existing.id; }
      else {
        const newChat = await addDoc(collection(db, 'chats'), {
          participants: [user.id, product.sellerId],
          productId: product.id, productTitle: product.title,
          lastMessage: `Interested in your listing: ${product.title}`,
          lastTimestamp: new Date().toISOString(), createdAt: new Date().toISOString()
        });
        chatId = newChat.id;
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          chatId, senderId: user.id, receiverId: product.sellerId,
          text: `Hi! I'm interested in "${product.title}". Is it still available?`,
          timestamp: new Date().toISOString()
        });
      }
      navigate(`/chat/${chatId}`);
    } catch (err) { console.error(err); }
    finally { setChatLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'rgba(255,255,255,0.3)' }} />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#080808' }}>
      <h2 className="text-xl font-light text-white mb-4">Listing not found</h2>
      <Link to="/marketplace" className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Back to Marketplace</Link>
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
        <div className="absolute top-3/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[110px]" style={{ background: 'rgba(160,40,10,0.12)' }} />
      </div>

      {/* Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] -z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-10 text-sm transition-colors group"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Images */}
          <ParallaxSection speed={0.15}>
            <div className="space-y-4 sticky top-24">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden relative"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <motion.img key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  src={product.images[activeImage]} alt={product.title}
                  className="w-full h-full object-cover" />
                {product.status === 'sold' && (
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="px-8 py-4 rounded-2xl font-light text-3xl -rotate-12"
                      style={{ background: 'rgba(220,50,50,0.9)', color: 'white', fontFamily: "'DM Serif Display', serif" }}>
                      Sold
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all"
                    style={{
                      border: activeImage === i ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      opacity: activeImage === i ? 1 : 0.5,
                    }}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </ParallaxSection>

          {/* Info */}
          <div className="flex flex-col gap-8">

            <ParallaxSection speed={0.1}>
              <div>
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="px-3 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {product.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {product.condition}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-light text-white mb-4 leading-tight"
                  style={{ fontFamily: "'DM Serif Display', serif" }}>
                  {product.title}
                </h1>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-light" style={{ fontFamily: "'DM Serif Display', serif", color: 'rgba(255,150,100,0.9)' }}>
                    {formatCurrency(product.price)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(product.createdAt))} ago
                  </div>
                </div>
              </div>
            </ParallaxSection>

            {/* Verified badge */}
            <div className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(100,200,150,0.05)', border: '1px solid rgba(100,200,150,0.1)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(100,200,150,0.1)' }}>
                <ShieldCheck className="w-5 h-5" style={{ color: 'rgba(100,220,150,0.8)' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Verified Marketplace</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Only accessible to verified members of {product.college}
                </p>
              </div>
            </div>

            {/* Description */}
            <ParallaxSection speed={0.08}>
              <div>
                <h3 className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>DESCRIPTION</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {product.description}
                </p>
              </div>
            </ParallaxSection>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleContactSeller}
                disabled={chatLoading || user?.id === product.sellerId}
                className="flex-[3] py-4 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ background: user?.id === product.sellerId ? 'rgba(255,255,255,0.1)' : 'white', color: user?.id === product.sellerId ? 'rgba(255,255,255,0.4)' : 'black', cursor: user?.id === product.sellerId ? 'not-allowed' : 'pointer' }}>
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                {user?.id === product.sellerId ? 'Your Listing' : 'Contact Seller'}
              </button>
              <button onClick={handleSave}
                className="flex-1 py-4 rounded-full text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: isSaved ? 'rgba(220,50,80,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isSaved ? '1px solid rgba(220,50,80,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: isSaved ? 'rgba(255,100,120,0.9)' : 'rgba(255,255,255,0.4)',
                }}>
                <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Seller Card */}
            <ParallaxSection speed={0.1}>
              <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>SELLER</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={seller?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.sellerId}`}
                      alt={product.sellerName}
                      className="w-14 h-14 rounded-2xl object-cover"
                      style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(100,220,150,0.9)', border: '2px solid #080808' }}>
                      <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{product.sellerName}</h4>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ color: 'rgba(255,200,50,0.8)', fill: 'rgba(255,200,50,0.8)' }} />
                        {seller?.rating || '5.0'}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.college}
                      </div>
                    </div>
                  </div>
                  <Link to={`/profile/${product.sellerId}`}
                    className="text-xs px-4 py-2 rounded-full transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}>
                    Profile
                  </Link>
                </div>
              </div>
            </ParallaxSection>

            {/* Safety */}
            <div className="p-5 rounded-2xl flex gap-3"
              style={{ background: 'rgba(200,150,0,0.05)', border: '1px solid rgba(200,150,0,0.1)' }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(200,160,0,0.7)' }} />
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'rgba(200,180,50,0.8)' }}>Stay Safe on Campus</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Always meet in high-traffic public campus locations. Inspect the item thoroughly before payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
