import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MessageSquare, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="glass-nav h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200">
                C
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">Campus<span className="text-blue-600">Market</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors">Marketplace</Link>
            {user ? (
              <>
                <Link to="/chats" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link to="/dashboard" className="text-slate-500 hover:text-blue-600 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
                <Link to="/sell" className="btn-primary px-5 py-2.5 text-sm shadow-md shadow-blue-100">
                  Sell Item
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors">Login</Link>
                <Link to="/signup" className="btn-primary px-5 py-2.5 text-sm shadow-md shadow-blue-100">
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/marketplace" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50">Marketplace</Link>
              {user ? (
                <>
                  <Link to="/chats" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50">Messages</Link>
                  <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50">Dashboard</Link>
                  <Link to="/sell" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50">Sell Item</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50">Login</Link>
                  <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50">Join Now</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
