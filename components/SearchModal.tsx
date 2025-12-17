
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Icons from './Icon';
import { searchVerses } from '../services/bibleService';
import { performDeepBibleSearch } from '../services/geminiService';
import { SearchResult, SearchSortOption } from '../types';
import { ALL_BOOKS } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (result: SearchResult) => void;
}

const ITEMS_PER_LOAD = 30;

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'LITERAL' | 'AI'>('LITERAL');
  const [sortOption, setSortOption] = useState<SearchSortOption>('canonical');
  
  // Results
  const [literalResults, setLiteralResults] = useState<SearchResult[]>([]);
  const [aiResponse, setAiResponse] = useState<{text: string, sources: {title: string, uri: string}[] } | null>(null);
  
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        document.getElementById('search-input')?.focus();
    }
  }, [isOpen]);

  const performSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return;

    setLoading(true);
    setHasSearched(true);
    setError(null);
    setDisplayCount(ITEMS_PER_LOAD);

    try {
      if (searchMode === 'LITERAL') {
        const results = await searchVerses(cleanQuery);
        setLiteralResults(results);
        setAiResponse(null);
      } else {
        const aiData = await performDeepBibleSearch(cleanQuery);
        setAiResponse(aiData);
        setLiteralResults([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao realizar busca.");
    } finally {
      setLoading(false);
    }
  }, [query, searchMode]);

  // Sorting logic for literal results
  const sortedLiteralResults = useMemo(() => {
    if (sortOption === 'canonical') return literalResults;
    // Simple relevance: entries where query matches more closely to the start or is exact
    return [...literalResults].sort((a, b) => {
        const aVal = a.text.toLowerCase().indexOf(query.toLowerCase());
        const bVal = b.text.toLowerCase().indexOf(query.toLowerCase());
        if (aVal === bVal) return 0;
        if (aVal === -1) return 1;
        if (bVal === -1) return -1;
        return aVal - bVal;
    });
  }, [literalResults, sortOption, query]);

  const displayedResults = useMemo(() => {
    return sortedLiteralResults.slice(0, displayCount);
  }, [sortedLiteralResults, displayCount]);

  const handleLoadMore = () => setDisplayCount(prev => prev + ITEMS_PER_LOAD);

  // Helper to parse potential bible references in AI text and make them clickable
  const renderAIContent = (text: string) => {
    // Regex for: BookName Chapter:Verse (e.g., João 3:16, 1 Coríntios 13:1)
    const refRegex = /([1-3]?\s?[A-Z][a-zà-ÿ]+)\s+(\d+):(\d+)/g;
    
    const parts = text.split(refRegex);
    const elements: React.ReactNode[] = [];
    
    let i = 0;
    while (i < parts.length) {
      if (i % 4 === 0) {
        elements.push(parts[i]);
        i++;
      } else {
        const bookName = parts[i];
        const chapter = parseInt(parts[i+1]);
        const verse = parseInt(parts[i+2]);
        
        elements.push(
          <button
            key={i}
            onClick={() => onNavigate({ book: bookName, chapter, verse, text: '' })}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            {bookName} {chapter}:{verse}
          </button>
        );
        i += 3;
      }
    }
    
    return <div className="whitespace-pre-wrap">{elements}</div>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-2 sm:pt-8 px-2 sm:px-4 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-[85vh] animate-in slide-in-from-bottom-4 border border-gray-200 dark:border-gray-800">
        
        {/* Header Section */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl shadow-sm ${searchMode === 'AI' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                    {searchMode === 'AI' ? <Icons.Sparkles size={24} /> : <Icons.Search size={24} />}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Busca Bíblica Avançada</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by Gemini AI Grounding</p>
                </div>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               <Icons.X size={24} />
             </button>
          </div>

          <form onSubmit={performSearch} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <input 
                id="search-input"
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchMode === 'AI' ? "Ex: O que Jesus disse sobre ansiedade?" : "Ex: palavra, frase..."}
                className="w-full pl-6 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 rounded-2xl outline-none text-gray-800 dark:text-gray-100 text-lg shadow-inner transition-all"
              />
            </div>
            <button 
                type="submit"
                disabled={loading || query.length < 2}
                className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 text-white ${searchMode === 'AI' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {loading ? 'Buscando...' : 'Pesquisar'}
            </button>
          </form>

          {/* Search Mode & Sort Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                    onClick={() => setSearchMode('LITERAL')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${searchMode === 'LITERAL' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}
                >
                    <Icons.FileText size={14} /> Texto Literal
                </button>
                <button 
                    onClick={() => setSearchMode('AI')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${searchMode === 'AI' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600' : 'text-gray-500'}`}
                >
                    <Icons.Sparkles size={14} /> Estudo & Contexto (IA)
                </button>
             </div>

             {searchMode === 'LITERAL' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Ordenar:</span>
                    <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                    >
                        <option value="canonical">Ordem Bíblica</option>
                        <option value="relevance">Mais Relevantes</option>
                    </select>
                </div>
             )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 scroll-smooth">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <div className={`relative w-20 h-20 mb-6`}>
                    <div className={`absolute inset-0 animate-spin rounded-full border-4 border-gray-100 ${searchMode === 'AI' ? 'border-t-purple-600' : 'border-t-blue-600'}`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {searchMode === 'AI' ? <Icons.Sparkles className="text-purple-600 animate-pulse" size={30} /> : <Icons.Search className="text-blue-600" size={30} />}
                    </div>
               </div>
               <p className="text-lg font-bold text-gray-700 dark:text-gray-300 animate-pulse">Sondando as escrituras...</p>
               <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos no modo IA.</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 px-6 max-w-md mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4 inline-block text-red-500"><Icons.X size={40} /></div>
                <h3 className="text-xl font-bold mb-2">Ops! Falha na Busca</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => performSearch()} className="px-6 py-2 bg-gray-800 text-white rounded-lg font-bold">Tentar novamente</button>
            </div>
          ) : searchMode === 'AI' && aiResponse ? (
            <div className="max-w-3xl mx-auto space-y-8 py-4">
                <div className="bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-purple-600 mb-6">
                        <Icons.Sparkles size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Resposta Grounded por IA</span>
                    </div>
                    <div className="prose dark:prose-invert prose-purple max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-serif text-lg">
                        {renderAIContent(aiResponse.text)}
                    </div>
                </div>

                {/* Grounding Sources */}
                {aiResponse.sources.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Icons.Share2 size={16} className="text-gray-400" />
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Fontes Bibliográficas e Digitais</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {aiResponse.sources.map((source, i) => (
                                <a 
                                    key={i} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm transition-all flex items-center gap-4"
                                >
                                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 transition-colors">
                                        <Icons.Crosshair size={20} className="text-gray-400 group-hover:text-purple-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold truncate text-gray-800 dark:text-gray-200">{source.title}</div>
                                        <div className="text-[10px] text-gray-400 truncate uppercase tracking-tighter">{new URL(source.uri).hostname}</div>
                                    </div>
                                    <Icons.Share2 size={14} className="text-gray-300 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          ) : literalResults.length > 0 ? (
            <div className="space-y-4 max-w-3xl mx-auto pb-12">
                <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-md py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                    <span>{literalResults.length} ocorrências exatas</span>
                    <span>Modo Concordância</span>
                </div>
                
                {displayedResults.map((res, idx) => (
                    <button
                        key={`${res.book}-${res.chapter}-${res.verse}-${idx}`}
                        onClick={() => { onNavigate(res); onClose(); }}
                        className="w-full text-left p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-transparent hover:border-blue-400 hover:shadow-xl transition-all group animate-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                    {res.book}
                                </span>
                                <span className="font-black text-gray-800 dark:text-gray-200 text-lg">
                                    {res.chapter}:{res.verse}
                                </span>
                            </div>
                            <Icons.ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-serif text-lg">
                            {res.text.split(new RegExp(`(${query})`, 'gi')).map((part, i) => 
                                part.toLowerCase() === query.toLowerCase() 
                                ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-inherit font-bold px-0.5 rounded border-b-2 border-yellow-400 dark:border-yellow-600">{part}</mark> 
                                : part
                            )}
                        </p>
                    </button>
                ))}

                {literalResults.length > displayCount && (
                    <button 
                        onClick={handleLoadMore}
                        className="w-full py-6 text-center text-blue-600 dark:text-blue-400 font-black hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-3xl transition-all border-2 border-dashed border-gray-200 dark:border-gray-800 mt-8 active:scale-[0.98]"
                    >
                        Carregar mais resultados ({literalResults.length - displayCount} restantes)
                    </button>
                )}
            </div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 max-w-sm mx-auto">
                <div className="bg-gray-100 dark:bg-gray-800 p-10 rounded-full mb-6 opacity-30">
                    <Icons.Search size={64} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Sem resultados</h3>
                <p className="mt-2 leading-relaxed">Não encontramos ocorrências para "{query}". Tente termos mais genéricos ou use o modo IA.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40 py-20">
                <Icons.BookOpen size={120} className="text-blue-400 mb-8" />
                <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100">Centro de Estudos</h3>
                <p className="max-w-md mt-4 text-lg leading-relaxed">
                    Escolha entre a precisão da **Busca Literal** ou a inteligência contextual da **IA Grounded**.
                </p>
                <div className="mt-10 flex gap-4">
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                        <Icons.Search size={24} className="mb-2 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Literal</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                        <Icons.Sparkles size={24} className="mb-2 text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">IA Deep</span>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
