import React, { useState, useEffect } from 'react';
import { UserState, Language } from './types';
import { TRANSLATIONS, MODULES } from './constants';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { ModuleView } from './components/ModuleView';
import { FinalReport } from './components/FinalReport';
import { Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';

const INITIAL_STATE: UserState = {
  name: '',
  dept: 'exec',
  role: 'staff',
  points: 0,
  completedModules: [],
  savedOutputs: {},
  lang: 'en',
};

export default function App() {
  const [state, setState] = useState<UserState>(INITIAL_STATE);
  const [isStarted, setIsStarted] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');

  const t = (key: string) => TRANSLATIONS[key]?.[state.lang] || key;

  const setLang = (lang: Language) => setState(prev => ({ ...prev, lang }));
  const addPoints = (pts: number) => setState(prev => ({ ...prev, points: prev.points + pts }));
  
  const saveOutput = (modKey: string, section: 'aiTutor' | 'exercise' | 'simulation', content: string) => 
    setState(prev => ({ 
      ...prev, 
      savedOutputs: { 
        ...prev.savedOutputs, 
        [modKey]: {
          ...(prev.savedOutputs[modKey] || { aiTutor: '', exercise: '', simulation: '' }),
          [section]: content
        }
      } 
    }));

  const onStart = (userData: Partial<UserState>) => {
    setState(prev => ({ ...prev, ...userData }));
    setIsStarted(true);
  };

  const onCompleteModule = (modId: number) => {
    if (!state.completedModules.includes(modId)) {
      setState(prev => ({ ...prev, completedModules: [...prev.completedModules, modId] }));
    }
    
    // Find next module
    const nextMod = MODULES.find(m => m.id === modId + 1);
    if (nextMod) {
      setCurrentPage(nextMod.key);
      window.scrollTo(0, 0);
    } else {
      setCurrentPage('report');
      window.scrollTo(0, 0);
    }
  };

  if (!isStarted) {
    return <LandingPage onStart={onStart} lang={state.lang} setLang={setLang} />;
  }

  return (
    <Layout state={state} setLang={setLang} currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {currentPage === 'overview' && (
        <div className="space-y-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 bg-primary-light text-primary">
              {t('welcome')}
            </div>
            <h2 className="text-3xl font-bold mb-2">{t('welcome')}</h2>
            <p className="text-slate-500">{t('welcomeSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" />
                {t('yourJourney')}
              </h3>
              <div className="space-y-4">
                {MODULES.map((mod, idx) => {
                  const isDone = state.completedModules.includes(mod.id);
                  const isNext = mod.id === 1 || state.completedModules.includes(mod.id - 1);
                  
                  return (
                    <div key={mod.id} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-success text-white' : isNext ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {isDone ? <CheckCircle2 size={14} /> : mod.id}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-bold ${isNext ? 'text-slate-900' : 'text-slate-400'}`}>{mod.title[state.lang]}</div>
                      </div>
                      {isNext && !isDone && (
                        <button 
                          onClick={() => setCurrentPage(mod.key)}
                          className="text-primary hover:translate-x-1 transition-transform"
                        >
                          <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                {t('yourBadges')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {MODULES.map(mod => {
                  const isEarned = state.completedModules.includes(mod.id);
                  return (
                    <div key={mod.id} className={`p-3 rounded-xl border text-center transition-all ${isEarned ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                      <div className="text-2xl mb-1">{mod.icon}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">{mod.badge[state.lang]}</div>
                      {isEarned && <div className="text-[9px] font-bold text-amber-600 mt-1">+100 PTS</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => {
                const nextMod = MODULES.find(m => !state.completedModules.includes(m.id)) || MODULES[0];
                setCurrentPage(nextMod.key);
              }}
              className="bg-primary text-white px-10 py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              {t('beginModule')} {state.completedModules.length + 1}
            </button>
          </div>
        </div>
      )}

      {MODULES.map(mod => (
        currentPage === mod.key && (
          <ModuleView 
            key={mod.id}
            module={mod}
            state={state}
            addPoints={addPoints}
            saveOutput={saveOutput}
            onComplete={() => onCompleteModule(mod.id)}
          />
        )
      ))}

      {currentPage === 'report' && (
        <FinalReport state={state} addPoints={addPoints} />
      )}
    </Layout>
  );
}
