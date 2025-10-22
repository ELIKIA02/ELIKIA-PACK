import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  'aria-label': string;
  iconClassName: string;
  bgClassName: string;
  size?: 'small' | 'normal';
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false, 'aria-label': ariaLabel, iconClassName, bgClassName, size = 'normal' }) => {
  const isSmall = size === 'small';

  const buttonClasses = `
    relative group ${isSmall ? 'w-9 h-9' : 'w-10 h-10'} flex items-center justify-center text-white font-semibold rounded-lg 
    transition-all duration-200 ease-in-out 
    ${isSmall ? 'shadow-md' : 'transform hover:-translate-y-1 shadow-md hover:shadow-xl'}
    focus:outline-none focus:ring-2 ${isSmall ? 'focus:ring-blue-400/50' : 'focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white'}
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md
    bg-gradient-to-br ${bgClassName}
  `;

  const iconClasses = isSmall ? 'text-sm' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      aria-label={ariaLabel}
    >
      <i className={`${iconClassName} ${iconClasses}`}></i>
      {!isSmall && (
        <span 
          className="absolute z-10 bottom-full mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        >
          {ariaLabel}
        </span>
      )}
    </button>
  );
};

export default ActionButton;