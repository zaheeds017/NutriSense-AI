import React from 'react';
import {
  ScanBarcode,
  Camera,
  AlignLeft,
  Search,
  Scale,
  User,
  PlusCircle,
  Heart,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Leaf,
  LayoutDashboard,
  AlertTriangle,
} from 'lucide-react';
import { ProductRecord, ScanHistoryRecord, UserPreferences, AnalysisResultContract, NavTab } from '../types';

interface DashboardViewProps {
  products: ProductRecord[];
  history: ScanHistoryRecord[];
  userPrefs: UserPreferences;
  compareCount: number;
  onNavigate: (tab: NavTab) => void;
  onSelectScan: (analysis: AnalysisResultContract) => void;
}

const scoreBadge = (score: number) =>
  score >= 8.0
    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
    : score >= 5.0
    ? 'bg-amber-100 text-amber-900 border-amber-300'
    : 'bg-rose-100 text-rose-900 border-rose-300';

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  history,
  userPrefs,
  compareCount,
  onNavigate,
  onSelectScan,
}) => {
  const totalProducts = products.length;
  const totalScans = history.length;
  const totalFavorites = history.filter((h) => h.isFavorite).length;
  const scored = products.filter((p) => typeof p.analysis.health?.score === 'number');
  const avgScore = scored.length
    ? scored.reduce((sum, p) => sum + (p.analysis.health?.score ?? 0), 0) / scored.length
    : 0;

  const topRated = [...products]
    .sort((a, b) => (b.analysis.health?.score ?? 0) - (a.analysis.health?.score ?? 0))
    .slice(0, 3);

  const recentScans = history.slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const allergenCount = userPrefs.allergens.length;
  const dietCount = userPrefs.dietRestrictions.length;
  const profileComplete = allergenCount > 0 || dietCount > 0;

  const quickActions = [
    {
      label: 'Barcode Scan',
      desc: 'Lookup any UPC barcode',
      icon: ScanBarcode,
      accent: 'bg-emerald-600',
      onClick: () => onNavigate('scan'),
    },
    {
      label: 'OCR Label Scan',
      desc: 'Snap a photo of ingredients',
      icon: Camera,
      accent: 'bg-teal-600',
      onClick: () => onNavigate('scan'),
    },
    {
      label: 'Paste Text',
      desc: 'Analyze ingredient lists',
      icon: AlignLeft,
      accent: 'bg-sky-600',
      onClick: () => onNavigate('scan'),
    },
    {
      label: 'Browse Products',
      desc: `${totalProducts} foods in database`,
      icon: Search,
      accent: 'bg-indigo-600',
      onClick: () => onNavigate('explore'),
    },
    {
      label: 'Compare',
      desc: `${compareCount} in comparison`,
      icon: Scale,
      accent: 'bg-violet-600',
      onClick: () => onNavigate('compare'),
    },
    {
      label: 'Diet Profile',
      desc: profileComplete ? `${allergenCount + dietCount} rules set` : 'Set allergens & diets',
      icon: User,
      accent: 'bg-amber-600',
      onClick: () => onNavigate('profile'),
    },
    {
      label: 'Add Food',
      desc: 'Contribute a new product',
      icon: PlusCircle,
      accent: 'bg-rose-600',
      onClick: () => onNavigate('contribute'),
    },
  ];

  const stats = [
    { label: 'Products Analyzed', value: totalProducts, icon: LayoutDashboard, accent: 'text-emerald-600 bg-emerald-50' },
    { label: 'Scans Performed', value: totalScans, icon: Clock, accent: 'text-sky-600 bg-sky-50' },
    { label: 'Avg Health Score', value: avgScore ? avgScore.toFixed(1) : '—', icon: TrendingUp, accent: 'text-violet-600 bg-violet-50' },
    { label: 'Saved Favorites', value: totalFavorites, icon: Heart, accent: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-600/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute -right-4 top-24 w-40 h-40 bg-white/10 rounded-full" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome to NutriSense-AI
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greeting}! Ready to check what's inside?
            </h1>
            <p className="text-sm text-emerald-50 mt-1.5 max-w-xl">
              Scan a barcode, upload a label photo, or paste ingredients to unlock 1–10 AI health
              scores, allergen flags, and smarter alternatives for your everyday foods.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onNavigate('scan')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <ScanBarcode className="w-4 h-4" />
              Start Scanning
            </button>
            {!profileComplete && (
              <button
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors border border-white/40"
              >
                <ShieldCheck className="w-4 h-4" />
                Set Diet & Allergen Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.accent}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1.5 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Quick Actions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Jump straight into scanning, browsing, or personalizing your experience.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="group text-left bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-emerald-300 rounded-2xl p-4 transition-all hover:shadow-md"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform ${action.accent}`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-emerald-700 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{action.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Recent Scans
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your latest ingredient analyses at a glance.
                </p>
              </div>
              {recentScans.length > 0 && (
                <button
                  onClick={() => onNavigate('history')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 shrink-0"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {recentScans.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-1.5">
                <p className="font-bold text-slate-700 text-sm">No scans yet</p>
                <p className="text-xs text-slate-500">
                  Scan your first product to start building your history log.
                </p>
                <button
                  onClick={() => onNavigate('scan')}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                >
                  <ScanBarcode className="w-3.5 h-3.5" />
                  Scan Now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentScans.map((record) => {
                  const score = record.healthScore;
                  return (
                    <div
                      key={record.id}
                      className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${scoreBadge(score)}`}
                        >
                          {score}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {record.brand}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {record.productName}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {new Date(record.timestamp).toLocaleDateString()} ·{' '}
                            {record.scanType.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectScan(record.analysis)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1 shrink-0"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Allergen Watch */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Allergen Watch
            </h2>

            {profileComplete ? (
              <div className="space-y-3">
                {userPrefs.allergens.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Allergens to avoid
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {userPrefs.allergens.map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userPrefs.dietRestrictions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Dietary restrictions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {userPrefs.dietRestrictions.map((d) => (
                        <span
                          key={d}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="text-center py-3 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-800 text-sm">No profile set yet</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Set your allergens and dietary preferences so every scan is personalized for you.
                </p>
                <button
                  onClick={() => onNavigate('profile')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Set Up Profile
                </button>
              </div>
            )}
          </div>

          {/* Top Rated */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Healthiest Picks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top-rated products in the database.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {topRated.map((item) => {
                const score = item.analysis.health?.score ?? 5;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScan(item.analysis)}
                    className="w-full text-left bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                        <img
                          src={
                            item.imageUrl ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop'
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          {item.brand}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                        <p className="text-[11px] text-slate-400">{item.category}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black border shadow-2xs shrink-0 ${scoreBadge(score)}`}
                    >
                      {score}/10
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onNavigate('explore')}
              className="w-full px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
            >
              Browse All Products
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
