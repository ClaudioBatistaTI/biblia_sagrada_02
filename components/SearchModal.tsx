import React, { useState, useMemo } from 'react';
import Icons from './Icon';
import { searchBibleReferences } from '../services/geminiService';
import { SearchResult } from '../types';
import { OLD_TESTAMENT, NEW_TESTAMENT } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (result: SearchResult) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filters
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [bookFilter, setBookFilter] = useState<string>('');

  const availableBooks = useMemo(() => {
    if (testamentFilter === 'OT') return OLD_TESTAMENT;
    if (testamentFilter === 'NT') return NEW_TESTAMENT;
    return [...OLD_TESTAMENT, ...NEW_TESTAMENT];
  }, [testamentFilter]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const filters = {
        testament: testamentFilter === 'ALL' ? undefined : testamentFilter,
        book: bookFilter || undefined
      };
      
      const data = await searchBibleReferences(query, filters);
      setResults(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 sm:pt-20 p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header with Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-3 items-center mb-4">
            <Icons.Search className="text-blue-500" size={24} />
            <form onSubmit={handleSearch} className="flex-1">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por tema ou referência..."
                className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 text-lg placeholder-gray-400 font-medium"
                autoFocus
              />
            </form>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
              <Icons.X size={24} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <select
              value={testamentFilter}
              onChange={(e) => {
                setTestamentFilter(e.target.value as any);
                setBookFilter(''); // Reset book when testament changes
              }}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-1.5 px-3 rounded-full border-none outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <option value="ALL">Todo a Bíblia</option>
              <option value="OT">Antigo Testamento</option>
              <option value="NT">Novo Testamento</option>
            </select>

            <select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-1.5 px-3 rounded-full border-none outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors max-w-[150px]"
            >
              <option value="">Todos os Livros</option>
              {availableBooks.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-2 scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
               <span className="text-sm animate-pulse">Consultando a sabedoria...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                <span>Resultados Sugeridos</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">IA</span>
              </div>
              {results.map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onNavigate(res);
                    onClose();
                  }}
                  className="w-full text-left p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {res.book} {res.chapter}:{res.verse}
                    </span>
                    <Icons.ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 font-serif">
                    "{res.text}"
                  </p>
                </button>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-10 text-gray-500 flex flex-col items-center">
              <Icons.Search size={32} className="mb-2 opacity-20" />
              <p>Nenhum resultado encontrado.</p>
              <p className="text-xs mt-1 opacity-70">Tente termos mais gerais.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-full mb-3">
                 <Icons.Sparkles className="text-blue-400" size={24} />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300">Busca Inteligente</p>
              <p className="max-w-xs mx-auto mt-1 opacity-70">Digite um tema, sentimento (ex: "ansiedade") ou referência direta.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;