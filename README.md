# Fitness-Timer

A Progressive Web App (PWA) for High-Intensity Interval Training (HIIT) workouts built with Vue 3 and TypeScript.

## Features

- 🏃‍♂️ **HIIT Timer**: Customizable exercise and rest intervals
- 🔴 **Visual Feedback**: Red background during exercise, green during rest
- ⏱️ **Large Timer Display**: Easy-to-read countdown in minutes and seconds
- 🔄 **Round Tracking**: Displays current round progress
- ⚙️ **Configurable Settings**: Adjust rounds, exercise duration, and rest duration
- 📱 **Mobile-First**: Optimized for iPhone and mobile devices
- 💾 **PWA Support**: Install as a standalone app on your device

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the app.

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Usage

1. **Start a workout**: Click the "Start" button
2. **Adjust settings**: Click the menu button (☰) in the top right
3. **Configure your workout**:
   - Set number of rounds
   - Set exercise duration (in seconds)
   - Set rest duration (in seconds)
4. **Control the timer**: Use Pause, Resume, and Reset buttons as needed

## Technology Stack

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Vitest**: Unit testing framework
- **Vite PWA Plugin**: Progressive Web App capabilities

## License

MIT
