import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, User, LogOut, Menu, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(8,8,8,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full">
        <div className="flex justify-between h-full items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <ShoppingBag className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
              Campus<span className="text-white/40">Market</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/marketplace" className="text-white/40 hover:text-white/80 text-sm transition-colors">
              Marketplace
            </Link>
            {user ? (
              <>
                <Link to="/chats" className="text-white/40 hover:text-white/80 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <Link to="/dashboard" className="text-white/40 hover:text-white/80 transition-colors">
                  <User className="w-4 h-4" />
                </Link>
                <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
                <Link
                  to="/sell"
                  className="px-5 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-all"
                >
                  Sell Item
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/40 hover:text-white/80 text-sm transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-all"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/50 hover:text-white transition-colors p-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="md:hidden overflow-hidden"
            style={{
              background: 'rgba(8,8,8,0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="px-6 pt-3 pb-6 space-y-1">
              <Link
                to="/marketplace"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 text-sm text-white/50 hover:text-white transition-colors"
              >
                Marketplace
              </Link>
              {user ? (
                <>
                  <Link to="/chats" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-sm text-white/50 hover:text-white transition-colors">Messages</Link>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-sm text-white/50 hover:text-white transition-colors">Dashboard</Link>
                  <Link to="/sell" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-sm text-white/80 hover:text-white transition-colors">Sell Item</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-3 text-sm text-red-400/70 hover:text-red-400 transition-colors">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-sm text-white/50 hover:text-white transition-colors">Login</Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="block mt-2 mx-3 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-full text-center hover:bg-white/90 transition-all">Join Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
