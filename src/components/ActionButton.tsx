import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  'aria-label': string;
  iconClassName: string;
  bgClassName: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false, 'aria-label': ariaLabel, iconClassName, bgClassName }) => {
  const buttonClasses = `
    relative group w-10 h-10 flex items-center justify-center text-white font-semibold rounded-lg 
    transition-all duration-200 ease-in-out transform hover:-translate-y-1 
    shadow-md hover:shadow-xl
    focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md
    bg-gradient-to-br ${bgClassName}
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      aria-label={ariaLabel}
    >
      <i className={iconClassName}></i>
      <span 
        className="absolute z-10 bottom-full mb-2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        {ariaLabel}
      </span>
    </button>
  );
};

export default ActionButton;
