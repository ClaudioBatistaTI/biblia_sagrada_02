import React, { useState, useMemo } from 'react';
import { OLD_TESTAMENT, NEW_TESTAMENT, ALL_BOOKS } from '../constants';
import { Book, HistoryItem, Note } from '../types';
import Icons from './Icon';

interface NavigationProps {
  currentBook: Book;
  currentChapter: number;
  history: HistoryItem[];
  notes?: Record<string, Note>;
  onSelect: (book: Book, chapter: number, verse?: number) => void;
  onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentBook, currentChapter, history, notes = {}, onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState<'books' | 'history'>('books');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickNav, setQuickNav] = useState('');

  const filteredOld = OLD_TESTAMENT.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredNew = NEW_TESTAMENT.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Generate Alphabet for Index
  const alphabet = useMemo(() => {
    if (activeTab !== 'books' || selectedBook) return [];
    const books = [...filteredOld, ...filteredNew];
    const letters = new Set(books.map(b => b.name.charAt(0).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    return Array.from(letters).sort();
  }, [activeTab, selectedBook, filteredOld, filteredNew]);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleChapterClick = (chapter: number) => {
    if (selectedBook) {
      onSelect(selectedBook, chapter);
      onClose();
    }
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    const book = ALL_BOOKS.find(b => b.id === item.bookId);
    if (book) {
      onSelect(book, item.chapter);
      onClose();
    }
  };

  const handleAlphaClick = (letter: string) => {
    const targetBook = [...filteredOld, ...filteredNew].find(b => 
        b.name.charAt(0).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === letter
    );
    
    if (targetBook) {
        const el = document.getElementById(`book-btn-${targetBook.id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  };

  const handleQuickNavSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const regex = /([1-3]?\s?[a-zA-ZÀ-ÿ]+)\s+(\d+)(?::(\d+))?/;
    const match = quickNav.match(regex);

    if (match) {
        const [_, bookNamePart, chapterPart, versePart] = match;
        const normalizedInput = bookNamePart.trim().toLowerCase();
        
        const book = ALL_BOOKS.find(b => b.name.toLowerCase() === normalizedInput || b.name.toLowerCase().startsWith(normalizedInput));
        
        if (book) {
            const chapter = parseInt(chapterPart);
            const verse = versePart ? parseInt(versePart) : undefined;

            if (chapter > 0 && chapter <= book.chapters) {
                 onSelect(book, chapter, verse);
                 onClose();
                 setQuickNav('');
                 return;
            }
        }
    }
    alert('Referência não encontrada. Tente o formato "Livro Capítulo:Versículo" (ex: João 3:16)');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 shrink-0">
        
        {/* Quick Nav Input */}
        <form onSubmit={handleQuickNavSubmit} className="mb-4 relative">
             <Icons.Crosshair className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={16} />
             <input 
                type="text" 
                placeholder="Ir para... (ex: João 3:16)"
                value={quickNav}
                onChange={(e) => setQuickNav(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 dark:text-blue-100 placeholder-blue-400 dark:placeholder-blue-300"
             />
        </form>

        <div className="flex justify-between items-center mb-4">
           {/* Tabs */}
           <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full mr-2">
             <button 
                onClick={() => { setActiveTab('books'); setSelectedBook(null); }}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'books' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
             >
                Livros
             </button>
             <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}
             >
                Histórico
             </button>
           </div>
           
           <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full md:hidden">
             <Icons.X size={24} />
           </button>
        </div>

        {activeTab === 'books' && !selectedBook && (
          <div className="relative w-full">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Filtrar livros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
        
        {activeTab === 'books' && selectedBook && (
           <button 
             onClick={handleBackToBooks}
             className="flex items-center text-blue-600 hover:text-blue-800 font-medium w-full"
           >
             <Icons.ChevronLeft size={20} className="mr-1" />
             Voltar para Livros
           </button>
        )}
      </div>

      {/* Content Container with Relative Positioning for Index */}
      <div className="flex-1 relative overflow-hidden">
        
        <div className="absolute inset-0 overflow-y-auto p-4 pr-8 scroll-smooth" id="books-scroll-container">
            {activeTab === 'history' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                {history.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <Icons.Clock size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Seu histórico de leitura aparecerá aqui.</p>
                </div>
                ) : (
                history.map((item, idx) => {
                    const chapterNotes = (Object.values(notes) as Note[]).filter(n => n.reference.startsWith(item.bookName + ' ' + item.chapter + ':'));
                    const hasNote = chapterNotes.length > 0;
                    const notePreview = hasNote ? chapterNotes[0].text : '';

                    return (
                        <button
                            key={`${item.bookId}-${item.chapter}-${idx}`}
                            onClick={() => handleHistoryClick(item)}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between group transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        >
                        <div className="flex items-start gap-3 w-full overflow-hidden">
                            <div className={`p-2 mt-1 rounded-full shrink-0 ${hasNote ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                                {hasNote ? <Icons.FileText size={18} /> : <Icons.Book size={18} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {item.bookName} {item.chapter}
                                    </span>
                                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                                        {formatTime(item.timestamp)}
                                    </span>
                                </div>
                                
                                {hasNote ? (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400 italic truncate">
                                        <span className="font-bold text-yellow-600 not-italic">Nota:</span>
                                        {notePreview}
                                    </div>
                                ) : item.previewText ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate font-serif opacity-80">
                                        "{item.previewText}"
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        </button>
                    );
                })
                )}
            </div>
            )}

            {activeTab === 'books' && (
            <>
                {selectedBook ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-bold mb-4 text-center">{selectedBook.name}</h2>
                    <div className="grid grid-cols-5 gap-3">
                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                        <button
                        key={chapter}
                        onClick={() => handleChapterClick(chapter)}
                        className={`p-3 rounded-lg text-center font-medium transition-colors ${
                            selectedBook.id === currentBook.id && chapter === currentChapter
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700'
                        }`}
                        >
                        {chapter}
                        </button>
                    ))}
                    </div>
                </div>
                ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    {filteredOld.length > 0 && (
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Antigo Testamento</h3>
                        <div className="grid grid-cols-1 gap-2">
                        {filteredOld.map((book) => (
                            <button
                            key={book.id}
                            id={`book-btn-${book.id}`}
                            onClick={() => handleBookClick(book)}
                            className="text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium flex justify-between items-center group"
                            >
                            {book.name}
                            <Icons.ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                            </button>
                        ))}
                        </div>
                    </section>
                    )}

                    {filteredNew.length > 0 && (
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Novo Testamento</h3>
                        <div className="grid grid-cols-1 gap-2">
                        {filteredNew.map((book) => (
                            <button
                            key={book.id}
                            id={`book-btn-${book.id}`}
                            onClick={() => handleBookClick(book)}
                            className="text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium flex justify-between items-center group"
                            >
                            {book.name}
                            <Icons.ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                            </button>
                        ))}
                        </div>
                    </section>
                    )}
                    
                    {filteredNew.length === 0 && filteredOld.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Nenhum livro encontrado.
                    </div>
                    )}
                </div>
                )}
            </>
            )}
        </div>

        {/* Alphabet Index Overlay */}
        {activeTab === 'books' && !selectedBook && alphabet.length > 0 && (
            <div className="absolute right-0 top-4 bottom-4 w-6 flex flex-col items-center justify-center z-20">
                <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-l-lg py-2 shadow-sm flex flex-col items-center gap-0.5 overflow-y-auto max-h-full no-scrollbar">
                {alphabet.map((letter) => (
                    <button
                        key={letter}
                        onClick={() => handleAlphaClick(letter)}
                        className="text-[10px] font-bold text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-6 h-4 flex items-center justify-center transition-colors"
                    >
                        {letter}
                    </button>
                ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Navigation;