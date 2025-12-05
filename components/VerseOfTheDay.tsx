import React, { useMemo } from 'react';
import { VERSES_OF_THE_DAY, ALL_BOOKS } from '../constants';
import { Book } from '../types';
import Icons from './Icon';

interface VerseOfTheDayProps {
  onReadMore: (book: Book, chapter: number) => void;
  onClose: () => void;
}

const VerseOfTheDay: React.FC<VerseOfTheDayProps> = ({ onReadMore, onClose }) => {
  const verse = useMemo(() => {
    // Select a verse based on the day of the year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return VERSES_OF_THE_DAY[dayOfYear % VERSES_OF_THE_DAY.length];
  }, []);

  const handleReadMore = () => {
    const book = ALL_BOOKS.find(b => b.id === verse.bookId);
    if (book) {
      onReadMore(book, verse.chapter);
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Icons.X size={16} />
            </button>
        </div>
        
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm text-yellow-500">
                <Icons.Sun size={24} />
            </div>
            <div className="flex-1">
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Versículo do Dia</h3>
                <p className="font-serif text-lg sm:text-xl text-gray-800 dark:text-gray-200 leading-relaxed italic mb-3">
                    "{verse.text}"
                </p>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{verse.reference}</span>
                    <button 
                        onClick={handleReadMore}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                        Ler capítulo <Icons.ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VerseOfTheDay;