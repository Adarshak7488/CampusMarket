import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, User, GraduationCap, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.8)',
  fontFamily: "'DM Sans', sans-serif",
};

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, 'users', user.uid), {
        name, email, college,
        joinedAt: new Date().toISOString(),
        rating: 5.0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#080808', fontFamily: "'DM Sans', sans-serif" }}>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: 'rgba(180,30,30,0.1)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px]" style={{ background: 'rgba(80,40,0,0.12)' }} />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
          <span className="text-white/70 font-medium">CampusMarket</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="grid md:grid-cols-2">

            {/* Left panel */}
            <div className="p-10 flex flex-col justify-center relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px]" style={{ background: 'rgba(200,50,50,0.15)' }} />
              <div className="relative z-10">
                <h2 className="text-3xl font-light text-white mb-3 leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Student only<br /><em className="italic text-white/40">community.</em>
                </h2>
                <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Join 5,000+ verified students buying and selling safely on campus.
                </p>
                <div className="space-y-4">
                  {['Verified .edu emails', 'In-app messaging', 'Zero platform fees'].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="p-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="mb-6">
                <h1 className="text-2xl font-light text-white mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Create account
                </h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Get started in seconds</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3 rounded-2xl flex items-center gap-3 text-xs"
                  style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)', color: '#f87171' }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5 ml-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>FULL NAME</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        <User className="w-4 h-4" />
                      </div>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)}
                        placeholder="Alex Smith"
                        className="block w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5 ml-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>COLLEGE</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <input type="text" required value={college} onChange={e => setCollege(e.target.value)}
                        placeholder="SAGE Uni"
                        className="block w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5 ml-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>COLLEGE EMAIL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="block w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5 ml-1" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>PASSWORD</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 mt-2"
                  style={{ background: loading ? 'rgba(255,255,255,0.7)' : 'white', color: 'black', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => (e.target as HTMLElement).style.color = 'white'}
                    onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'}>
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
