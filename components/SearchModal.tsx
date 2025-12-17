import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Icons from './Icon';
import { searchVerses } from '../services/bibleService';
import { SearchResult, SearchSortOption } from '../types';
import { OLD_TESTAMENT, NEW_TESTAMENT, ALL_BOOKS } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (result: SearchResult) => void;
}

const ITEMS_PER_PAGE = 20; // Matches API limit

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Sort
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [bookFilter, setBookFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<SearchSortOption>('relevance');

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
        const input = document.getElementById('search-input');
        if (input) input.focus();
    }
  }, [isOpen]);

  const availableBooks = useMemo(() => {
    if (testamentFilter === 'OT') return OLD_TESTAMENT;
    if (testamentFilter === 'NT') return NEW_TESTAMENT;
    return [...OLD_TESTAMENT, ...NEW_TESTAMENT];
  }, [testamentFilter]);

  // Execute search
  const performSearch = useCallback(async (isLoadMore: boolean = false) => {
    if (!query.trim()) return;

    if (isLoadMore) {
        setLoadingMore(true);
    } else {
        setLoading(true);
        setHasSearched(true);
        setResults([]); // Clear results on new search
    }
    setError(null);

    try {
      // Calculate offset based on current results length if loading more
      const offset = isLoadMore ? results.length : 0;
      
      const newResults = await searchVerses(query, offset, sortOption);
      
      setResults(prev => isLoadMore ? [...prev, ...newResults] : newResults);
    } catch (err) {
      console.error("Search failed", err);
      setError("Não foi possível buscar. Verifique sua conexão.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, results.length, sortOption]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(false);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SearchSortOption);
    // Automatically trigger search again if query exists
    if (query && hasSearched) {
        // Use timeout to allow state to update before searching
        setTimeout(() => performSearch(false), 0);
    }
  };

  // Filter results client-side for immediate feedback on filters
  // Note: Pagination fetches more data from API, but these filters hide/show what's already fetched
  const filteredResults = useMemo(() => {
    return results.filter(result => {
        // Filter by Book Name
        if (bookFilter && result.book !== bookFilter) {
            return false;
        }

        // Filter by Testament
        if (testamentFilter !== 'ALL') {
            const bookData = ALL_BOOKS.find(b => b.name === result.book);
            if (bookData && bookData.testament !== testamentFilter) {
                return false;
            }
        }
        return true;
    });
  }, [results, bookFilter, testamentFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-4 sm:pt-10 px-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in slide-in-from-bottom-4 duration-300 border border-gray-200 dark:border-gray-800">
        
        {/* Header with Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 shrink-0">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <Icons.Sparkles className="text-blue-600" size={20} />
                Busca Inteligente
             </h2>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               <Icons.X size={20} />
             </button>
          </div>

          <div className="flex gap-2 items-center mb-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                id="search-input"
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: versículos sobre ansiedade, parábola do semeador..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-950 focus:border-blue-500 rounded-xl outline-none text-gray-800 dark:text-gray-100 text-base shadow-inner transition-all"
              />
            </form>
            <button 
                onClick={() => handleSearchSubmit()} 
                disabled={loading || !query.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
            >
                {loading ? 'Buscando...' : 'Pesquisar'}
            </button>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap gap-2 items-center">
             <div className="flex items-center gap-1 text-gray-500 mr-1">
                <Icons.Settings size={14} />
                <span className="text-xs font-medium uppercase">Filtros:</span>
             </div>
             
             {/* Sort Dropdown */}
             <select
                value={sortOption}
                onChange={handleSortChange}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
             >
                <option value="relevance">Relevância</option>
                <option value="canonical">Ordem Bíblica</option>
             </select>

             <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>

             <select
              value={testamentFilter}
              onChange={(e) => {
                setTestamentFilter(e.target.value as any);
                setBookFilter(''); // Reset book when testament changes
              }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
            >
              <option value="ALL">Toda a Bíblia</option>
              <option value="OT">Antigo Testamento</option>
              <option value="NT">Novo Testamento</option>
            </select>

            <select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:border-blue-400 transition-colors shadow-sm max-w-[120px]"
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
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
               <span className="text-sm font-medium animate-pulse text-center">
                 Pesquisando nas escrituras...<br/>
                 <span className="text-xs opacity-75">Ordenando por {sortOption === 'relevance' ? 'relevância' : 'livros'}</span>
               </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-3 text-red-500">
                    <Icons.X size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">Erro na Busca</h3>
                <p className="text-gray-500 text-sm max-w-xs">{error}</p>
                <button onClick={() => handleSearchSubmit()} className="mt-4 text-blue-600 hover:underline text-sm font-medium">Tentar novamente</button>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-3 pb-6 p-2">
              <div className="px-1 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center border-b border-gray-200 dark:border-gray-800 mb-2">
                <span>{filteredResults.length} resultados exibidos</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Icons.Sparkles size={10} /> IA Search
                </span>
              </div>
              
              {filteredResults.map((res, idx) => (
                <button
                  key={`${res.book}-${res.chapter}-${res.verse}-${idx}`}
                  onClick={() => {
                    onNavigate(res);
                    onClose();
                  }}
                  className="w-full text-left p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold text-gray-500 uppercase tracking-wide">
                            {res.book}
                        </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                            Cap. {res.chapter}:{res.verse}
                        </span>
                    </div>
                    <Icons.ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-serif opacity-90">
                    {res.text}
                  </div>
                </button>
              ))}

              {/* Pagination / Load More */}
              <div className="pt-2">
                  <button 
                    onClick={() => performSearch(true)}
                    disabled={loadingMore}
                    className="w-full py-4 text-center text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors text-sm border border-blue-100 dark:border-blue-900/30 shadow-sm flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                            Buscando mais resultados...
                        </>
                    ) : (
                        <>Carregar mais resultados <Icons.ChevronRight size={14} /></>
                    )}
                  </button>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3 opacity-50">
                  <Icons.Search size={32} />
              </div>
              <p className="font-medium text-lg">Nenhum resultado encontrado.</p>
              <p className="text-sm mt-1 opacity-70 max-w-xs">Tente termos diferentes ou mude os filtros.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
              <Icons.Sparkles size={48} className="text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Busca Inteligente</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2">
                Digite um tema (ex: "ansiedade", "fé") ou palavras-chave. 
                Use os filtros acima para ordenar por relevância ou ordem bíblica.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;