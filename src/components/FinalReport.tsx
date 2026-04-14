import React, { useState, useRef } from 'react';
import { UserState } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateAIContent, PROMPTS } from '../lib/gemini';
import { motion } from 'motion/react';
import { FileText, Download, Eye, Copy, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface FinalReportProps {
  state: UserState;
  addPoints: (pts: number) => void;
}

export const FinalReport: React.FC<FinalReportProps> = ({ state, addPoints }) => {
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => TRANSLATIONS[key]?.[state.lang] || key;

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const prompt = PROMPTS.finalReport(state, state.lang);
    const res = await generateAIContent(prompt, state.lang);
    setReportContent(res);
    setIsGenerating(false);
    addPoints(50);
  };

  const downloadTxt = () => {
    if (!reportContent) return;
    const element = document.createElement("a");
    const file = new Blob([reportContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `AI_Workshop_Report_${state.name || 'User'}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const downloadPdf = () => {
    if (!reportContent) return;
    
    // Create a temporary element for PDF generation to ensure formatting is preserved
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.color = '#334155';
    element.style.fontFamily = 'serif';
    element.style.fontSize = '12pt';
    element.style.lineHeight = '1.6';
    element.style.whiteSpace = 'pre-wrap';
    
    // Add a header to the PDF
    const header = document.createElement('div');
    header.style.borderBottom = '2px solid #3b82f6';
    header.style.marginBottom = '20px';
    header.style.paddingBottom = '10px';
    header.innerHTML = `
      <h1 style="color: #3b82f6; margin: 0;">${t('aiReport')}</h1>
      <p style="font-size: 10pt; color: #94a3b8; margin: 5px 0 0 0;">
        ${state.name} • ${state.dept} • ${new Date().toLocaleDateString(state.lang === 'zh' ? 'zh-TW' : 'en-US')}
      </p>
    `;
    element.appendChild(header);
    
    const content = document.createElement('div');
    content.innerText = reportContent;
    element.appendChild(content);

    const opt = {
      margin: 0.5,
      filename: `AI_Workshop_Report_${state.name || 'User'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 bg-primary-light text-primary">
          {t('finalReport')}
        </div>
        <h2 className="text-3xl font-bold mb-2">{t('finalReport')}</h2>
        <p className="text-slate-500">{t('welcomeSub')}</p>
      </div>

      {!reportContent ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-3xl mx-auto mb-6">📄</div>
          <h3 className="text-xl font-bold mb-2">{t('readyToCompile')}</h3>
          <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
            {t('compileSub')}
          </p>
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Sparkles size={20} />}
            {t('generateFinalReport')}
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap gap-3">
            <button onClick={downloadTxt} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Download size={16} />
              {t('downloadTxt')}
            </button>
            <button onClick={downloadPdf} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
              <FileText size={16} />
              {t('downloadPdf')}
            </button>
            <button onClick={() => navigator.clipboard.writeText(reportContent)} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Copy size={16} />
              {t('copy')}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-primary">{t('aiReport')}</h1>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                  {state.name} • {state.dept} • {new Date().toLocaleDateString(state.lang === 'zh' ? 'zh-TW' : 'en-US')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{state.points} {t('points')}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">{t('totalScore')}</div>
              </div>
            </div>

            <div className="p-8" ref={reportRef}>
              <textarea 
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                className="w-full min-h-[600px] focus:outline-none text-sm leading-relaxed text-slate-700 font-serif resize-none border-none bg-transparent"
                style={{ height: 'auto', minHeight: '600px' }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center text-xl">🏆</div>
              <h3 className="font-bold">{t('workshopSummary')}</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">{state.points}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">{t('pointsEarned')}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">{state.completedModules.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">{t('badgesEarned')}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">{state.completedModules.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">{t('modulesDone')}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">1</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">{t('aiReport')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
