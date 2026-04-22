import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Product, User } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { ShieldCheck, MapPin, Clock, Heart, MessageSquare, AlertTriangle, Share2, ArrowLeft, Loader2, Star, CheckCircle2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

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

  useEffect(() => {
    if (id) fetchProductData(id);
  }, [id, user]);

  const fetchProductData = async (productId: string) => {
    setLoading(true);
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() } as Product;
        setProduct(productData);
        setIsSaved(productData.savedBy?.includes(user?.id || ''));
        
        // Fetch seller data
        const sellerDoc = await getDoc(doc(db, 'users', productData.sellerId));
        if (sellerDoc.exists()) {
          setSeller({ id: sellerDoc.id, ...sellerDoc.data() } as User);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !product) return navigate('/login');
    
    setIsSaved(!isSaved); // Optimistic update
    try {
      await updateDoc(doc(db, 'products', product.id), {
        savedBy: isSaved ? arrayRemove(user.id) : arrayUnion(user.id)
      });
    } catch (err) {
      console.error(err);
      setIsSaved(isSaved); // Revert on error
    }
  };

  const handleContactSeller = async () => {
    if (!user || !product) return navigate('/login');
    if (user.id === product.sellerId) return;

    setChatLoading(true);
    try {
      // Check if chat already exists
      const q = query(
        collection(db, 'chats'), 
        where('participants', 'array-contains', user.id),
        where('productId', '==', product.id)
      );
      const querySnapshot = await getDocs(q);
      
      let chatId = '';
      const existingChat = querySnapshot.docs.find(doc => doc.data().participants.includes(product.sellerId));
      
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create new chat
        const newChat = await addDoc(collection(db, 'chats'), {
          participants: [user.id, product.sellerId],
          productId: product.id,
          productTitle: product.title,
          lastMessage: `Interested in your listing: ${product.title}`,
          lastTimestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        chatId = newChat.id;
        
        // Add initial message
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          chatId,
          senderId: user.id,
          receiverId: product.sellerId,
          text: `Hi! I'm interested in "${product.title}". Is it still available?`,
          timestamp: new Date().toISOString()
        });
      }
      
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-slate-800">Listing not found</h2>
      <Link to="/marketplace" className="mt-4 inline-block text-blue-600 font-bold hover:underline">Back to Marketplace</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 font-bold mb-8 hover:text-blue-600 group transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-[40px] overflow-hidden border border-slate-100 bg-white relative shadow-2xl shadow-slate-200/50">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images[activeImage]} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.status === 'sold' && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="px-10 py-5 bg-red-600 text-white font-black text-4xl transform -rotate-12 rounded-xl shadow-2xl">
                    SOLD
                  </div>
               </div>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {product.images.map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white",
                  activeImage === i ? "border-blue-600 shadow-lg shadow-blue-100" : "border-transparent hover:border-slate-200"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                {product.category}
              </span>
              <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase tracking-widest border border-slate-200">
                {product.condition}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{product.title}</h1>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-black text-blue-600">{formatCurrency(product.price)}</span>
              <div className="flex items-center text-slate-400 text-sm font-bold gap-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(product.createdAt))} ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-10 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Verified Marketplace</p>
              <p className="text-xs font-medium text-slate-500">Only accessible to verified members of {product.college}</p>
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <h3 className="text-xl font-bold text-slate-800">Description</h3>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-4 mt-auto">
            <div className="flex gap-4 p-4 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[32px] shadow-2xl shadow-slate-200/50 md:relative md:bottom-0 md:bg-transparent md:border-0 md:p-0 md:shadow-none">
              <button 
                onClick={handleContactSeller}
                disabled={chatLoading || (user?.id === product.sellerId)}
                className="flex-[3] py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {chatLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <MessageSquare className="w-6 h-6" />}
                {user?.id === product.sellerId ? 'Your Listing' : 'Contact Seller'}
              </button>
              <button 
                onClick={handleSave}
                className={cn(
                  "flex-1 py-5 rounded-2xl font-bold text-lg transition-all border-2 flex items-center justify-center gap-3",
                  isSaved ? "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-100" : "bg-white text-slate-700 border-slate-100 hover:bg-slate-50"
                )}
              >
                <Heart className={cn("w-6 h-6", isSaved && "fill-current")} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Seller Card */}
          <div className="mt-16 pt-12 border-t border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-8">About the Seller</h3>
            <div className="p-8 bg-slate-50 rounded-[40px] border border-white shadow-inner flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <img 
                  src={seller?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.sellerId}`} 
                  alt={product.sellerName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full border-4 border-slate-50 p-1">
                  <CheckCircle2 className="text-white w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h4 className="text-2xl font-bold text-slate-900">{product.sellerName}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="text-sm font-black tracking-tighter">{seller?.rating || '5.0'}</span>
                    <span className="text-slate-400 text-xs font-bold leading-none ml-1">(12 reviews)</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{product.college}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-sm">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Member since {seller?.joinedAt ? new Date(seller.joinedAt).getFullYear() : '2024'}</span>
                  </div>
                </div>
                <Link to={`/profile/${product.sellerId}`} className="inline-block text-sm font-bold text-blue-600 hover:underline">
                  View Full Profile
                </Link>
              </div>
              <div className="w-full md:w-auto flex flex-col gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
                  <div className="text-xl font-black text-slate-900">8</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Listings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Warning */}
          <div className="mt-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 mb-1">Stay Safe on Campus</p>
              <p className="text-xs font-medium text-amber-700 leading-relaxed">
                Always meet in high-traffic public campus locations (like the Library or Student Center) for transactions. Inspect the item thoroughly before making any payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
