import React, { useState } from 'react';
import { Language, ModuleData, UserState } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateAIContent, PROMPTS } from '../lib/gemini';
import { motion } from 'motion/react';
import { Sparkles, Brain, Gamepad2, Zap, Copy, Save, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModuleViewProps {
  module: ModuleData;
  state: UserState;
  addPoints: (pts: number) => void;
  saveOutput: (modKey: string, section: 'aiTutor' | 'exercise' | 'simulation', content: string) => void;
  onComplete: () => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({ module, state, addPoints, saveOutput, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'concept' | 'ai' | 'exercise' | 'sim'>('concept');
  const [aiResponse, setAiResponse] = useState<string>(state.savedOutputs[module.key]?.aiTutor || '');
  const [simInput, setSimInput] = useState('');
  const [simOutput, setSimOutput] = useState<string>(state.savedOutputs[module.key]?.simulation || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exerciseFeedback, setExerciseFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const t = (key: string) => TRANSLATIONS[key]?.[state.lang] || key;

  const handleAIQuestion = async (qKey: string) => {
    setIsGenerating(true);
    const moduleTitle = module.title[state.lang];
    const prompt = PROMPTS.aiTutor(moduleTitle, qKey, state.lang);
    const res = await generateAIContent(prompt, state.lang);
    setAiResponse(res);
    saveOutput(module.key, 'aiTutor', res);
    setIsGenerating(false);
    addPoints(5);
  };

  const handleSimulate = async () => {
    if (!simInput.trim()) return;
    setIsGenerating(true);
    const promptFn = (PROMPTS as any)[module.key];
    const prompt = promptFn(simInput, state.lang);
    const res = await generateAIContent(prompt, state.lang);
    setSimOutput(res);
    saveOutput(module.key, 'simulation', res);
    setIsGenerating(false);
    addPoints(20);
  };

  const handleSave = () => {
    saveOutput(module.key, 'simulation', simOutput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    addPoints(5);
  };

  const handleImprove = async () => {
    if (!simOutput.trim()) return;
    setIsGenerating(true);
    const prompt = PROMPTS.improve(simOutput, state.lang);
    const res = await generateAIContent(prompt, state.lang);
    setSimOutput(res);
    saveOutput(module.key, 'simulation', res);
    setIsGenerating(false);
    addPoints(5);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: module.lightColor, color: module.color }}>
          Module {module.id}
        </div>
        <h2 className="text-3xl font-bold mb-2">{module.title[state.lang]}</h2>
        <p className="text-slate-500">{module.description[state.lang]}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'concept', label: t('concept'), icon: <Sparkles size={16} /> },
          { id: 'ai', label: t('aiTutor'), icon: <Brain size={16} /> },
          { id: 'exercise', label: t('exercise'), icon: <Gamepad2 size={16} /> },
          { id: 'sim', label: t('simulation'), icon: <Zap size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'concept' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-xl text-sm leading-relaxed text-slate-700">
              {module.key === 'm1' && (state.lang === 'zh' ? 'AI 可以比人工審查快 10 倍地分析合約語言，在簽署前標記模糊條款、缺失條款和法律風險。' : 'AI can analyze contract language 10x faster than manual review, flagging vague terms, missing clauses, and legal risks before signing.')}
              {module.key === 'm2' && (state.lang === 'zh' ? 'USR（大學社會責任）需要量化影響力。AI可在幾分鐘內將敘述性活動轉化為SROI比率、SDG對齊和ESG指標。' : 'USR requires quantifying impact. AI helps convert narrative activities into SROI ratios, SDG alignments, and ESG metrics in minutes.')}
              {module.key === 'm3' && (state.lang === 'zh' ? 'AI驅動的媒體策略幫助大學製作獲得3倍參與度的標題，在幾秒鐘內生成新聞稿，並預測哪些故事會走紅。' : 'AI-powered media strategy gets 3× more engagement and generates press releases in seconds.')}
              {module.key === 'm4' && (state.lang === 'zh' ? '大學每天面臨聲譽風險。AI驅動的情緒監測在幾分鐘內（而非幾小時）偵測危機，讓您在問題升級之前有時間應對。' : 'Universities face reputational risks daily. AI detects crises within minutes — not hours.')}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="text-primary">01</span>
                  {state.lang === 'zh' ? '核心概念' : 'Core Concept'}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {state.lang === 'zh' ? '了解 AI 如何在您的特定領域中發揮作用，從自動化到深度分析。' : 'Learn how AI functions in your specific domain, from automation to deep analysis.'}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <span className="text-primary">02</span>
                  {state.lang === 'zh' ? '實踐應用' : 'Practical Application'}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {state.lang === 'zh' ? '將理論轉化為實際工作中的工具，提升效率並減少錯誤。' : 'Turn theory into actual workplace tools, boosting efficiency and reducing errors.'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('ai')}
              className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
            >
              {t('nextAiTutor')} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-xl">🤖</div>
                <div>
                  <h3 className="font-bold">{t('aiTutor')}</h3>
                  <p className="text-xs text-slate-500">{t('askAiQuestion')}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { id: 'q1', en: 'What are the main benefits of AI in this area?', zh: 'AI 在這個領域的主要優勢是什麼？' },
                  { id: 'q2', en: 'How do I write a good prompt for this task?', zh: '我該如何為這項任務撰寫好的提示詞？' },
                  { id: 'q3', en: 'What are the common pitfalls to avoid?', zh: '有哪些常見的陷阱需要避免？' },
                ].map(q => (
                  <button
                    key={q.id}
                    onClick={() => handleAIQuestion(q.en)}
                    className="text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary-light/30 transition-all text-sm font-medium"
                  >
                    ❓ {q[state.lang]}
                  </button>
                ))}
              </div>

              {aiResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('aiOutputEditable')}</label>
                    <button onClick={() => navigator.clipboard.writeText(aiResponse)} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Copy"><Copy size={16} /></button>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-3 left-6 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-primary border border-primary/20 z-10">{t('aiResponse')}</div>
                    <textarea 
                      value={aiResponse}
                      onChange={(e) => {
                        setAiResponse(e.target.value);
                        saveOutput(module.key, 'aiTutor', e.target.value);
                      }}
                      className="w-full h-48 p-5 bg-primary-light/50 border border-primary/10 rounded-2xl text-sm leading-relaxed text-slate-700 focus:outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}
              
              {isGenerating && !aiResponse && (
                <div className="mt-6 flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setActiveTab('exercise')}
              className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
            >
              {t('nextExercise')} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {activeTab === 'exercise' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Gamepad2 size={20} className="text-accent" />
                {t('exercise')}
              </h3>
              
              {module.key === 'm1' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl">
                    <p className="font-medium text-sm mb-4">
                      {state.lang === 'zh' ? '以下哪個合約條款對大學造成最高的法律風險？' : 'Which of these contract clauses presents the HIGHEST legal risk for the university?'}
                    </p>
                    <div className="grid gap-2">
                      {[
                        { id: 'a', correct: false, en: '"Payment shall be made within 30 days of invoice date"', zh: '「付款應在發票日期後30天內完成」' },
                        { id: 'b', correct: true, en: '"The university accepts all liability for any losses arising from this agreement"', zh: '「大學接受因本協議產生的任何損失的全部責任」' },
                        { id: 'c', correct: false, en: '"Both parties agree to a 30-day termination notice period"', zh: '「雙方同意30天終止通知期」' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            const feedback = opt.correct ? 'Correct! +15 points' : 'Try again!';
                            setExerciseFeedback({ correct: opt.correct, msg: feedback });
                            const output = `Question: ${state.lang === 'zh' ? '以下哪個合約條款對大學造成最高的法律風險？' : 'Which of these contract clauses presents the HIGHEST legal risk for the university?'}\nSelected: ${opt[state.lang]}\nResult: ${feedback}`;
                            saveOutput(module.key, 'exercise', output);
                            if (opt.correct) addPoints(15);
                          }}
                          className={cn(
                            "text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium flex items-center gap-3",
                            exerciseFeedback?.correct && opt.correct ? "bg-success-light border-success text-success" : "bg-white border-slate-200 hover:border-primary"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            exerciseFeedback?.correct && opt.correct ? "bg-success text-white" : "bg-slate-100 text-slate-500"
                          )}>{opt.id.toUpperCase()}</div>
                          <span>{opt[state.lang]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {module.key === 'm2' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl">
                    <p className="font-medium text-sm mb-4">
                      {state.lang === 'zh' ? '一位教授開展了社區農業計畫，教授80位農民現代技術。哪個指標最能捕捉此影響？' : 'A professor ran a community agriculture program, teaching 80 farmers modern techniques. Which metric best captures this impact?'}
                    </p>
                    <div className="grid gap-2">
                      {[
                        { id: 'a', correct: false, en: 'Hours of Training', zh: '培訓小時數' },
                        { id: 'b', correct: true, en: 'SROI Calculation (80 farmers × yield gain)', zh: 'SROI 計算 (80位農民 × 產量增加)' },
                        { id: 'c', correct: false, en: 'Attendance Rate', zh: '出席率' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            const feedback = opt.correct ? 'Correct! +15 points' : 'Try again!';
                            setExerciseFeedback({ correct: opt.correct, msg: feedback });
                            const output = `Question: ${state.lang === 'zh' ? '一位教授開展了社區農業計畫，教授80位農民現代技術。哪個指標最能捕捉此影響？' : 'A professor ran a community agriculture program, teaching 80 farmers modern techniques. Which metric best captures this impact?'}\nSelected: ${opt[state.lang]}\nResult: ${feedback}`;
                            saveOutput(module.key, 'exercise', output);
                            if (opt.correct) addPoints(15);
                          }}
                          className={cn(
                            "text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium flex items-center gap-3",
                            exerciseFeedback?.correct && opt.correct ? "bg-success-light border-success text-success" : "bg-white border-slate-200 hover:border-primary"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            exerciseFeedback?.correct && opt.correct ? "bg-success text-white" : "bg-slate-100 text-slate-500"
                          )}>{opt.id.toUpperCase()}</div>
                          <span>{opt[state.lang]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {module.key === 'm3' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl">
                    <p className="font-medium text-sm mb-4">
                      {state.lang === 'zh' ? '哪個標題會為大學研究公告產生最多媒體參與度？' : 'Which headline would generate the most media engagement for a university research announcement?'}
                    </p>
                    <div className="grid gap-2">
                      {[
                        { id: 'a', correct: false, en: '"Professor Chen Publishes Paper"', zh: '「陳教授發表論文」' },
                        { id: 'b', correct: true, en: '"How Taiwan Scientists Cut Pesticide Use by 40%"', zh: '「台灣科學家如何將農藥使用減少40%」' },
                        { id: 'c', correct: false, en: '"NCHU Research Department Announces Results"', zh: '「中興大學研究部門公布結果」' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            const feedback = opt.correct ? 'Correct! +15 points' : 'Try again!';
                            setExerciseFeedback({ correct: opt.correct, msg: feedback });
                            const output = `Question: ${state.lang === 'zh' ? '哪個標題會為大學研究公告產生最多媒體參與度？' : 'Which headline would generate the most media engagement for a university research announcement?'}\nSelected: ${opt[state.lang]}\nResult: ${feedback}`;
                            saveOutput(module.key, 'exercise', output);
                            if (opt.correct) addPoints(15);
                          }}
                          className={cn(
                            "text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium flex items-center gap-3",
                            exerciseFeedback?.correct && opt.correct ? "bg-success-light border-success text-success" : "bg-white border-slate-200 hover:border-primary"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            exerciseFeedback?.correct && opt.correct ? "bg-success text-white" : "bg-slate-100 text-slate-500"
                          )}>{opt.id.toUpperCase()}</div>
                          <span>{opt[state.lang]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {module.key === 'm4' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl">
                    <p className="font-medium text-sm mb-4">
                      {state.lang === 'zh' ? '一則病毒式帖子聲稱大學食品供應商導致學生食物中毒。第一步應採取什麼行動？' : 'A viral post claims a university food vendor caused food poisoning. What is the FIRST action?'}
                    </p>
                    <div className="grid gap-2">
                      {[
                        { id: 'a', correct: false, en: 'Delete the post', zh: '刪除帖子' },
                        { id: 'b', correct: true, en: 'Verify facts and publish acknowledgment', zh: '核實事實並發布確認聲明' },
                        { id: 'c', correct: false, en: 'Wait and see', zh: '靜觀其變' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            const feedback = opt.correct ? 'Correct! +15 points' : 'Try again!';
                            setExerciseFeedback({ correct: opt.correct, msg: feedback });
                            const output = `Question: ${state.lang === 'zh' ? '一則病毒式帖子聲稱大學食品供應商導致學生食物中毒。第一步應採取什麼行動？' : 'A viral post claims a university food vendor caused food poisoning. What is the FIRST action?'}\nSelected: ${opt[state.lang]}\nResult: ${feedback}`;
                            saveOutput(module.key, 'exercise', output);
                            if (opt.correct) addPoints(15);
                          }}
                          className={cn(
                            "text-left px-4 py-3 rounded-lg border transition-all text-sm font-medium flex items-center gap-3",
                            exerciseFeedback?.correct && opt.correct ? "bg-success-light border-success text-success" : "bg-white border-slate-200 hover:border-primary"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            exerciseFeedback?.correct && opt.correct ? "bg-success text-white" : "bg-slate-100 text-slate-500"
                          )}>{opt.id.toUpperCase()}</div>
                          <span>{opt[state.lang]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

                {exerciseFeedback && (
                  <div className={cn(
                    "mt-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2",
                    exerciseFeedback.correct ? "bg-success-light text-success" : "bg-danger-light text-danger"
                  )}>
                    {exerciseFeedback.correct ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {exerciseFeedback.msg}
                  </div>
                )}
            </div>

            <button 
              onClick={() => setActiveTab('sim')}
              className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
            >
              {t('nextSimulation')} <ChevronRight size={16} />
            </button>
          </div>
        )}

        {activeTab === 'sim' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                {t('simulation')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('yourInput')}</label>
                  <textarea 
                    value={simInput}
                    onChange={(e) => setSimInput(e.target.value)}
                    placeholder={state.lang === 'zh' ? '在這裡輸入您的案例內容...' : 'Enter your case content here...'}
                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm"
                  />
                </div>

                <button 
                  onClick={handleSimulate}
                  disabled={isGenerating || !simInput.trim()}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Zap size={16} />}
                  {t('analyzeAI')}
                </button>

                {simOutput && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{t('aiOutputEditable')}</label>
                      <div className="flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(simOutput)} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Copy"><Copy size={16} /></button>
                        <button onClick={handleImprove} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Improve"><Sparkles size={16} /></button>
                      </div>
                    </div>
                    <textarea 
                      value={simOutput}
                      onChange={(e) => {
                        setSimOutput(e.target.value);
                        saveOutput(module.key, 'simulation', e.target.value);
                      }}
                      className="w-full h-64 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all text-sm font-mono leading-relaxed"
                    />
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleSave}
                        className="bg-accent text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
                      >
                        <Save size={16} />
                        {t('saveReport')}
                      </button>
                      {isSaved && <span className="text-success text-xs font-bold animate-pulse">{t('saved')}</span>}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="bg-linear-to-r from-primary to-purple-600 p-6 rounded-2xl text-white text-center">
              <h3 className="text-xl font-bold mb-2">🏆 {t('moduleComplete')}</h3>
              <p className="text-sm opacity-90 mb-4">{t('earnedBadge')} {module.badge[state.lang]} {t('badgeSuffix')}</p>
              <button 
                onClick={onComplete}
                className="bg-white text-primary px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                {t('completeModule')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
