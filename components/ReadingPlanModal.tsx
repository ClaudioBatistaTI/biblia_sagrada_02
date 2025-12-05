import React from 'react';
import { ReadingPlan, Book } from '../types';
import { ALL_BOOKS } from '../constants';
import Icons from './Icon';

interface ReadingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: ReadingPlan[];
  completedDays: number[];
  onToggleDay: (day: number) => void;
  onNavigate: (book: Book, chapter: number) => void;
}

const ReadingPlanModal: React.FC<ReadingPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  plans, 
  completedDays, 
  onToggleDay,
  onNavigate 
}) => {
  if (!isOpen) return null;

  // Assuming single plan for now
  const activePlan = plans[0];
  const progress = Math.round((completedDays.length / activePlan.totalDays) * 100);

  const handleRead = (bookId: string, chapter: number) => {
      const book = ALL_BOOKS.find(b => b.id === bookId);
      if (book) {
          onNavigate(book, chapter);
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icons.Calendar size={24} />
                    {activePlan.title}
                </h2>
                <p className="text-teal-100 mt-1">{activePlan.description}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <Icons.X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
              <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Seu Progresso</span>
                  <span>{progress}%</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
              </div>
          </div>
        </div>

        {/* Days List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePlan.days.map((day) => {
                    const isCompleted = completedDays.includes(day.day);
                    return (
                        <div 
                            key={day.day}
                            className={`p-3 rounded-lg border transition-all ${
                                isCompleted 
                                ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' 
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Dia {day.day}</span>
                                <button 
                                    onClick={() => onToggleDay(day.day)}
                                    className={`transition-colors ${isCompleted ? 'text-teal-500' : 'text-gray-300 hover:text-teal-500'}`}
                                >
                                    <Icons.CheckCircle size={20} fill={isCompleted ? "currentColor" : "none"} />
                                </button>
                            </div>
                            <div className="space-y-1">
                                {day.readings.map((reading, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleRead(reading.bookId, reading.chapter)}
                                        className="block w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                    >
                                        {reading.bookName} {reading.chapter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingPlanModal;