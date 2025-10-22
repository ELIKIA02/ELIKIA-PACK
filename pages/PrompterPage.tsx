import React, { useState, useRef, useEffect } from 'react';
import Slider from '../components/Slider';
import Toggle from '../components/Toggle';
import FullscreenButton from '../components/FullscreenButton';
import type { ToolPageProps } from '../types';

const defaultScript = `Bienvenue sur le prompteur professionnel !

Ceci est un exemple de texte pour vous montrer comment fonctionne le défilement.
Collez votre propre script dans cette zone lorsque le prompteur est en pause.

Appuyez sur "Play" pour démarrer.

Vous pouvez ajuster la vitesse de défilement, la taille, l'alignement et la position de départ du texte à l'aide des commandes. Le mode miroir est également disponible pour une utilisation avec du matériel de prompteur physique.

Le défilement est conçu pour être fluide et constant, vous permettant de parler à un rythme naturel.

N'hésitez pas à expérimenter avec les différents réglages pour trouver ce qui vous convient le mieux.

Bonne présentation !
`;

type TextAlign = 'left' | 'center' | 'right' | 'justify';
type VerticalPosition = 'top' | 'middle' | 'bottom';

const PrompterPage: React.FC<ToolPageProps> = ({ isFullscreen, setIsFullscreen }) => {
  const [script, setScript] = useState(defaultScript);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [fontSize, setFontSize] = useState(48);
  const [isMirrored, setIsMirrored] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [textAlign, setTextAlign] = useState<TextAlign>('center');
  const [verticalPosition, setVerticalPosition] = useState<VerticalPosition>('top');
  
  const prompterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const scroll = () => {
    if (prompterRef.current) {
      prompterRef.current.scrollTop += speed * 0.05;
      animationFrameRef.current = requestAnimationFrame(scroll);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (prompterRef.current) {
      prompterRef.current.scrollTop = 0;
    }
  };

  const sharedTextStyles: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    lineHeight: 1.5,
    textAlign: textAlign,
  };
  
  const shouldMirror = isMirrored && isPlaying;

  const SettingButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    title: string;
    children: React.ReactNode;
  }> = ({ onClick, isActive, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <FullscreenButton isFullscreen={isFullscreen} onClick={() => setIsFullscreen(!isFullscreen)} />
      <div className="relative flex-grow bg-black rounded-xl shadow-2xl overflow-hidden">
        
        <div 
          ref={prompterRef}
          className="w-full h-full overflow-y-scroll p-12 text-white"
        >
          <div 
            style={{ 
              transform: shouldMirror ? 'scaleX(-1)' : 'scaleX(1)',
              paddingTop: verticalPosition === 'middle' ? '30vh' : verticalPosition === 'bottom' ? '60vh' : '0px',
              paddingBottom: '50vh'
            }} 
            className="transition-all duration-500 ease-in-out"
          >
            {isPlaying ? (
              <div style={sharedTextStyles} className="whitespace-pre-wrap">
                {script}
              </div>
            ) : (
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full h-full bg-transparent text-white resize-none border-none focus:outline-none"
                style={sharedTextStyles}
                aria-label="Script input"
              />
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute bottom-6 right-6 z-30 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={showSettings ? "Masquer les paramètres" : "Afficher les paramètres"}
          title={showSettings ? "Masquer les paramètres" : "Afficher les paramètres"}
        >
          <i className={`fa-solid ${showSettings ? 'fa-chevron-down' : 'fa-cog'}`}></i>
        </button>
        
        <div className={`absolute bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center transition-transform duration-300 ease-in-out z-20 ${!showSettings ? 'translate-y-full' : 'translate-y-0'}`}>
          <div className="flex items-center justify-center gap-4">
            <button onClick={handlePlayPause} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-bold w-32">
              <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} mr-2`}></i>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={handleReset} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
              <i className="fa-solid fa-arrow-rotate-left mr-2"></i>
              Reset
            </button>
          </div>
          
          <div className="space-y-4">
            <Slider label="Vitesse" value={speed} onChange={setSpeed} min={1} max={50} icon="fa-solid fa-gauge-high" />
            <Slider label="Taille Police" value={fontSize} onChange={setFontSize} min={12} max={120} icon="fa-solid fa-text-height" />
            <div className="flex items-center justify-center">
              <Toggle label="Mode Miroir" enabled={isMirrored} setEnabled={setIsMirrored} />
            </div>
          </div>
          
          <div className="space-y-4 flex flex-col items-center">
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-white">Alignement du Texte</label>
              <div className="flex items-center gap-2">
                <SettingButton onClick={() => setTextAlign('left')} isActive={textAlign === 'left'} title="Aligner à gauche"><i className="fa-solid fa-align-left"></i></SettingButton>
                <SettingButton onClick={() => setTextAlign('center')} isActive={textAlign === 'center'} title="Centrer"><i className="fa-solid fa-align-center"></i></SettingButton>
                <SettingButton onClick={() => setTextAlign('right')} isActive={textAlign === 'right'} title="Aligner à droite"><i className="fa-solid fa-align-right"></i></SettingButton>
                <SettingButton onClick={() => setTextAlign('justify')} isActive={textAlign === 'justify'} title="Justifier"><i className="fa-solid fa-align-justify"></i></SettingButton>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-white">Position de Départ</label>
              <div className="flex items-center gap-2">
                 <SettingButton onClick={() => setVerticalPosition('top')} isActive={verticalPosition === 'top'} title="Haut"><i className="fa-solid fa-arrow-up-to-line"></i></SettingButton>
                 <SettingButton onClick={() => setVerticalPosition('middle')} isActive={verticalPosition === 'middle'} title="Milieu"><i className="fa-solid fa-bars-staggered"></i></SettingButton>
                 <SettingButton onClick={() => setVerticalPosition('bottom')} isActive={verticalPosition === 'bottom'} title="Bas"><i className="fa-solid fa-arrow-down-to-line"></i></SettingButton>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center gap-8 transition-transform duration-300 ease-in-out z-20 ${showSettings ? 'translate-y-full' : 'translate-y-0'}`}>
            <button onClick={handlePlayPause} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-bold w-32">
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
            <div className="w-full max-w-xs">
                <Slider label="Vitesse" value={speed} onChange={setSpeed} min={1} max={50} icon="fa-solid fa-gauge-high" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrompterPage;