import React from 'react';

interface SliderProps {
  label: string;
  icon: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider: React.FC<SliderProps> = ({ label, icon, value, onChange, min = 0, max = 100, step = 1 }) => {
  return (
    <div className="flex items-center gap-3 text-white">
      <label htmlFor={label} className="flex items-center gap-2 w-32 text-sm font-medium">
        <i className={icon}></i>
        <span>{label}</span>
      </label>
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm font-mono w-10 text-center">{value}</span>
    </div>
  );
};

export default Slider;
