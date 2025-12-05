import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_BOOKS, BIBLE_VERSIONS, READING_PLANS } from './constants';
import { Book, Verse, Note, SearchResult, HistoryItem, Theme, FontSize, HighlightColor, ReadingPlan } from './types';
import { fetchChapter } from './services/bibleService';
import Navigation from './components/Navigation';
import Icons from './components/Icon';
import NoteModal from './components/NoteModal';
import GeminiModal from './components/GeminiModal';
import SearchModal from './components/SearchModal';
import SettingsModal from './components/SettingsModal';
import VerseOfTheDay from './components/VerseOfTheDay';
import ReadingPlanModal from './components/ReadingPlanModal';
import ChatModal from './components/ChatModal';
import Toast from './components/Toast';
import LandingPage from './components/LandingPage';

// Initial State
const INITIAL_BOOK = ALL_BOOKS[0]; // Genesis
const INITIAL_CHAPTER = 1;
const INITIAL_VERSION = BIBLE_VERSIONS[0]; // Almeida

function App() {
  // --- Landing Page State ---
  const [showLanding, setShowLanding] = useState(true);

  // --- State ---
  const [currentVersion, setCurrentVersion] = useState(INITIAL_VERSION);
  const [currentBook, setCurrentBook] = useState<Book>(INITIAL_BOOK);
  const [currentChapter, setCurrentChapter] = useState(INITIAL_CHAPTER);
  
  // Parallel View State
  const [showParallel, setShowParallel] = useState(false);
  const [secondVersion, setSecondVersion] = useState(BIBLE_VERSIONS[1]); // Default to WEB (English)
  const [secondaryVerses, setSecondaryVerses] = useState<Verse[]>([]);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showVOD, setShowVOD] = useState(true);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

  // Highlights
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null); // To show color picker

  // User Data (Persisted)
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [completedPlanDays, setCompletedPlanDays] = useState<number[]>([]);
  
  // Settings
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bible_theme') as Theme) || 'system';
    }
    return 'system';
  });
  
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('bible_fontsize') as FontSize) || 'medium';
  });

  // Modals & Navigation Targets
  const [activeNoteRef, setActiveNoteRef] = useState<string | null>(null);
  const [activeGeminiData, setActiveGeminiData] = useState<{ref: string, text: string} | null>(null);
  
  // Target verse to scroll to after loading
  const [targetVerse, setTargetVerse] = useState<number | null>(null);

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // --- Effects ---

  // Load persisted data
  useEffect(() => {
    const savedFavs = localStorage.getItem('bible_favorites');
    const savedNotes = localStorage.getItem('bible_notes');
    const savedHighlights = localStorage.getItem('bible_highlights');
    const savedHistory = localStorage.getItem('bible_history');
    const savedPlan = localStorage.getItem('bible_plan_progress');
    
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedPlan) setCompletedPlanDays(JSON.parse(savedPlan));
  }, []);

  // Save persisted data
  useEffect(() => { localStorage.setItem('bible_favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('bible_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('bible_highlights', JSON.stringify(highlights)); }, [highlights]);
  useEffect(() => { localStorage.setItem('bible_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('bible_fontsize', fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem('bible_plan_progress', JSON.stringify(completedPlanDays)); }, [completedPlanDays]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'sepia'); 
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('sepia');
    } else if (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    }
    localStorage.setItem('bible_theme', theme);
  }, [theme]);

  // Update History on Navigation
  useEffect(() => {
    setHistory(prev => {
      if (prev.length > 0) {
        const last = prev[0];
        if (last.bookId === currentBook.id && last.chapter === currentChapter) {
          return prev;
        }
      }
      const filtered = prev.filter(h => !(h.bookId === currentBook.id && h.chapter === currentChapter));
      const newItem: HistoryItem = {
        bookId: currentBook.id,
        bookName: currentBook.name,
        chapter: currentChapter,
        timestamp: Date.now()
      };
      return [newItem, ...filtered].slice(0, 50); 
    });
  }, [currentBook.id, currentChapter]); 

  // Stop audio on chapter change
  useEffect(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentBook.id, currentChapter, currentVersion.id]);

  // Fetch Content (Primary and Secondary)
  const loadContent = useCallback(async () => {
    // Avoid fetching if on landing page
    if (showLanding) return;

    setIsLoading(true);
    setError(null);
    try {
      const primaryPromise = fetchChapter(currentBook.id, currentChapter, currentVersion.id);
      const secondaryPromise = showParallel 
        ? fetchChapter(currentBook.id, currentChapter, secondVersion.id)
        : Promise.resolve(null);

      const [primaryData, secondaryData] = await Promise.all([primaryPromise, secondaryPromise]);
      
      setVerses(primaryData.verses);
      if (secondaryData) {
        setSecondaryVerses(secondaryData.verses);
      }
    } catch (err) {
      setError("Falha ao carregar o capítulo. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [currentBook, currentChapter, currentVersion, showParallel, secondVersion, showLanding]);

  useEffect(() => {
    loadContent();
    if (targetVerse === null && !showLanding) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loadContent, showLanding]); 

  // Scroll to target verse
  useEffect(() => {
    if (!isLoading && verses.length > 0 && targetVerse !== null) {
      setTimeout(() => {
        const element = document.getElementById(`verse-${targetVerse}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500', 'shadow-lg', 'scale-[1.01]');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'shadow-lg', 'scale-[1.01]');
          }, 2500);
          setTargetVerse(null);
        }
      }, 100);
    }
  }, [verses, isLoading, targetVerse]);

  // --- Handlers ---

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  const handleNextChapter = useCallback(() => {
    if (currentChapter < currentBook.chapters) {
      setCurrentChapter(prev => prev + 1);
    } else {
      const currentIndex = ALL_BOOKS.findIndex(b => b.id === currentBook.id);
      if (currentIndex < ALL_BOOKS.length - 1) {
        setCurrentBook(ALL_BOOKS[currentIndex + 1]);
        setCurrentChapter(1);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter, currentBook]);

  const handlePrevChapter = useCallback(() => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else {
      const currentIndex = ALL_BOOKS.findIndex(b => b.id === currentBook.id);
      if (currentIndex > 0) {
        const prevBook = ALL_BOOKS[currentIndex - 1];
        setCurrentBook(prevBook);
        setCurrentChapter(prevBook.chapters);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapter, currentBook]);

  // Audio Handler
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const fullText = verses.map(v => `${v.verse}. ${v.text}`).join(' ');
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = currentVersion.language; // Uses language from version (pt-BR or en-US)
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setSpeechInstance(utterance);
      setIsSpeaking(true);
    }
  };

  // Swipe Handlers with Visual Feedback
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const distance = currentTouch - touchStart;
    
    // Limit visually to 150px drag to avoid over-dragging
    const dampening = 1; 
    setSwipeDistance(distance * dampening);
  };

  const onTouchEnd = () => {
    const minSwipeDistance = 100;
    
    if (swipeDistance > minSwipeDistance) {
      // Swiped Right (Previous)
      handlePrevChapter();
    } else if (swipeDistance < -minSwipeDistance) {
      // Swiped Left (Next)
      handleNextChapter();
    }
    
    // Reset
    setIsSwiping(false);
    setSwipeDistance(0);
    setTouchStart(null);
  };

  const handleSearchResult = (result: SearchResult) => {
    const book = ALL_BOOKS.find(b => 
      b.name.toLowerCase() === result.book.toLowerCase() || 
      result.book.toLowerCase().startsWith(b.name.toLowerCase())
    );
    if (book) {
      setCurrentBook(book);
      setCurrentChapter(result.chapter);
      setTargetVerse(result.verse);
      setIsSidebarOpen(false); // Ensure sidebar is closed if result is clicked
    } else {
      showToast(`Livro "${result.book}" não encontrado.`);
    }
  };

  const toggleFavorite = (ref: string) => {
    const exists = favorites.includes(ref);
    setFavorites(prev => exists ? prev.filter(f => f !== ref) : [...prev, ref]);
    if (!exists) showToast('Adicionado aos favoritos');
  };

  const setHighlight = (ref: string, color: HighlightColor) => {
    setHighlights(prev => {
       const newHighlights = { ...prev };
       if (color === null) {
           delete newHighlights[ref];
       } else {
           newHighlights[ref] = color;
       }
       return newHighlights;
    });
    setActiveHighlightId(null);
  };

  const handleShare = async (text: string, ref: string) => {
    const shareText = `"${text}" - ${ref} (${currentVersion.name})`;
    
    if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
      try { 
        await navigator.share({ 
          title: 'Versículo Bíblico', 
          text: shareText 
        }); 
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('Versículo copiado para a área de transferência!');
      } catch (e) {
        showToast('Não foi possível compartilhar ou copiar.');
      }
    }
  };

  const handleShareChapter = async () => {
    const text = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
    const title = `${currentBook.name} ${currentChapter}`;
    const footer = `\n\nLeia em: Bíblia Sagrada (${currentVersion.name})`;
    const shareText = `${title}\n\n${text}${footer}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
        });
      } catch (err) {
        console.error('Erro ao compartilhar capítulo:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('Capítulo copiado para a área de transferência!');
      } catch (e) {
        showToast('Erro ao copiar capítulo.');
      }
    }
  };

  const handleCopy = async (text: string, ref: string) => {
    const copyText = `"${text}" - ${ref} (${currentVersion.name})`;
    try {
        await navigator.clipboard.writeText(copyText);
        showToast('Copiado: ' + ref);
    } catch (e) {
        showToast('Erro ao copiar.');
    }
  };

  const saveNote = (text: string) => {
    if (activeNoteRef) {
      if (!text.trim()) {
        const newNotes = { ...notes };
        delete newNotes[activeNoteRef];
        setNotes(newNotes);
        showToast('Nota removida');
      } else {
        setNotes(prev => ({
          ...prev,
          [activeNoteRef]: { id: Date.now().toString(), reference: activeNoteRef, text, createdAt: Date.now() }
        }));
        showToast('Nota salva');
      }
    }
  };

  const togglePlanDay = (day: number) => {
      setCompletedPlanDays(prev => 
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
  };

  const exportData = () => {
    const data = { favorites, notes, highlights, history, completedPlanDays, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso');
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.favorites) setFavorites(json.favorites);
        if (json.notes) setNotes(json.notes);
        if (json.highlights) setHighlights(json.highlights);
        if (json.history) setHistory(json.history);
        if (json.completedPlanDays) setCompletedPlanDays(json.completedPlanDays);
        showToast('Dados restaurados com sucesso!');
        setIsSettingsOpen(false);
      } catch (err) {
        showToast('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  // --- Styling Helpers ---
  const getFontSizeClass = () => {
      switch(fontSize) {
          case 'small': return 'text-base';
          case 'large': return 'text-xl';
          case 'xlarge': return 'text-2xl';
          default: return 'text-lg'; 
      }
  };

  const getHighlightClass = (color: HighlightColor) => {
      if (!color) return '';
      switch(color) {
          case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/40 sepia:bg-[#f9eeb9] border-yellow-200 dark:border-yellow-900';
          case 'green': return 'bg-green-100 dark:bg-green-900/40 sepia:bg-[#daedd3] border-green-200 dark:border-green-900';
          case 'blue': return 'bg-blue-100 dark:bg-blue-900/40 sepia:bg-[#d0e1ec] border-blue-200 dark:border-blue-900';
          case 'pink': return 'bg-pink-100 dark:bg-pink-900/40 sepia:bg-[#ebd0d0] border-pink-200 dark:border-pink-900';
          case 'purple': return 'bg-purple-100 dark:bg-purple-900/40 sepia:bg-[#e0d0eb] border-purple-200 dark:border-purple-900';
          case 'orange': return 'bg-orange-100 dark:bg-orange-900/40 sepia:bg-[#f5dcc1] border-orange-200 dark:border-orange-900';
          default: return '';
      }
  };

  const getVerseRef = (verseNum: number) => `${currentBook.name} ${currentChapter}:${verseNum}`;

  // --- Landing Page Check ---
  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-950 sepia:bg-[#f4ecd8] text-gray-900 dark:text-gray-100 sepia:text-[#433422] overflow-hidden transition-colors duration-300 font-sans`}>
      
      {/* Toast Notification */}
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-900 sepia:bg-[#fdf6e3] border-r border-gray-200 dark:border-gray-800 sepia:border-[#e6dcc6] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navigation 
          currentBook={currentBook}
          currentChapter={currentChapter}
          history={history}
          onSelect={(book, chapter, verse) => {
            setCurrentBook(book);
            setCurrentChapter(chapter);
            if(verse) setTargetVerse(verse);
            setIsSidebarOpen(false);
          }}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        
        {/* Top Bar */}
        <header className="h-auto py-2 bg-white dark:bg-gray-900 sepia:bg-[#fdf6e3] border-b border-gray-200 dark:border-gray-800 sepia:border-[#e6dcc6] px-4 shadow-sm z-30 transition-colors duration-300 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
                    <Icons.Menu size={24} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
                        {currentBook.name} {currentChapter}
                    </h1>
                    <span className="text-xs text-gray-500 sepia:text-[#7f6a55] hidden sm:block">
                        {currentBook.testament === 'OT' ? 'Antigo Testamento' : 'Novo Testamento'}
                    </span>
                </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-1 md:hidden">
                 <button onClick={() => setIsChatOpen(true)} className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 rounded-lg">
                    <Icons.MessageCircle size={20} />
                 </button>
                 <button onClick={toggleSpeech} className={`p-2 rounded-full ${isSpeaking ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {isSpeaking ? <Icons.Pause size={20} /> : <Icons.Play size={20} />}
                 </button>
                 <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                    <Icons.Search size={20} />
                 </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {/* Audio Toggle (Desktop) */}
            <button 
                onClick={toggleSpeech} 
                className={`hidden md:flex p-2 rounded-full items-center gap-2 transition-colors ${isSpeaking ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Ouvir Capítulo"
            >
                {isSpeaking ? <Icons.Pause size={20} /> : <Icons.Play size={20} />}
                <span className="text-xs font-medium">{isSpeaking ? 'Pausar' : 'Ouvir'}</span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

            {/* Reading Plans */}
            <button
              onClick={() => setIsPlansOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Planos de Leitura"
            >
              <Icons.Calendar size={20} />
            </button>

            {/* Parallel View Toggle */}
            <button
                onClick={() => setShowParallel(!showParallel)}
                className={`p-2 rounded-lg transition-colors ${showParallel ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title="Visualização Paralela"
            >
                <Icons.Columns size={20} />
            </button>

            {/* Version Selects */}
            <div className="flex gap-2">
                <select 
                    value={currentVersion.id}
                    onChange={(e) => {
                        const ver = BIBLE_VERSIONS.find(v => v.id === e.target.value);
                        if (ver) setCurrentVersion(ver);
                    }}
                    className="bg-gray-100 dark:bg-gray-800 sepia:bg-[#efe4c6] border-none rounded-lg text-sm px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none max-w-[100px] text-gray-900 dark:text-gray-100"
                >
                    {BIBLE_VERSIONS.map(v => <option key={v.id} value={v.id}>{v.id.toUpperCase()}</option>)}
                </select>
                
                {showParallel && (
                    <select 
                        value={secondVersion.id}
                        onChange={(e) => {
                            const ver = BIBLE_VERSIONS.find(v => v.id === e.target.value);
                            if (ver) setSecondVersion(ver);
                        }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-sm px-2 py-2 focus:ring-2 focus:ring-blue-500 outline-none max-w-[100px] text-blue-900 dark:text-blue-100"
                    >
                        {BIBLE_VERSIONS.map(v => <option key={v.id} value={v.id}>{v.id.toUpperCase()}</option>)}
                    </select>
                )}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <button onClick={() => setIsChatOpen(true)} className="hidden md:block p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Chat com Mentor">
                <Icons.MessageCircle size={20} />
            </button>
            <button onClick={handleShareChapter} className="hidden md:block p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Compartilhar Capítulo">
              <Icons.Share2 size={20} />
            </button>
            <button onClick={() => setIsSearchOpen(true)} className="hidden md:block p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Icons.Search size={20} />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Icons.Settings size={20} />
            </button>
          </div>
        </header>

        {/* Reader Area */}
        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth transition-colors duration-300 touch-pan-y" 
          id="reader-container"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Visual Swipe Indicators */}
          {isSwiping && (
            <>
              {swipeDistance > 40 && (
                <div className="fixed inset-y-0 left-0 w-20 bg-gradient-to-r from-black/10 to-transparent z-40 flex items-center justify-start pl-4">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                    <Icons.ChevronLeft size={24} className="text-blue-500" />
                  </div>
                </div>
              )}
              {swipeDistance < -40 && (
                <div className="fixed inset-y-0 right-0 w-20 bg-gradient-to-l from-black/10 to-transparent z-40 flex items-center justify-end pr-4">
                   <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                    <Icons.ChevronRight size={24} className="text-blue-500" />
                  </div>
                </div>
              )}
            </>
          )}

          <div 
            className={`mx-auto ${showParallel ? 'max-w-6xl' : 'max-w-3xl'} transition-transform duration-75`}
            style={{ 
                transform: isSwiping ? `translateX(${swipeDistance}px)` : 'translateX(0)',
                opacity: isSwiping ? Math.max(0.5, 1 - Math.abs(swipeDistance)/500) : 1
            }}
          >
            
            {showVOD && !isLoading && !error && (
                <VerseOfTheDay 
                    onReadMore={(book, chapter) => {
                        setCurrentBook(book);
                        setCurrentChapter(chapter);
                    }}
                    onClose={() => setShowVOD(false)}
                />
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 sepia:text-[#7f6a55]">Carregando as escrituras...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                {error}
                <button onClick={loadContent} className="block mx-auto mt-2 text-sm underline hover:text-red-800">Tentar novamente</button>
              </div>
            ) : (
              <div className="space-y-4 pb-20">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-10 mt-4 transition-colors">
                  {currentBook.name} <span className="text-gray-400 sepia:text-[#a08f7a]">{currentChapter}</span>
                </h2>

                {/* Header for Parallel View */}
                {showParallel && (
                    <div className="grid grid-cols-2 gap-6 mb-4 font-semibold text-center text-gray-500 uppercase text-xs tracking-wider border-b pb-2">
                        <div>{currentVersion.name}</div>
                        <div>{secondVersion.name}</div>
                    </div>
                )}

                {verses.map((verse, idx) => {
                  const ref = getVerseRef(verse.verse);
                  const isFav = favorites.includes(ref);
                  const hasNote = !!notes[ref];
                  const highlightColor = highlights[ref];
                  const secVerse = secondaryVerses[idx];

                  return (
                    <div 
                      key={verse.verse} 
                      id={`verse-${verse.verse}`}
                      className={`group relative p-4 mb-3 rounded-xl border transition-all duration-300
                        ${highlightColor 
                            ? getHighlightClass(highlightColor) 
                            : 'bg-white dark:bg-gray-900/40 sepia:bg-[#fdf6e3] border-gray-100 dark:border-gray-800 sepia:border-[#e6dcc6]'}
                        hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700
                      `}
                    >
                      <div className={`grid ${showParallel ? 'grid-cols-2 gap-6 divide-x divide-gray-100 dark:divide-gray-800' : 'grid-cols-1'}`}>
                          {/* Primary Version */}
                          <div className="flex gap-4 items-start">
                            <span 
                                className="text-base font-black text-gray-400 dark:text-gray-600 sepia:text-[#a08f7a]/70 mt-1 w-8 text-right select-none font-serif cursor-pointer hover:text-blue-500 transition-colors"
                                onClick={() => {
                                    const toolbar = document.getElementById(`toolbar-${verse.verse}`);
                                    if(toolbar) toolbar.style.opacity = '1';
                                }}
                            >
                              {verse.verse}
                            </span>
                            <div className="flex-1">
                              <p className={`font-serif leading-relaxed text-gray-800 dark:text-gray-200 sepia:text-[#433422] transition-all ${getFontSizeClass()}`}>
                                {verse.text}
                              </p>
                            </div>
                          </div>

                          {/* Secondary Version (Parallel) */}
                          {showParallel && secVerse && (
                              <div className="pl-6">
                                  <p className={`font-serif leading-relaxed text-gray-600 dark:text-gray-400 sepia:text-[#5e4b35] transition-all ${getFontSizeClass()}`}>
                                    {secVerse.text}
                                  </p>
                              </div>
                          )}
                      </div>

                      {/* Indicators */}
                      {hasNote && (
                        <div onClick={() => setActiveNoteRef(ref)} className="mt-3 ml-12 text-sm bg-gray-50 dark:bg-gray-800 border-l-4 border-yellow-400 p-2 rounded-r-lg cursor-pointer hover:opacity-80 inline-block">
                            <span className="font-bold text-yellow-600 mr-2">Nota:</span>
                            <span className="italic text-gray-600 dark:text-gray-400 truncate max-w-xs inline-block align-bottom">{notes[ref].text}</span>
                        </div>
                      )}

                      {/* Action Toolbar */}
                      <div id={`toolbar-${verse.verse}`} className="flex flex-wrap items-center gap-2 mt-4 ml-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {/* Highlight Button with Picker Popover */}
                        <div className="relative">
                            <button 
                                onClick={() => setActiveHighlightId(activeHighlightId === ref ? null : ref)}
                                className={`p-2 rounded-full transition-colors ${highlightColor ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                <Icons.Highlighter size={18} />
                            </button>
                            {activeHighlightId === ref && (
                                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex gap-2 z-10 animate-in fade-in zoom-in duration-200">
                                    <button onClick={() => setHighlight(ref, null)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-100"><Icons.X size={12}/></button>
                                    <button onClick={() => setHighlight(ref, 'yellow')} className="w-6 h-6 rounded-full bg-yellow-200 hover:ring-2 ring-yellow-400 transition-all"></button>
                                    <button onClick={() => setHighlight(ref, 'green')} className="w-6 h-6 rounded-full bg-green-200 hover:ring-2 ring-green-400 transition-all"></button>
                                    <button onClick={() => setHighlight(ref, 'blue')} className="w-6 h-6 rounded-full bg-blue-200 hover:ring-2 ring-blue-400 transition-all"></button>
                                    <button onClick={() => setHighlight(ref, 'pink')} className="w-6 h-6 rounded-full bg-pink-200 hover:ring-2 ring-pink-400 transition-all"></button>
                                    <button onClick={() => setHighlight(ref, 'purple')} className="w-6 h-6 rounded-full bg-purple-200 hover:ring-2 ring-purple-400 transition-all"></button>
                                    <button onClick={() => setHighlight(ref, 'orange')} className="w-6 h-6 rounded-full bg-orange-200 hover:ring-2 ring-orange-400 transition-all"></button>
                                </div>
                            )}
                        </div>

                        <button onClick={() => toggleFavorite(ref)} className={`p-2 rounded-full ${isFav ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                          <Icons.Heart size={18} fill={isFav ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => setActiveNoteRef(ref)} className={`p-2 rounded-full ${hasNote ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                          <Icons.FileText size={18} />
                        </button>
                        <button onClick={() => setActiveGeminiData({ ref, text: verse.text })} className="p-2 rounded-full text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                          <Icons.Sparkles size={18} />
                        </button>
                        <button onClick={() => handleCopy(verse.text, ref)} className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <Icons.Copy size={18} />
                        </button>
                        <button onClick={() => handleShare(verse.text, ref)} className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <Icons.Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-800 sepia:border-[#e6dcc6] bg-white dark:bg-gray-900 sepia:bg-[#fdf6e3] p-4 flex justify-between items-center z-30">
            <button onClick={handlePrevChapter} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium" disabled={currentBook.id === ALL_BOOKS[0].id && currentChapter === 1}>
                <Icons.ChevronLeft size={20} /> <span className="hidden sm:inline">Anterior</span>
            </button>
            <div className="text-xs text-gray-400 sepia:text-[#7f6a55] text-center">Capítulo {currentChapter} de {currentBook.chapters}</div>
            <button onClick={handleNextChapter} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium" disabled={currentBook.id === ALL_BOOKS[ALL_BOOKS.length - 1].id && currentChapter === currentBook.chapters}>
                <span className="hidden sm:inline">Próximo</span> <Icons.ChevronRight size={20} />
            </button>
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* Modals */}
      <NoteModal isOpen={!!activeNoteRef} onClose={() => setActiveNoteRef(null)} reference={activeNoteRef || ''} existingNote={activeNoteRef ? (notes[activeNoteRef]?.text || '') : ''} onSave={saveNote} />
      <GeminiModal isOpen={!!activeGeminiData} onClose={() => setActiveGeminiData(null)} verseText={activeGeminiData?.text || ''} reference={activeGeminiData?.ref || ''} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={handleSearchResult} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentTheme={theme} onThemeChange={setTheme} currentFontSize={fontSize} onFontSizeChange={setFontSize} onExportData={exportData} onImportData={importData} />
      <ReadingPlanModal isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)} plans={READING_PLANS} completedDays={completedPlanDays} onToggleDay={togglePlanDay} onNavigate={(book, chapter) => { setCurrentBook(book); setCurrentChapter(chapter); }} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export default App;