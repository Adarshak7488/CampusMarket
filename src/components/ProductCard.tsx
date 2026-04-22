import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Tag, Clock } from 'lucide-react';
import { Product } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  isSaved?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSaved = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="product-card"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn(
            "badge-condition",
            product.condition === 'New' ? "bg-green-100 text-green-700" :
            product.condition === 'Used - Like New' ? "bg-blue-100 text-blue-700" :
            product.condition === 'Used - Good' ? "bg-slate-100 text-slate-700" :
            "bg-orange-100 text-orange-700"
          )}>
            {product.condition}
          </span>
          {product.status === 'sold' && (
            <span className="badge-condition bg-red-100 text-red-700">
              Sold
            </span>
          )}
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); /* Handle Save */ }}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity",
            isSaved ? "bg-red-500 text-white opacity-100" : "bg-white text-slate-400 hover:text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
        </button>
      </Link>

      <div className="p-4">
        <div className="mb-1 flex justify-between items-start">
          <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 flex-1 pr-2">
            <Link to={`/product/${product.id}`}>{product.title}</Link>
          </h4>
        </div>
        <p className="text-blue-600 font-bold text-lg">{formatCurrency(product.price)}</p>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${product.sellerName}`} 
            className="w-5 h-5 rounded-full border border-slate-200" 
            alt={product.sellerName} 
          />
          <span className="truncate">{product.sellerName} • {formatDistanceToNow(new Date(product.createdAt))} ago</span>
        </div>
      </div>
    </motion.div>
  );
};
