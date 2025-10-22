import React, { useState, useRef } from 'react';
import Header from '../components/Header';
import TextAreaInput from '../components/TextAreaInput';
import StyleButton from '../components/StyleButton';
import ActionButton from '../components/ActionButton';
import FullscreenButton from '../components/FullscreenButton';
import { TEXT_STYLES } from '../constants/styles';
import type { ToolPageProps } from '../types';

const TextCounter: React.FC<{ text: string }> = ({ text }) => {
  const characters = text.length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="text-sm text-gray-600 text-right mt-2 pr-2">
      {characters} caractères / {words} mots
    </div>
  );
};

const UtilityButton: React.FC<{onClick: () => void, disabled?: boolean, children: React.ReactNode, 'aria-label': string, className?: string}> = ({ onClick, disabled = false, children, 'aria-label': ariaLabel, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
    >
      {children}
    </button>
);

const FormatterPage: React.FC<ToolPageProps> = ({ isFullscreen, setIsFullscreen }) => {
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const inputText = history[historyIndex];

  const updateText = (newText: string, fromHistory = false) => {
    if (newText === inputText) return;
    
    if (!fromHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newText);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prevIndex => prevIndex + 1);
    }
  };
  
  const handleStyleClick = (id: string) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const selectedText = inputText.substring(selectionStart, selectionEnd);

    if (selectedText.length === 0) {
      textarea.focus();
      return;
    }

    const style = TEXT_STYLES.find(s => s.id === id);
    if (!style) return;

    const transformedText = style.transform(selectedText);

    const newInputText =
      inputText.substring(0, selectionStart) +
      transformedText +
      inputText.substring(selectionEnd);

    updateText(newInputText);

    const newSelectionEnd = selectionStart + transformedText.length;
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(selectionStart, newSelectionEnd);
      }
    }, 0);
  };

  const copyToClipboard = async () => {
    if (!inputText) return;
    try {
      await navigator.clipboard.writeText(inputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const clearAll = () => {
    updateText('');
    setCopied(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <FullscreenButton isFullscreen={isFullscreen} onClick={() => setIsFullscreen(!isFullscreen)} />
      <div className="max-w-6xl w-full mx-auto h-full flex flex-col">
        <Header />
        <main className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex-grow">
          <div className="flex flex-col md:flex-row gap-8 h-full">
            
            {/* Desktop Tools Panel */}
            <div className="hidden md:flex flex-col space-y-6 md:w-1/3 md:order-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Outils d'Édition</label>
                <div className="flex items-center justify-center gap-3">
                    <ActionButton 
                        onClick={handleUndo} 
                        disabled={historyIndex === 0} 
                        aria-label="Annuler" 
                        iconClassName="fa-solid fa-rotate-left"
                        bgClassName="from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                    />
                    <ActionButton 
                        onClick={handleRedo} 
                        disabled={historyIndex >= history.length - 1} 
                        aria-label="Rétablir"
                        iconClassName="fa-solid fa-rotate-right"
                        bgClassName="from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Appliquer un style à la sélection
                </label>
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {TEXT_STYLES.map(style => (
                    <StyleButton
                      key={style.id}
                      style={style}
                      onClick={handleStyleClick}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-auto space-y-3 pt-6 border-t">
                 <UtilityButton 
                    onClick={copyToClipboard} 
                    disabled={!inputText} 
                    aria-label="Copier tout le texte"
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 border-transparent font-semibold transform hover:scale-105"
                  >
                    <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i> {copied ? 'Copié !' : 'Copier tout'}
                </UtilityButton>

                <UtilityButton
                  onClick={clearAll}
                  aria-label="Tout effacer"
                  className="w-full bg-red-500 text-white hover:bg-red-600 border-transparent font-semibold transform hover:scale-105"
                >
                  <i className="fa-solid fa-trash-can mr-2"></i> Tout Effacer
                </UtilityButton>
              </div>
            </div>

            {/* Text Area & Mobile Tools Panel */}
            <div className="flex flex-col md:w-2/3 md:order-1 h-full">
              <label htmlFor="editor" className="hidden md:block text-lg font-medium text-gray-800 mb-3">
                Votre Texte
              </label>

              {/* --- Mobile Toolbar --- */}
              <div className="md:hidden flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <ActionButton 
                        onClick={handleUndo} 
                        disabled={historyIndex === 0} 
                        aria-label="Annuler" 
                        iconClassName="fa-solid fa-rotate-left"
                        bgClassName="from-gray-500 to-gray-600 !w-9 !h-9"
                    />
                    <ActionButton 
                        onClick={handleRedo} 
                        disabled={historyIndex >= history.length - 1} 
                        aria-label="Rétablir"
                        iconClassName="fa-solid fa-rotate-right"
                        bgClassName="from-gray-500 to-gray-600 !w-9 !h-9"
                    />
                    <div className="flex-1 overflow-x-auto">
                        <div className="flex gap-2">
                            {TEXT_STYLES.map(style => {
                                const buttonClasses = `relative group flex-shrink-0 w-9 h-9 flex items-center justify-center text-white font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-md bg-gradient-to-br ${style.className}`;
                                return (
                                    <button
                                        key={style.id}
                                        onClick={() => handleStyleClick(style.id)}
                                        className={buttonClasses}
                                        aria-label={style.name}
                                    >
                                        <div className="text-xs transform scale-90">{style.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                 <div className="flex gap-3">
                    <UtilityButton 
                        onClick={copyToClipboard} 
                        disabled={!inputText} 
                        aria-label="Copier tout le texte"
                        className="w-full bg-blue-500 text-white hover:bg-blue-600 border-transparent font-semibold"
                    >
                        <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} mr-2`}></i> {copied ? 'Copié' : 'Copier'}
                    </UtilityButton>
                    <UtilityButton
                        onClick={clearAll}
                        aria-label="Tout effacer"
                        className="w-full bg-red-500 text-white hover:bg-red-600 border-transparent font-semibold"
                    >
                        <i className="fa-solid fa-trash-can mr-2"></i> Effacer
                    </UtilityButton>
                </div>
              </div>


              <TextAreaInput
                id="editor"
                value={inputText}
                onChange={(e) => updateText(e.target.value)}
                placeholder="Écrivez, sélectionnez et stylisez votre texte ici..."
                ref={inputRef}
                className="flex-grow !min-h-[40vh]"
              />
              <TextCounter text={inputText} />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default FormatterPage;
