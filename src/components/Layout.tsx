import React from 'react';
import { UserState, Language } from '../types';
import { TRANSLATIONS, MODULES } from '../constants';
import { LayoutDashboard, FileText, CheckCircle2, Globe, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  state: UserState;
  setLang: (lang: Language) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ state, setLang, currentPage, setCurrentPage, children }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[state.lang] || key;
  const progress = Math.round((state.completedModules.length / 4) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-50 shadow-sm">
        <div className="font-bold text-lg text-primary whitespace-nowrap">AI Workshop</div>
        
        <div className="flex-1 max-w-md hidden md:block">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{t('progress')}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-primary to-blue-400 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-amber-200 flex items-center gap-1.5">
            <Trophy size={16} />
            <span>{state.points} {t('points')}</span>
          </div>
          
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            <button 
              onClick={() => setLang('en')}
              className={cn(
                "px-3 py-1 text-xs font-medium transition-colors",
                state.lang === 'en' ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-200"
              )}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('zh')}
              className={cn(
                "px-3 py-1 text-xs font-medium transition-colors",
                state.lang === 'zh' ? "bg-primary text-white" : "text-slate-500 hover:bg-slate-200"
              )}
            >
              中文
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-col py-6 px-4 gap-1 hidden md:flex">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Workshop</div>
          <button 
            onClick={() => setCurrentPage('overview')}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              currentPage === 'overview' ? "bg-primary-light text-primary" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard size={18} />
            <span>{t('overview')}</span>
          </button>

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">Modules</div>
          {MODULES.map((mod) => {
            const isLocked = mod.id > 1 && !state.completedModules.includes(mod.id - 1);
            const isDone = state.completedModules.includes(mod.id);
            const isActive = currentPage === mod.key;

            return (
              <button
                key={mod.id}
                disabled={isLocked}
                onClick={() => setCurrentPage(mod.key)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                  isActive ? "bg-primary-light text-primary" : "text-slate-600 hover:bg-slate-50",
                  isLocked && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="text-lg">{mod.icon}</span>
                <span className="flex-1 text-left truncate">{mod.title[state.lang]}</span>
                {isDone && <CheckCircle2 size={14} className="text-success" />}
              </button>
            );
          })}

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mt-6 mb-2">Output</div>
          <button 
            disabled={state.completedModules.length < 4}
            onClick={() => setCurrentPage('report')}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              currentPage === 'report' ? "bg-primary-light text-primary" : "text-slate-600 hover:bg-slate-50",
              state.completedModules.length < 4 && "opacity-40 cursor-not-allowed"
            )}
          >
            <FileText size={18} />
            <span>{t('finalReport')}</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
