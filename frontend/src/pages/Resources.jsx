import { useState, useEffect, useCallback } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  BookOpen,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wind,
  Heart,
  Shield,
  Search,
  Star,
  Loader2,
  Sparkles
} from "lucide-react";
import { resourceApi } from "../api/resourceApi";
import { useAuth } from "../context/AuthContext";

function CrisisCard({ resource }) {
  return (
    <div className="group bg-gradient-to-br from-rose-50 to-amber-50/50 rounded-2xl p-6 border border-rose-100/80 shadow-sm hover:shadow-lg hover:border-rose-200/80 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
          <Phone className="w-7 h-7 text-rose-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-lg">{resource.title}</h3>
          <p className="text-slate-600 mt-1 leading-relaxed">{resource.desc}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {resource.number && (
              <a href={`tel:${resource.number}`} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-800 rounded-xl text-sm font-medium hover:bg-rose-200 transition-colors">
                <Phone className="w-4 h-4" /> {resource.number}
              </a>
            )}
            {resource.text && <p className="text-slate-700 font-medium text-sm">{resource.text}</p>}
            {resource.url && (
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-teal-600 font-medium text-sm hover:text-teal-700">
                Visit <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, expanded, onToggle, onFavorite, isFavorite }) {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <button onClick={onToggle} className="w-full p-6 text-left flex items-start gap-4 hover:bg-slate-50/30 transition-colors">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
          {article.icon || "📄"}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
            {article.category}
          </span>
          <h3 className="font-semibold text-slate-800 mt-2 text-lg">{article.title}</h3>
          <p className="text-slate-600 mt-1 leading-relaxed">{article.excerpt}</p>
        </div>
        {user && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite?.(article); }}
            className="p-2 rounded-xl hover:bg-amber-50 transition-colors"
          >
            <Star className={`w-5 h-5 ${isFavorite ? "fill-amber-400 text-amber-500" : "text-slate-300 hover:text-amber-400"}`} />
          </button>
        )}
        {expanded ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="pl-[4.5rem] border-l-2 border-teal-100">
            <p className="text-slate-600 text-sm leading-relaxed pl-4">{article.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CopingCard({ item, onFavorite, isFavorite }) {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6 text-violet-500" />
          </div>
          <h3 className="font-semibold text-slate-800 text-lg">{item.title}</h3>
        </div>
        {user && (
          <button onClick={() => onFavorite?.(item)} className="p-2 rounded-xl hover:bg-amber-50 transition-colors">
            <Star className={`w-5 h-5 ${isFavorite ? "fill-amber-400 text-amber-500" : "text-slate-300 hover:text-amber-400"}`} />
          </button>
        )}
      </div>
      <ol className="space-y-2.5 mt-4 pl-1">
        {(item.steps || []).map((step, j) => (
          <li key={j} className="text-slate-600 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {j + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BreathingCard({ exercise, onFavorite, isFavorite }) {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Wind className="w-7 h-7 text-sky-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">{exercise.title}</h3>
            <p className="text-sm text-sky-600 font-medium mt-0.5">{exercise.duration}</p>
          </div>
        </div>
        {user && (
          <button onClick={() => onFavorite?.(exercise)} className="p-2 rounded-xl hover:bg-amber-50 transition-colors">
            <Star className={`w-5 h-5 ${isFavorite ? "fill-amber-400 text-amber-500" : "text-slate-300 hover:text-amber-400"}`} />
          </button>
        )}
      </div>
      <p className="text-slate-600 mb-4 leading-relaxed">{exercise.description}</p>
      <ol className="space-y-3">
        {(exercise.steps || []).map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-700">
            <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expandedArticle, setExpandedArticle] = useState(null); // id

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await resourceApi.getResources({
        search: search || undefined,
        category: categoryFilter || undefined
      });
      setResources(data.resources || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleFavorite = async (resource) => {
    if (!user) return;
    try {
      await resourceApi.toggleFavorite(resource._id);
      setResources((prev) =>
        prev.map((r) =>
          r._id === resource._id ? { ...r, isFavorite: !r.isFavorite } : r
        )
      );
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const favorites = resources.filter((r) => r.isFavorite);
  const crisis = resources.filter((r) => r.type === "crisis");
  const articles = resources.filter((r) => r.type === "article");
  const coping = resources.filter((r) => r.type === "coping");
  const breathing = resources.filter((r) => r.type === "breathing");
  const hasAnyResults = crisis.length > 0 || articles.length > 0 || coping.length > 0 || breathing.length > 0;
  const hasActiveFilters = search.trim() || categoryFilter;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-teal-50 via-emerald-50/50 to-sky-50/30 border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-teal-500" />
              </div>
              <span className="text-sm font-medium text-teal-700">Your wellness toolkit</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-slate-800 tracking-tight">
              Resources for <span className="font-semibold text-slate-700">your journey</span>
            </h1>
            <p className="text-slate-600 mt-3 text-lg max-w-xl leading-relaxed">
              Articles, breathing exercises, and coping strategies — all in one gentle place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 shadow-sm"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-5 py-3 bg-white/80 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 shadow-sm"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4" />
              <p className="text-slate-500">Loading your resources...</p>
            </div>
          ) : (
            <>
              {!hasAnyResults && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700">No resources match your search</h3>
                  <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                    {hasActiveFilters
                      ? "Try a different search term or category."
                      : "Resources will appear here once they&apos;re added."}
                  </p>
                </div>
              )}

              {user && favorites.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">My Favorites</h2>
                      <p className="text-sm text-slate-500">Resources you&apos;ve saved</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((r) => {
                      if (r.type === "article") {
                        return (
                          <ArticleCard
                            key={r._id}
                            article={r}
                            expanded={expandedArticle === r._id}
                            onToggle={() => setExpandedArticle(expandedArticle === r._id ? null : r._id)}
                            onFavorite={handleFavorite}
                            isFavorite
                          />
                        );
                      }
                      if (r.type === "coping") {
                        return <CopingCard key={r._id} item={r} onFavorite={handleFavorite} isFavorite />;
                      }
                      if (r.type === "breathing") {
                        return <BreathingCard key={r._id} exercise={r} onFavorite={handleFavorite} isFavorite />;
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {crisis.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">24/7 Crisis Support</h2>
                      <p className="text-sm text-slate-600">
                        You&apos;re not alone. Reach out anytime.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {crisis.map((r) => (
                      <CrisisCard key={r._id} resource={r} />
                    ))}
                  </div>
                </div>
              )}

              {articles.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Articles</h2>
                    <p className="text-sm text-slate-500">Read and learn at your own pace</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article._id}
                      article={article}
                      expanded={expandedArticle === article._id}
                      onToggle={() => setExpandedArticle(expandedArticle === article._id ? null : article._id)}
                      onFavorite={handleFavorite}
                      isFavorite={article.isFavorite}
                    />
                  ))}
                </div>
              </div>
              )}

              {coping.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Quick Coping Strategies</h2>
                    <p className="text-sm text-slate-500">Simple techniques when you need them</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {coping.map((item) => (
                    <CopingCard
                      key={item._id}
                      item={item}
                      onFavorite={handleFavorite}
                      isFavorite={item.isFavorite}
                    />
                  ))}
                </div>
              </div>
              )}

              {breathing.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                    <Wind className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Breathing Exercises</h2>
                    <p className="text-sm text-slate-500">Calm your nervous system in minutes</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {breathing.map((exercise) => (
                    <BreathingCard
                      key={exercise._id}
                      exercise={exercise}
                      onFavorite={handleFavorite}
                      isFavorite={exercise.isFavorite}
                    />
                  ))}
                </div>
              </div>
              )}
            </>
          )}

          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              MindCare AI is a companion, not a replacement for professional care.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
