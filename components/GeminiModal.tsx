import React, { useState, useEffect } from 'react';
import Icons from './Icon';
import { getVerseInsight } from '../services/geminiService';

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
  reference: string;
}

const GeminiModal: React.FC<GeminiModalProps> = ({ isOpen, onClose, verseText, reference }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');

  useEffect(() => {
    if (isOpen && verseText) {
      setLoading(true);
      setInsight('');
      getVerseInsight(verseText, reference)
        .then(result => {
            setInsight(result);
        })
        .finally(() => {
            setLoading(false);
        });
    }
  }, [isOpen, verseText, reference]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icons.Sparkles size={20} className="text-yellow-300" />
            IA Insight
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <Icons.X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 border-l-4 border-indigo-500 text-sm text-gray-600 dark:text-gray-300 italic">
                "{verseText}"
                <div className="mt-1 font-bold not-italic text-right text-xs uppercase text-gray-400">{reference}</div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-gray-500 animate-pulse">Gerando explicação teológica...</p>
                </div>
            ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                    {insight.split('\n').map((paragraph, idx) => (
                        paragraph.trim() && <p key={idx} className="mb-2">{paragraph}</p>
                    ))}
                </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs text-center text-gray-400">
          Insights gerados por IA (Gemini). Verifique com fontes teológicas tradicionais.
        </div>
      </div>
    </div>
  );
};

export default GeminiModal;