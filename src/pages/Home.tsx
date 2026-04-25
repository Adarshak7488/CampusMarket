import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MessageCircle, Heart, Users, ShoppingBag, Zap, Star } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

const FeatureCard = ({ icon: Icon, title, desc, accent }: { icon: any, title: string, desc: string, accent: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-500 overflow-hidden"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accent} blur-[80px] -z-10`} />
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${accent} bg-opacity-20`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-white/40 leading-relaxed text-sm">{desc}</p>
  </motion.div>
);

const ParallaxText = ({ children, speed = 0.5 }: { children: React.ReactNode, speed?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60 * speed, -60 * speed]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  return <motion.div ref={ref} style={{ y: smoothY }}>{children}</motion.div>;
};

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const categories = [
    { name: 'Textbooks', icon: '📚', count: '1.2k+ items', color: 'from-orange-950/50 to-orange-900/20', border: 'border-orange-500/10' },
    { name: 'Electronics', icon: '💻', count: '850+ items', color: 'from-blue-950/50 to-blue-900/20', border: 'border-blue-500/10' },
    { name: 'Hostel Gear', icon: '🛋️', count: '420+ items', color: 'from-emerald-950/50 to-emerald-900/20', border: 'border-emerald-500/10' },
    { name: 'Transport', icon: '🚲', count: '120+ items', color: 'from-purple-950/50 to-purple-900/20', border: 'border-purple-500/10' },
  ];

  const stats = [
    { value: '5,000+', label: 'Verified Students' },
    { value: '12,000+', label: 'Items Sold' },
    { value: '50+', label: 'Universities' },
    { value: '4.9/5', label: 'Safety Rating' },
  ];

  return (
    <div className="bg-[#080808] text-white overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Ambient background blobs */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ x: mousePos.x, y: mousePos.y }}
          transition={{ type: 'spring', stiffness: 50 }}
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-900/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-900/10 rounded-full blur-[80px]" />
        </motion.div>

        {/* Noise grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-white/50 mb-10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Restricted to verified campus students only
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light leading-[0.95] tracking-tight mb-6"
              style={{ fontFamily: "'DM Serif Display', serif" }}>
              <span className="text-white/90">Buy & sell</span>
              <br />
              <em className="text-white/30 italic">with students</em>
              <br />
              <span className="text-white/90">you trust.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/35 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light"
          >
            Books, electronics, hostel gear — all from verified students at your college. Safe. Fast. Zero fees.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/marketplace"
              className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">Explore items</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/sell"
              className="px-8 py-4 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:border-white/30 hover:text-white/80 transition-all"
            >
              Start selling
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-10 px-8 text-center"
              >
                <div className="text-3xl md:text-4xl font-light text-white mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>{stat.value}</div>
                <div className="text-white/30 text-xs tracking-wide uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <ParallaxText speed={0.3}>
              <div>
                <p className="text-white/20 text-xs tracking-widest uppercase mb-3">Categories</p>
                <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  Shop by<br /><em className="italic text-white/40">category</em>
                </h2>
              </div>
            </ParallaxText>
            <Link to="/marketplace" className="text-white/30 text-sm hover:text-white/60 transition-colors flex items-center gap-2 group">
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-gradient-to-b ${cat.color} border ${cat.border} p-8 rounded-3xl flex flex-col items-center text-center cursor-pointer transition-all duration-300`}
              >
                <span className="text-5xl mb-5 block">{cat.icon}</span>
                <h3 className="text-sm font-medium text-white/80 mb-1">{cat.name}</h3>
                <span className="text-xs text-white/30">{cat.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-32 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <ParallaxText speed={0.2}>
              <p className="text-white/20 text-xs tracking-widest uppercase mb-4">Why CampusMarket</p>
              <h2 className="text-4xl md:text-6xl font-light text-white" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Built for trust,<br /><em className="italic text-white/40">not profit.</em>
              </h2>
            </ParallaxText>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={ShieldCheck} title="Verified Students Only" desc="Every user is verified with their college email. No random outsiders, only students you can find on campus." accent="bg-emerald-500/10" />
            <FeatureCard icon={MessageCircle} title="Real-Time Chat" desc="Integrated messaging to negotiate prices and set up meet-ups without sharing your phone number." accent="bg-blue-500/10" />
            <FeatureCard icon={Heart} title="Save for Later" desc="Found something great but not ready? Save it to favorites and get notified of price drops." accent="bg-rose-500/10" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <ParallaxText speed={0.3}>
                <p className="text-white/20 text-xs tracking-widest uppercase mb-4">How it works</p>
                <h2 className="text-4xl md:text-5xl font-light text-white mb-16" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  As easy as<br /><em className="italic text-white/40">tagging a friend.</em>
                </h2>
              </ParallaxText>
              <div className="space-y-10">
                {[
                  { n: '01', title: 'List Your Item', desc: 'Snap a few photos, pick a category, set your price. Under 60 seconds.' },
                  { n: '02', title: 'Connect via Chat', desc: 'Buyers message you through the app. Agree on a price and campus meet-up spot.' },
                  { n: '03', title: 'Make the Trade', desc: 'Meet safely on campus, exchange the item, get paid. Review to build trust.' },
                ].map((step, i) => (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-6"
                  >
                    <span className="text-white/10 text-4xl font-light tabular-nums mt-1" style={{ fontFamily: "'DM Serif Display', serif" }}>{step.n}</span>
                    <div>
                      <h3 className="text-white font-medium mb-2">{step.title}</h3>
                      <p className="text-white/35 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <ParallaxText speed={0.4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative bg-white/[0.03] border border-white/5 rounded-3xl p-8 rotate-1"
              >
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400/90 rounded-2xl flex items-center justify-center -rotate-12">
                  <Star className="text-yellow-900 fill-yellow-900 w-7 h-7" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-24 bg-white/10 rounded-full" />
                    <div className="h-2 w-16 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="aspect-square w-full bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                  <ShoppingBag className="w-16 h-16 text-white/10" />
                </div>
                <div className="space-y-2.5 mb-6">
                  <div className="h-3 w-full bg-white/8 rounded-full" />
                  <div className="h-3 w-2/3 bg-white/5 rounded-full" />
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-white/5">
                  <div className="h-7 w-16 bg-white/8 rounded-full" />
                  <div className="h-9 w-28 bg-white rounded-full" />
                </div>
              </motion.div>
            </ParallaxText>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/20 to-transparent" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <ParallaxText speed={0.2}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Ready to sell<br /><em className="italic text-white/40">your stuff?</em>
              </h2>
              <p className="text-white/30 mb-10 text-lg font-light">List in under 2 minutes. Reach 5,000+ students.</p>
              <Link to="/signup"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all text-sm group"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </ParallaxText>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-black" />
                </div>
                <span className="font-medium text-white">CampusMarket</span>
              </div>
              <p className="text-white/25 text-sm leading-relaxed max-w-xs">
                The trusted student-to-student marketplace. Built for campus safety and verified commerce.
              </p>
            </div>
            <div>
              <h3 className="text-white/40 text-xs tracking-widest uppercase mb-5">Marketplace</h3>
              <ul className="space-y-3">
                {['All Listings', 'Textbooks', 'Electronics', 'Hostel Gear'].map(item => (
                  <li key={item}><Link to="/marketplace" className="text-white/25 text-sm hover:text-white/60 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white/40 text-xs tracking-widest uppercase mb-5">Support</h3>
              <ul className="space-y-3">
                {['FAQs', 'Safety Tips', 'Terms of Service', 'Contact Us'].map(item => (
                  <li key={item}><Link to="/" className="text-white/25 text-sm hover:text-white/60 transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/15 text-xs">&copy; {new Date().getFullYear()} CampusMarket. All rights reserved.</p>
            <p className="text-white/15 text-xs">Made for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
