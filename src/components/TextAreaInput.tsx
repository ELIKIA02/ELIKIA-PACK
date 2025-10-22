import React from 'react';

interface TextAreaInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  className?: string;
}

const TextAreaInput = React.forwardRef<HTMLTextAreaElement, TextAreaInputProps>(
  ({ id, value, onChange, placeholder, className = '' }, ref) => {
    return (
      <div className={`relative w-full rounded-2xl border-4 border-blue-400 bg-white p-2 shadow-inner ${className}`}>
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-full min-h-[50vh] resize-none bg-transparent px-2 py-1 text-gray-800 placeholder-gray-400 focus:outline-none"
          aria-label="Text editor"
        />
      </div>
    );
  }
);

export default TextAreaInput;
