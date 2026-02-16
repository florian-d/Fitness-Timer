import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NumericInput from './NumericInput';

describe('NumericInput Component', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    label: 'Test Label',
    value: 10,
    min: 1,
    max: 100,
    onChange: mockOnChange,
    inputId: 'test-input'
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders label and input field', () => {
    render(<NumericInput {...defaultProps} />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  test('increment button increases value', () => {
    render(<NumericInput {...defaultProps} />);
    const incrementBtn = screen.getByLabelText(/increase/i);
    fireEvent.click(incrementBtn);
    expect(mockOnChange).toHaveBeenCalledWith(11);
  });

  test('decrement button decreases value', () => {
    render(<NumericInput {...defaultProps} />);
    const decrementBtn = screen.getByLabelText(/decrease/i);
    fireEvent.click(decrementBtn);
    expect(mockOnChange).toHaveBeenCalledWith(9);
  });

  test('respects max constraint on increment', () => {
    render(<NumericInput {...defaultProps} value={100} />);
    const incrementBtn = screen.getByLabelText(/increase/i);
    fireEvent.click(incrementBtn);
    expect(mockOnChange).toHaveBeenCalledWith(100);
  });

  test('respects min constraint on decrement', () => {
    render(<NumericInput {...defaultProps} value={1} />);
    const decrementBtn = screen.getByLabelText(/decrease/i);
    fireEvent.click(decrementBtn);
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  test('direct input triggers onChange with validated value', () => {
    render(<NumericInput {...defaultProps} />);
    const input = screen.getByDisplayValue('10');
    fireEvent.change(input, { target: { value: '50' } });
    expect(mockOnChange).toHaveBeenCalledWith(50);
  });

  test('direct input clamps to min value', () => {
    render(<NumericInput {...defaultProps} />);
    const input = screen.getByDisplayValue('10');
    fireEvent.change(input, { target: { value: '0' } });
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });

  test('direct input clamps to max value', () => {
    render(<NumericInput {...defaultProps} />);
    const input = screen.getByDisplayValue('10');
    fireEvent.change(input, { target: { value: '200' } });
    expect(mockOnChange).toHaveBeenCalledWith(100);
  });

  test('respects step prop', () => {
    render(<NumericInput {...defaultProps} step={5} />);
    const incrementBtn = screen.getByLabelText(/increase/i);
    fireEvent.click(incrementBtn);
    expect(mockOnChange).toHaveBeenCalledWith(15);
  });

  test('handles non-numeric input gracefully', () => {
    render(<NumericInput {...defaultProps} />);
    const input = screen.getByDisplayValue('10');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });
});
