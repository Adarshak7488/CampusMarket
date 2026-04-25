import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { Upload, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';

const CATEGORIES = ['Textbooks', 'Electronics', 'Hostel Gear', 'Cycles', 'Calculators', 'Clothing', 'Musical Instruments', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.8)',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  width: '100%',
};

const ParallaxSection = ({ children, speed = 0.3 }: { children: React.ReactNode, speed?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40 * speed, -40 * speed]);
  const smoothY = useSpring(y, { stiffness: 80, damping: 25 });
  return <motion.div ref={ref} style={{ y: smoothY }}>{children}</motion.div>;
};

const Sell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: 'Textbooks', condition: 'Used - Good' });
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setImages(prev => [...prev, reader.result as string].slice(0, 5));
        reader.readAsDataURL(file as unknown as Blob);
      });
    }
  };

  const generateAIDescription = async () => {
    if (!formData.title) { setError("Please enter a title first."); return; }
    setAiLoading(true); setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a compelling marketplace description for a ${formData.condition} ${formData.title} being sold on a college campus. Category: ${formData.category}. Under 150 words. Plain text only.`,
      });
      if (response.text) setFormData(prev => ({ ...prev, description: response.text.trim() }));
    } catch (err) {
      setError("Failed to generate AI description.");
    } finally { setAiLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) { setError("Please upload at least one image."); return; }
    setLoading(true); setError(null);
    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        price: parseFloat(formData.price),
        images, sellerId: user.id, sellerName: user.name,
        college: user.college, createdAt: new Date().toISOString(),
        status: 'active', savedBy: []
      });
      navigate('/marketplace');
    } catch (err) {
      setError("Failed to list item. Please try again.");
    } finally { setLoading(false); }
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
  };

  return (
    <div className="min-h-screen pt-20 pb-20 relative overflow-hidden"
      style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[100px]" style={{ background: 'rgba(180,30,30,0.18)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[90px]" style={{ background: 'rgba(140,60,0,0.15)' }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full blur-[110px]" style={{ background: 'rgba(160,40,10,0.12)' }} />
      </div>

      {/* Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] -z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6">

        {/* Header */}
        <ParallaxSection speed={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>NEW LISTING</p>
            <h1 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Sell an <em className="italic" style={{ color: 'rgba(255,255,255,0.35)' }}>item.</em>
            </h1>
            <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Turn unused items into cash within your campus community.
            </p>
          </motion.div>
        </ParallaxSection>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Image Upload */}
          <ParallaxSection speed={0.15}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-7 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Serif Display', serif", fontSize: '18px' }}>
                  Photos
                </h2>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Max 5</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                <AnimatePresence>
                  {images.map((img, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-2xl overflow-hidden group"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.7)' }}>
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {images.length < 5 && (
                  <label className="aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
                    style={{ border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.2)'; }}
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs">Add</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </motion.div>
          </ParallaxSection>

          {/* Item Details */}
          <ParallaxSection speed={0.1}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-7 rounded-3xl space-y-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h2 className="font-light" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Serif Display', serif", fontSize: '18px' }}>
                Item details
              </h2>

              {/* Title */}
              <div>
                <label className="block text-xs mb-2" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>TITLE</label>
                <input type="text" required value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Calculus 8th Edition"
                  className="px-4 py-3 rounded-2xl text-sm transition-all"
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Category + Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>CATEGORY</label>
                  <select value={formData.category}
                    onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="px-4 py-3 rounded-2xl text-sm transition-all appearance-none"
                    style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background: '#111' }}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>CONDITION</label>
                  <select value={formData.condition}
                    onChange={e => setFormData(p => ({ ...p, condition: e.target.value }))}
                    className="px-4 py-3 rounded-2xl text-sm transition-all appearance-none"
                    style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                    {CONDITIONS.map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs mb-2" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>PRICE (₹)</label>
                <input type="number" required value={formData.price}
                  onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                  className="px-4 py-3 rounded-2xl text-sm transition-all"
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>DESCRIPTION</label>
                  <button type="button" onClick={generateAIDescription} disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}>
                    {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {aiLoading ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea required rows={5} value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the item — condition, why selling, any damage..."
                  className="px-4 py-3 rounded-2xl text-sm transition-all resize-none"
                  style={{ ...inputStyle }}
                  onFocus={focusStyle as any} onBlur={blurStyle as any} />
              </div>
            </motion.div>
          </ParallaxSection>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl flex items-center gap-3 text-sm"
              style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{ background: loading ? 'rgba(255,255,255,0.6)' : 'white', color: 'black', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Listing'}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="px-8 py-3.5 rounded-full text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sell;
