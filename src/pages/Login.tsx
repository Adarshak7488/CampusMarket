import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'rgba(180,30,30,0.12)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: 'rgba(120,60,0,0.1)' }} />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
          <span className="text-white/70 font-medium">CampusMarket</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-white mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Welcome back.
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Log in to your campus account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm"
              style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)', color: '#f87171' }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-2 ml-1" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                COLLEGE EMAIL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="block w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2 ml-1" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? 'rgba(255,255,255,0.7)' : 'white',
                color: 'black',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log in'}
            </button>
          </form>

          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'white'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
