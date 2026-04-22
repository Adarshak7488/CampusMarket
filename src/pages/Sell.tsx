import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { GoogleGenAI } from "@google/genai";
import { Upload, X, Loader2, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const CATEGORIES = ['Textbooks', 'Electronics', 'Hostel Gear', 'Cycles', 'Calculators', 'Clothing', 'Musical Instruments', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];

const Sell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'Used - Good',
  });
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string].slice(0, 5));
        };
        if (file) {
          reader.readAsDataURL(file as unknown as Blob);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateAIDescription = async () => {
    if (!formData.title) {
      setError("Please enter a title first so AI can help.");
      return;
    }
    
    setAiLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a compelling and professional marketplace description for a ${formData.condition} ${formData.title} being sold on a college campus marketplace. Key features to highlight: ${formData.category}. Keep it under 150 words. Do not use markdown bold/italic, just plain text.`,
      });
      
      if (response.text) {
        setFormData(prev => ({ ...prev, description: response.text.trim() }));
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate AI description. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        price: parseFloat(formData.price),
        images,
        sellerId: user.id,
        sellerName: user.name,
        college: user.college,
        createdAt: new Date().toISOString(),
        status: 'active',
        savedBy: []
      });
      navigate('/marketplace');
    } catch (err: any) {
      console.error(err);
      setError("Failed to list item. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Sell an Item</h1>
        <p className="text-slate-500 font-medium">Turn your unused items into cash within your campus community.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <label className="block text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             Upload Photos <span className="text-sm font-medium text-slate-400 font-sans tracking-normal">(Max 5)</span>
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100"
                >
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {images.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-blue-600 group">
                <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Add Photo</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Basic Details */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Item Details</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Looking for a Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-medium"
                placeholder="e.g. Calculus Early Transcendentals 8th Edition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-bold"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-bold"
              >
                {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Price ($)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-sm font-bold text-slate-700">Description</label>
              <button 
                type="button"
                onClick={generateAIDescription}
                disabled={aiLoading}
                className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {aiLoading ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all font-medium leading-relaxed"
              placeholder="Tell buyers more about the item, any damages, why you're selling it, etc."
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 btn-primary text-lg shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Listing'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-lg hover:bg-slate-50 transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sell;
