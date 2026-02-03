import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

test('renders menu button', () => {
  render(<App />);
  const menuButton = screen.getByLabelText(/open settings/i);
  expect(menuButton).toBeInTheDocument();
});

test('renders timer in ready state', () => {
  render(<App />);
  const readyText = screen.getByText(/tap to start/i);
  expect(readyText).toBeInTheDocument();
});

test('opens settings when menu button is clicked', () => {
  render(<App />);
  const menuButton = screen.getByLabelText(/open settings/i);
  fireEvent.click(menuButton);
  
  const settingsTitle = screen.getByText(/settings/i);
  expect(settingsTitle).toBeInTheDocument();
});

test('closes settings when close button is clicked', () => {
  render(<App />);
  const menuButton = screen.getByLabelText(/open settings/i);
  fireEvent.click(menuButton);
  
  const closeButton = screen.getByLabelText(/close settings/i);
  fireEvent.click(closeButton);
  
  const readyText = screen.getByText(/tap to start/i);
  expect(readyText).toBeInTheDocument();
});

test('menu button is disabled when timer is running', async () => {
  render(<App />);
  const startButton = screen.getByLabelText(/start/i);
  fireEvent.click(startButton);
  
  await waitFor(() => {
    const menuButton = screen.getByLabelText(/open settings/i);
    expect(menuButton).toBeDisabled();
  });
});
