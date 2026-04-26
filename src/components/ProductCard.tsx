import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  isSaved?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isSaved = false }) => {
  const conditionColor = 
    product.condition === 'New' ? 'rgba(100,220,150,0.15)' :
    product.condition === 'Used - Like New' ? 'rgba(100,150,255,0.15)' :
    product.condition === 'Used - Good' ? 'rgba(255,255,255,0.08)' :
    'rgba(255,180,50,0.15)';

  const conditionTextColor =
    product.condition === 'New' ? 'rgba(100,220,150,0.9)' :
    product.condition === 'Used - Like New' ? 'rgba(100,170,255,0.9)' :
    product.condition === 'Used - Good' ? 'rgba(255,255,255,0.4)' :
    'rgba(255,180,50,0.9)';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group rounded-3xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)' }}>
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.2)' }} />

        {/* Condition badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: conditionColor, color: conditionTextColor, backdropFilter: 'blur(8px)' }}>
            {product.condition}
          </span>
          {product.status === 'sold' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(220,50,50,0.2)', color: 'rgba(255,100,100,0.9)', backdropFilter: 'blur(8px)' }}>
              Sold
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          style={{
            background: isSaved ? 'rgba(220,50,80,0.9)' : 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            color: isSaved ? 'white' : 'rgba(255,255,255,0.6)',
          }}
        >
          <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        <h4 className="text-sm font-medium line-clamp-1 mb-1 transition-colors"
          style={{ color: 'rgba(255,255,255,0.75)' }}>
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h4>

        <p className="text-base font-light mb-3"
          style={{ color: 'rgba(255,150,100,0.9)', fontFamily: "'DM Serif Display', serif" }}>
          {formatCurrency(product.price)}
        </p>

        <div className="flex items-center gap-2 pt-3 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${product.sellerName}`}
            className="w-5 h-5 rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            alt={product.sellerName}
          />
          <span className="truncate">
            {product.sellerName} · {formatDistanceToNow(new Date(product.createdAt))} ago
          </span>
        </div>
      </div>
    </motion.div>
  );
};
