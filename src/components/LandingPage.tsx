import React, { useState } from 'react';
import { Language, UserState } from '../types';
import { TRANSLATIONS, MODULES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onStart: (userData: Partial<UserState>) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, lang, setLang }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [dept, setDept] = useState('exec');
  const [role, setRole] = useState('staff');

  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-br from-[#f0f4ff] via-[#fff8f0] to-[#f0fff8] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-radial from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-[400px] h-[400px] rounded-full bg-radial from-accent/5 to-transparent pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center text-center max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary/20">
          🎓 <span>National Chung Hsing University · Executive Office</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          <span className="block text-slate-900">{t('landingTitle')}</span>
          <span className="block text-primary font-sans">{t('landingSubtitle')}</span>
        </h1>

        <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
          {t('landingDescription')}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {MODULES.map(mod => (
            <div key={mod.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm min-w-[180px]">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl" style={{ background: mod.lightColor }}>
                {mod.icon}
              </div>
              <span className="text-sm font-semibold">{mod.title[lang]}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-8 py-3.5 rounded-xl text-lg font-bold hover:bg-primary-dark transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
          >
            {t('startLearning')}
          </button>
          
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setLang('en')}
              className={`px-5 py-2.5 text-sm font-semibold transition-all ${lang === 'en' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang('zh')}
              className={`px-5 py-2.5 text-sm font-semibold transition-all ${lang === 'zh' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              中文
            </button>
          </div>
        </div>
      </motion.div>

      {/* Personalization Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10"
            >
              <h2 className="text-2xl font-bold mb-2">{t('personalizeTitle')}</h2>
              <p className="text-slate-500 text-sm mb-6">{t('personalizeSub')}</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('yourName')}</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('enterName')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('department')}</label>
                  <select 
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="legal">{t('deptLegal')}</option>
                    <option value="research">{t('deptResearch')}</option>
                    <option value="media">{t('deptMedia')}</option>
                    <option value="exec">{t('deptExec')}</option>
                    <option value="hr">{t('deptHR')}</option>
                    <option value="academic">{t('deptAcademic')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('role')}</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="staff">{t('roleStaff')}</option>
                    <option value="section">{t('roleSection')}</option>
                    <option value="director">{t('roleDirector')}</option>
                    <option value="specialist">{t('roleSpecialist')}</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => onStart({ name, dept, role })}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all"
              >
                {t('startWorkshop')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
