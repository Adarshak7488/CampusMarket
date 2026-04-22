import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Heart, MessageCircle, Star, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-6 bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-blue-50 transition-all group duration-300">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-slate-800">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
  <div className="relative pl-12 pb-12 last:pb-0 border-l border-blue-100 last:border-0 ml-4">
    <div className="absolute left-[-20px] top-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
      <span className="text-white font-bold">{number}</span>
    </div>
    <h3 className="text-xl font-bold mb-2 text-slate-800">{title}</h3>
    <p className="text-slate-500">{desc}</p>
  </div>
);

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-52 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-600 mb-6 border border-blue-100">
                🚀 Restricted to your campus community
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
                Buy & Sell with Students <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">You Trust.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                The modern marketplace built exclusively for verified students. 
                Books, electronics, hostel gear, and more—all within your reach.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/marketplace" 
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-xl shadow-blue-200 flex items-center justify-center space-x-2"
                >
                  <span>Explore Items</span>
                  <Zap className="w-5 h-5 fill-white" />
                </Link>
                <Link 
                  to="/sell" 
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-full font-bold text-lg hover:border-blue-200 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Start Selling</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Shop by Category</h2>
              <p className="text-slate-500 font-medium">Find exactly what you need for this semester</p>
            </div>
            <Link to="/marketplace" className="text-blue-600 font-bold flex items-center hover:underline group">
              View all <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {[
              { name: 'Textbooks', icon: '📚', count: '1.2k+ items', color: 'bg-orange-50' },
              { name: 'Electronics', icon: '💻', count: '850+ items', color: 'bg-blue-50' },
              { name: 'Hostel Gear', icon: '🛋️', count: '420+ items', color: 'bg-green-50' },
              { name: 'Cycles & Transport', icon: '🚲', count: '120+ items', color: 'bg-purple-50' }
            ].map((cat, i) => (
              <motion.div 
                key={cat.name}
                whileHover={{ y: -8 }}
                className={`${cat.color} p-8 rounded-3xl border border-white flex flex-col items-center text-center cursor-pointer`}
              >
                <span className="text-5xl mb-6">{cat.icon}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{cat.name}</h3>
                <span className="text-sm font-medium text-slate-500">{cat.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Why use CampusMarket?</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">We've reimagined student-to-student commerce with trust at its core.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={ShieldCheck} 
              title="Verified Students Only" 
              desc="Every user is verified with their college email. No random outsiders, only students you can find on campus."
            />
            <FeatureCard 
              icon={MessageCircle} 
              title="Real-Time Chat" 
              desc="Integrated messaging system to negotiate prices and set up meet-ups without sharing your phone number."
            />
            <FeatureCard 
              icon={Heart} 
              title="Save for Later" 
              desc="Found something great but not ready to buy? Save it to your favorites and get notified of price drops."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-12">As easy as tagging a friend.</h2>
              <div className="space-y-4">
                <Step 
                  number="01" 
                  title="List Your Item" 
                  desc="Snap a few photos, pick a category, and set your price. It takes less than 60 seconds."
                />
                <Step 
                  number="02" 
                  title="Connect via Chat" 
                  desc="Interested buyers message you through the app. Agree on a price and a campus meet-up spot."
                />
                <Step 
                  number="03" 
                  title="Make the Trade" 
                  desc="Meet up safely on campus, exchange the item, and get paid. Review the buyer/seller to build trust."
                />
              </div>
            </div>
            <div className="relative py-12 px-12 bg-white rounded-[48px] shadow-2xl shadow-blue-100 border border-slate-100 rotate-2">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center -rotate-12 shadow-lg border-8 border-white">
                <Star className="text-white fill-white w-10 h-10" />
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
                <div className="aspect-square w-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-20 h-20" />
                </div>
                <div className="space-y-3">
                  <div className="h-6 w-full bg-slate-100 rounded" />
                  <div className="h-6 w-2/3 bg-slate-100 rounded" />
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-8 w-20 bg-blue-100 rounded-full" />
                  <div className="h-10 w-32 bg-blue-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold mb-2">5,000+</div>
              <div className="text-blue-100 font-medium">Verify Students</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">12,000+</div>
              <div className="text-blue-100 font-medium">Items Sold</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">50+</div>
              <div className="text-blue-100 font-medium">Universities</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">4.9/5</div>
              <div className="text-blue-100 font-medium">Safety Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight">Campus<span className="text-blue-600">Market</span></span>
              </div>
              <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                The trusted student-to-student marketplace. Built for campus safety and verified commerce.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">Marketplace</h3>
              <ul className="space-y-4 text-slate-400">
                <li><Link to="/marketplace" className="hover:text-blue-400 transition-colors">All Listings</Link></li>
                <li><Link to="/marketplace?cat=textbooks" className="hover:text-blue-400 transition-colors">Textbooks</Link></li>
                <li><Link to="/marketplace?cat=electronics" className="hover:text-blue-400 transition-colors">Electronics</Link></li>
                <li><Link to="/marketplace?cat=hostel" className="hover:text-blue-400 transition-colors">Hostel Gear</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6">Support</h3>
              <ul className="space-y-4 text-slate-400">
                <li><Link to="/faq" className="hover:text-blue-400 transition-colors">FAQs</Link></li>
                <li><Link to="/safety" className="hover:text-blue-400 transition-colors">Safety Tips</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} CampusMarket. All rights reserved. Made for students.
        </div>
      </footer>
    </div>
  );
};

export default Home;
