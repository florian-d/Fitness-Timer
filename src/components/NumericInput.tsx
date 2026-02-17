import React from 'react';
import './NumericInput.css';

interface NumericInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  decrementLabel?: string;
  incrementLabel?: string;
  inputId?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
  inputId
}) => {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  };

  return (
    <div className="numeric-input">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-group">
        <button
          onClick={handleDecrement}
          aria-label={`${decrementLabel} ${label}`}
        >
          −
        </button>
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
        />
        <button
          onClick={handleIncrement}
          aria-label={`${incrementLabel} ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default NumericInput;
