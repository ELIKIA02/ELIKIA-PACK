import React from 'react';
import type { TextStyle } from '../types';

interface StyleButtonProps {
  style: TextStyle;
  onClick: (id: string) => void;
  size?: 'small' | 'normal';
}

const StyleButton: React.FC<StyleButtonProps> = ({ style, onClick, size = 'normal' }) => {
  const isSmall = size === 'small';

  const buttonClasses = `
    relative group w-full h-full flex items-center justify-center text-white font-semibold rounded-lg 
    transition-all duration-200 ease-in-out
    ${isSmall ? 'shadow-sm' : 'transform hover:-translate-y-1 shadow-md hover:shadow-xl'}
    focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white
    bg-gradient-to-br ${style.className}
  `;

  const iconContainerClasses = isSmall ? 'text-xs' : 'text-sm md:text-base';

  return (
    <button
      onClick={() => onClick(style.id)}
      className={buttonClasses}
      aria-label={style.name}
    >
      <div className={iconContainerClasses}>
        {style.label}
      </div>
      {!isSmall && (
        <span 
          className="absolute z-10 bottom-full mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        >
          {style.name}
        </span>
      )}
    </button>
  );
};

export default StyleButton;