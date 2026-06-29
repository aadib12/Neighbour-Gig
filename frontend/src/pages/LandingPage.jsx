import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Zap, Award, Star, ArrowRight, Home, Users, Hammer, Award as AwardIcon } from 'lucide-react';

const LandingPage = () => {
  const categories = [
    { name: 'Maids & Cleaners', slug: 'cleaning', count: 42, icon: Home, color: 'from-blue-500 to-indigo-500' },
    { name: 'Electricians', slug: 'electrical', count: 18, icon: Hammer, color: 'from-amber-500 to-orange-500' },
    { name: 'Plumbers', slug: 'plumbing', count: 24, icon: Hammer, color: 'from-teal-500 to-cyan-500' },
    { name: 'Tutors & Coaches', slug: 'tutoring', count: 31, icon: Users, color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8 py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.15),transparent_50%)]" />
        
        <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-400">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Hyperlocal Gig Workers platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Find Trusted Helpers In <br />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Your Direct Neighborhood</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
          NeighbourGig matches you instantly with verified maids, plumbers, electricians, tutors, and cleaners living right next to you.
        </p>

        {/* Action button triggers */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link to="/nearby-workers" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-8 py-4 rounded-xl font-bold shadow-xl shadow-purple-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-white">
            <span>Find Nearby Workers</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login?mode=signup" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-8 py-4 rounded-xl font-bold transition flex items-center justify-center text-slate-300">
            Register as Worker
          </Link>
        </div>
      </section>

      {/* Category Grid */}
      <section className="space-y-8">
        <div className="text-center md:text-left md:flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Popular Services</h2>
            <p className="text-slate-400 text-sm mt-1">Explore gig services currently active in your locality</p>
          </div>
          <Link to="/nearby-workers" className="hidden md:flex items-center space-x-1 text-sm font-semibold text-purple-400 hover:text-purple-300 transition mt-2 md:mt-0">
            <span>View all categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={i} 
                to={`/nearby-workers?category=${cat.slug}`}
                className="group relative glass p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition duration-300 block hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">{cat.name}</h3>
                <p className="text-slate-400 text-xs mt-1.5">{cat.count} local workers active</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-slate-900 py-16 bg-gradient-to-b from-slate-950/20 via-purple-950/5 to-slate-950/20">
        <div className="flex flex-col items-center text-center p-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">100% Verified Profiles</h3>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            All workers undergo thorough identity background checks and local admin verifications for peace of mind.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Instant QR Direct Booking</h3>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Scan a helper's QR code outside their workspace or from a business card to book their service instantly.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Fair Local Pricing</h3>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Deal directly with workers using clear hourly rates without hidden service premiums or middlemen fees.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
