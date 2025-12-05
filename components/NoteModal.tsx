import React, { useState, useEffect } from 'react';
import Icons from './Icon';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  existingNote: string;
  onSave: (text: string) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, reference, existingNote, onSave }) => {
  const [noteText, setNoteText] = useState(existingNote);

  useEffect(() => {
    setNoteText(existingNote);
  }, [existingNote, isOpen]);

  const handleShareNote = async () => {
    if (!noteText.trim()) return;
    
    const shareData = {
      title: `Nota: ${reference}`,
      text: `Minha nota sobre ${reference}:\n\n"${noteText}"`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      alert('Nota copiada para a área de transferência!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icons.FileText size={20} className="text-blue-500" />
            Nota: {reference}
          </h3>
          <div className="flex items-center gap-2">
            {noteText.trim() && (
                <button 
                  onClick={handleShareNote}
                  className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Compartilhar Nota"
                >
                  <Icons.Share2 size={18} />
                </button>
            )}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Icons.X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <textarea
            className="w-full h-40 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans text-base"
            placeholder="Escreva suas reflexões aqui..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            autoFocus
          />
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onSave(noteText);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors font-medium"
          >
            Salvar Nota
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;