import React, { useRef } from 'react';
import Icons from './Icon';
import { Theme, FontSize } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentFontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentTheme, 
  onThemeChange,
  currentFontSize,
  onFontSizeChange,
  onExportData,
  onImportData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  const getThemeButtonClass = (theme: Theme) => {
    return `flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-all ${
      currentTheme === theme
        ? 'bg-white dark:bg-gray-700 shadow ring-2 ring-blue-500 text-blue-600 dark:text-blue-400' 
        : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700/50'
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Icons.Settings size={20} />
            Configurações
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icons.X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          
          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Icons.Monitor size={16} /> Aparência
            </h3>
            <div className="grid grid-cols-4 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button onClick={() => onThemeChange('light')} className={getThemeButtonClass('light')}>
                <Icons.Sun size={18} /> Claro
              </button>
              <button onClick={() => onThemeChange('sepia')} className={getThemeButtonClass('sepia')}>
                <Icons.Coffee size={18} /> Sépia
              </button>
              <button onClick={() => onThemeChange('dark')} className={getThemeButtonClass('dark')}>
                <Icons.Moon size={18} /> Escuro
              </button>
              <button onClick={() => onThemeChange('system')} className={getThemeButtonClass('system')}>
                <Icons.Monitor size={18} /> Auto
              </button>
            </div>
          </section>

          {/* Font Size Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Icons.Type size={16} /> Tamanho do Texto
            </h3>
            <div className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-serif text-gray-500">Aa</span>
                <input 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="1"
                    value={['small', 'medium', 'large', 'xlarge'].indexOf(currentFontSize)}
                    onChange={(e) => {
                        const sizes: FontSize[] = ['small', 'medium', 'large', 'xlarge'];
                        onFontSizeChange(sizes[parseInt(e.target.value)]);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                />
                <span className="text-xl font-serif text-gray-800 dark:text-gray-200">Aa</span>
            </div>
            <div className="flex justify-between px-1 mt-1 text-xs text-gray-400">
                <span>Pequeno</span>
                <span>Normal</span>
                <span>Grande</span>
                <span>Extra</span>
            </div>
          </section>

          {/* Data Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Icons.Download size={16} /> Dados & Backup
            </h3>
            <div className="space-y-3">
              <button 
                onClick={onExportData}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full group-hover:scale-110 transition-transform">
                    <Icons.Download size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">Exportar Backup</div>
                    <div className="text-xs text-gray-500">Salvar notas e favoritos</div>
                  </div>
                </div>
                <Icons.ChevronRight size={16} className="text-gray-400" />
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full group-hover:scale-110 transition-transform">
                    <Icons.Upload size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">Restaurar Backup</div>
                    <div className="text-xs text-gray-500">Carregar arquivo .json</div>
                  </div>
                </div>
                <Icons.ChevronRight size={16} className="text-gray-400" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange}
              />
            </div>
          </section>

          <div className="pt-4 text-center text-xs text-gray-400">
            <p>Bíblia Sagrada v1.3 • Feito com ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;