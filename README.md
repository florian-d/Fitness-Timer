# HIIT Timer - High-Intensity Interval Training Timer

A Progressive Web App (PWA) for High-Intensity Interval Training (HIIT) workouts. Built with React and TypeScript, optimized for mobile devices, especially iPhones.

## Features

- **Visual Timer Display**: Large, high-contrast timer display for easy visibility during workouts
- **Color-Coded Phases**: 
  - 🔴 Red background during exercise periods
  - 🟢 Green background during rest periods
  - ⚪ Gray background in ready state
- **Customizable Workouts**: Configure number of rounds, exercise time, and rest time
- **Auto-Progression**: Automatically transitions between exercise and rest phases
- **Mobile-Optimized**: Responsive design focused on iPhone and mobile devices
- **PWA Support**: Install on your home screen for app-like experience
- **Offline Ready**: Works without internet connection once installed

## Screenshots

### Ready State
![Ready State](https://github.com/user-attachments/assets/34a058ea-f1e1-455b-9703-62bc88bb6bc5)

### Exercise Phase (Red)
![Exercise State](https://github.com/user-attachments/assets/4dc74cbd-ebb7-4f54-9984-b4c28de0546e)

### Rest Phase (Green)
![Rest State](https://github.com/user-attachments/assets/6bd7f5bd-f340-4572-b3b9-b8f1d87f4dd6)

### Settings Screen
![Settings](https://github.com/user-attachments/assets/45a0b82f-5a24-410b-82b8-e18270df0d93)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/florian-d/Fitness-Timer.git
cd Fitness-Timer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `build/` folder.

## Usage

1. **Open Settings**: Tap the menu button (☰) in the top right corner
2. **Configure Workout**:
   - Set the number of rounds (1-50)
   - Set exercise time in seconds (5-600)
   - Set rest time in seconds (5-300)
   - View total workout time
3. **Save & Start**: Tap the "Save & Start" button
4. **Begin Workout**: Tap the play button (▶) to start
5. **Control Timer**:
   - Pause/Resume: Tap the pause (⏸) or play (▶) button
   - Reset: Tap the reset (⟲) button to return to ready state

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage --watchAll=false
```

## PWA Installation on iPhone

1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

The app will now appear on your home screen and can be launched like a native app.

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **React Scripts** - Build tooling
- **Workbox** - Service worker and PWA support
- **Jest & React Testing Library** - Testing
- **GitHub Actions** - CI/CD pipeline

## CI/CD

The project includes a GitHub Actions workflow that:
- Runs tests on Node.js 18.x and 20.x
- Builds the application
- Deploys to GitHub Pages on push to main branch

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.