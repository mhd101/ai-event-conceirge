'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Sparkles, Building, Loader2, Clock, CalendarDays, ExternalLink, ChevronRight, Trash2 } from 'lucide-react';

interface Proposal {
  venueName: string;
  location: string;
  estimatedCost: string;
  costBreakdown?: { item: string; cost: string }[];
  justification: string;
}

interface SearchHistory {
  _id: string;
  prompt: string;
  proposal: Proposal;
  createdAt: string;
}

const LOADING_PHRASES = [
  "AI is planning...",
  "Searching prime locations...",
  "Reviewing budget constraints...",
  "Drafting the perfect proposal..."
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [currentResult, setCurrentResult] = useState<SearchHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Animate loader text but stop at the last phrase
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => Math.min(prev + 1, LOADING_PHRASES.length - 1));
      }, 1500); // Wait 1.5 seconds per phrase
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.searches || []);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
        if (currentResult?._id === id) {
          setCurrentResult(null);
        }
      }
    } catch (err) {
      console.error('Error deleting result', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setLoadingTextIndex(0);
    setError(null);
    setCurrentResult(null);

    const startTime = Date.now();
    const MINIMUM_LOAD_TIME = LOADING_PHRASES.length * 1500; // 6 seconds total

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate proposal');
      }

      // Ensure we've shown all loading phrases perfectly smoothly
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MINIMUM_LOAD_TIME) {
        await new Promise(resolve => setTimeout(resolve, MINIMUM_LOAD_TIME - elapsedTime));
      }

      const resultObj = {
        _id: data.id,
        prompt: data.prompt,
        proposal: data.proposal,
        createdAt: data.createdAt,
      };

      setCurrentResult(resultObj);
      setHistory(prev => [resultObj, ...prev]);
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderProposalCard = (item: SearchHistory, isFeatured = false) => {
    const { proposal, prompt, createdAt } = item;
    return (
      <div key={item._id} className={`group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${isFeatured ? 'p-6 md:p-8 ring-1 ring-zinc-900/5 dark:ring-white/10' : 'p-6'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/50 to-white/10 dark:from-zinc-900/50 dark:to-zinc-950/10 rounded-2xl -z-10" />

        <div className="flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Prompt / Request</h4>
              <div className="flex items-center gap-2">
                {!isFeatured && (
                  <div className="flex items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(createdAt).toLocaleDateString()}
                  </div>
                )}
                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20 shadow-sm"
                  title="Delete Result"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[15px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">"{prompt}"</p>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 shadow-sm">
                <Building className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{proposal.venueName}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400 gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{proposal.location}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proposal.venueName + " " + proposal.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 text-xs font-semibold shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:scale-105 active:scale-95"
                    title="View on Google Maps"
                  >
                    Maps
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white/50 dark:bg-zinc-950/50 shadow-sm group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors duration-500">
              <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 p-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                  <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{proposal.estimatedCost}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Estimated Cost</span>
              </div>

              {proposal.costBreakdown && proposal.costBreakdown.length > 0 && (
                <div className="p-5 bg-white/60 dark:bg-zinc-950/60">
                  <div className="space-y-3">
                    {proposal.costBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium">{item.item}</span>
                        <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{item.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-[0.03] dark:opacity-[0.05]">
                <Sparkles className="w-32 h-32 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h4 className="text-sm font-bold tracking-tight mb-2.5 text-zinc-900 dark:text-zinc-100 flex items-center gap-2 relative z-10">
                <Sparkles className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                Why it fits
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium relative z-10">
                {proposal.justification}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 relative">
      {/* Rich Background Grid without colored glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 pt-24 pb-16 md:pt-32 relative z-10">
        <header className="mb-14 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10">
            <CalendarDays className="h-7 w-7 text-zinc-900 dark:text-zinc-100" />
          </div>
          <h1 className="mb-5 text-5xl font-extrabold tracking-tighter lg:text-7xl">
            <span className="bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 bg-clip-text text-transparent">AI Event Concierge</span>
          </h1>
          <p className="max-w-[42rem] mx-auto text-lg font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-xl sm:leading-8">
            Describe your ideal team retreat, and our AI will coordinate the perfect venue, location, and cost estimations.
          </p>
        </header>

        <form onSubmit={handleSearch} className="mx-auto max-w-2xl mb-20 space-y-5 group relative">
          <div className="relative shadow-sm transition-all duration-500 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-white/10 rounded-xl bg-white dark:bg-zinc-950">
            <Search className="absolute left-4 top-4 h-6 w-6 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A 10-person leadership retreat in the mountains..."
              disabled={loading}
              className="flex h-14 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent pl-14 pr-36 py-2 text-[17px] font-medium ring-offset-white dark:ring-offset-zinc-950 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 inline-flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50 px-6 text-sm font-bold text-white dark:text-zinc-900 shadow-md transition-all duration-300 hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  Generate
                  <span className="hidden sm:inline"><Sparkles className="h-4 w-4 ml-0.5 text-zinc-300 dark:text-zinc-600" /></span>
                </span>
              )}
            </button>
          </div>

          <div className={`flex justify-center transition-all duration-500 ${loading ? 'opacity-100 h-14 translate-y-0' : 'opacity-0 h-0 -translate-y-4 overflow-hidden'}`}>
            {loading && (
              <div className="mt-4 inline-flex h-10 items-center justify-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-5 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-900 dark:text-zinc-100" />
                <div className="relative h-5 w-[220px] overflow-hidden">
                  <span
                    key={loadingTextIndex}
                    className="absolute left-0 top-0 flex h-full items-center text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap"
                  >
                    {LOADING_PHRASES[loadingTextIndex]}
                  </span>
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-sm font-semibold text-red-500 dark:text-red-400 text-center">{error}</p>}
        </form>

        <div className="mx-auto max-w-3xl space-y-16">
          {currentResult && (
            <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Your Custom Proposal
                </h2>
              </div>
              {renderProposalCard(currentResult, true)}
            </section>
          )}

          {history.length > 0 && (
            <section className="animate-in fade-in duration-1000 delay-300 fill-mode-both">
              <div className="mb-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mt-8">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-zinc-400" />
                  Past Explorations
                </h2>
              </div>
              <div className="grid gap-8">
                {history.map(item => (
                  <div key={item._id}>
                    {renderProposalCard(item)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
