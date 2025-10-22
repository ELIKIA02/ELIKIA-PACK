import React, { useState, useRef, useEffect } from 'react';
import Slider from '../components/Slider';
import Toggle from '../components/Toggle';
import FullscreenButton from '../components/FullscreenButton';
import type { ToolPageProps } from '../types';

const defaultScript = `Bienvenue sur le prompteur professionnel !

Ceci est un exemple de texte pour vous montrer comment fonctionne le défilement.
Collez votre propre script dans cette zone lorsque le prompteur est en pause.

Appuyez sur "Play" pour démarrer.

Vous pouvez ajuster la vitesse de défilement et la taille du texte à l'aide des curseurs ci-dessous. Le mode miroir est également disponible pour une utilisation avec du matériel de prompteur physique.

Le défilement est conçu pour être fluide et constant, vous permettant de parler à un rythme naturel.

N'hésitez pas à expérimenter avec les différents réglages pour trouver ce qui vous convient le mieux.

Bonne présentation !
`;

const PrompterPage: React.FC<ToolPageProps> = ({ isFullscreen, setIsFullscreen }) => {
  const [script, setScript] = useState(defaultScript);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5); // Speed unit, not px/sec
  const [fontSize, setFontSize] = useState(48);
  const [isMirrored, setIsMirrored] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  
  const prompterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const scroll = () => {
    if (prompterRef.current) {
      // Increased speed multiplier for a more noticeable effect.
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
    textAlign: 'center',
  };
  
  const shouldMirror = isMirrored && isPlaying;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <FullscreenButton isFullscreen={isFullscreen} onClick={() => setIsFullscreen(!isFullscreen)} />
      <div className="relative flex-grow flex flex-col bg-black rounded-xl shadow-2xl overflow-hidden">
        
        {!showSettings && (
          <div className="absolute top-0 left-0 right-0 p-3 bg-black/40 backdrop-blur-sm z-10 flex justify-center items-center gap-4 sm:gap-6 text-white text-xs sm:text-sm">
            <div className="flex items-center gap-2" title="Vitesse">
              <i className="fa-solid fa-gauge-high"></i>
              <span className="font-mono">{speed}</span>
            </div>
            <div className="flex items-center gap-2" title="Taille de la police">
              <i className="fa-solid fa-text-height"></i>
              <span className="font-mono">{fontSize}</span>
            </div>
            {isMirrored && (
              <div className="flex items-center gap-2" title="Mode Miroir activé">
                <i className="fa-solid fa-camera-rotate"></i>
                <span>Miroir</span>
              </div>
            )}
          </div>
        )}

        <div 
          ref={prompterRef}
          className="flex-grow overflow-y-scroll p-12 text-white"
        >
          <div style={{ transform: shouldMirror ? 'scaleX(-1)' : 'scaleX(1)' }} className="transition-transform duration-300">
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

        <div className={`bg-gray-800/90 backdrop-blur-sm p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center transition-transform duration-300 ease-in-out z-20 ${!showSettings ? 'translate-y-full' : 'translate-y-0'}`}>
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
          </div>

          <div className="flex items-center justify-center">
            <Toggle label="Mode Miroir" enabled={isMirrored} setEnabled={setIsMirrored} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrompterPage;
