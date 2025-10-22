import React from 'react';

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ isFullscreen, onClick }) => {
  const label = isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran';
  const icon = isFullscreen ? 'fa-compress' : 'fa-expand';

  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
      aria-label={label}
      title={label}
    >
      <i className={`fa-solid ${icon}`}></i>
    </button>
  );
};

export default FullscreenButton;
