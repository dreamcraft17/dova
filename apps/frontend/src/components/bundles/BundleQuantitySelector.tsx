import React from 'react';

export type BundleQuantitySelectorProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  error?: string;
  presetOptions?: number[];
};

export function BundleQuantitySelector({
  value,
  max,
  onChange,
  disabled = false,
  error,
  presetOptions = [1, 2, 5],
}: BundleQuantitySelectorProps) {
  const [inputValue, setInputValue] = React.useState(value.toString());

  React.useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handlePreset = (preset: number) => {
    if (disabled || preset > max) return;
    onChange(preset);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      onChange(1);
      setInputValue('1');
    } else if (parsed > max) {
      onChange(max);
      setInputValue(max.toString());
    } else {
      onChange(parsed);
      setInputValue(parsed.toString());
    }
  };

  return (
    <div className="bundle-quantity-selector">
      <div className="qty-select">
        <label className="delivery-slot-label">
          Quantity <span className="required">*</span>
        </label>
        <div className="qty-options">
          {presetOptions.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`slot-btn qty-preset${value === preset ? ' active' : ''}`}
              disabled={disabled || preset > max}
              onClick={() => handlePreset(preset)}
            >
              {preset} bundle{preset > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>
      <div className="row qty-custom-row">
        <label htmlFor="bundle-custom-qty">Or enter custom</label>
        <input
          id="bundle-custom-qty"
          type="number"
          min={1}
          max={max}
          step={1}
          value={inputValue}
          disabled={disabled}
          onChange={handleInputChange}
          onBlur={handleBlur}
          aria-label="Custom bundle quantity"
        />
      </div>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
