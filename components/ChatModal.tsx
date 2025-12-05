import React, { useState, useRef, useEffect } from 'react';
import Icons from './Icon';
import { Chat } from '@google/genai';
import { createBibleChat } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCESS_CODE = "777";

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: 'welcome',
        role: 'model',
        text: 'Olá! A paz seja contigo. Sou seu assistente de estudos bíblicos. Como posso te ajudar hoje?',
        timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to hold the chat instance so it doesn't reset on re-renders
  const chatInstance = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat
  useEffect(() => {
    if (isOpen && !chatInstance.current) {
        chatInstance.current = createBibleChat();
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === ACCESS_CODE) {
        setIsUnlocked(true);
        setError('');
    } else {
        setError('Código de acesso incorreto.');
        setInputCode('');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chatInstance.current) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add User Message
    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: userText,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        const response = await chatInstance.current.sendMessage({ message: userText });
        const aiText = response.text || "Desculpe, não consegui processar sua mensagem.";

        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: aiText,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
        console.error(err);
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Ocorreu um erro ao conectar com o serviço. Tente novamente.",
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md h-[600px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <Icons.MessageCircle size={24} />
            <div>
                <h3 className="font-bold text-lg leading-tight">Chat Bíblico</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest">Mentor IA</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-950 flex flex-col">
            
            {!isUnlocked ? (
                // Locked View
                <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6 text-gray-400">
                        <Icons.Lock size={48} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Acesso Restrito</h4>
                    <p className="text-sm text-gray-500 mb-6">Esta área é reservada para estudo aprofundado. Insira o código de acesso para continuar.</p>
                    
                    <form onSubmit={handleUnlock} className="w-full max-w-xs">
                        <div className="relative mb-4">
                            <input 
                                type="password" 
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder="Código de Acesso"
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-widest text-lg"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button 
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Icons.Unlock size={18} /> Acessar Chat
                        </button>
                    </form>
                    <p className="mt-8 text-xs text-gray-400">Dica: O número da perfeição de Deus (777).</p>
                </div>
            ) : (
                // Chat View
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`
                                        max-w-[85%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed
                                        ${msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                        }
                                    `}
                                >
                                    {msg.text.split('\n').map((line, i) => (
                                        <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700 flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Digite sua dúvida..."
                            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isLoading}
                            className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <Icons.Send size={18} />
                        </button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;