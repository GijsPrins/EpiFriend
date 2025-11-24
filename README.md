# EpiFriend

A premium, mobile-first web application for tracking epilepsy episodes and medication adherence.

## Features

- 📊 **Dashboard** - Quick overview with personalized greeting and medication status
- 💊 **Medication Management** - Track medications with multi-dose support and missed dose logging
- 🩺 **Episode Logging** - Quick and detailed episode tracking with multiple types
- 📅 **Calendar View** - Visual monthly overview with clickable days showing episode and medication details
- ⚙️ **Settings** - User profile, emergency contacts, and medical information
- 🌍 **Localization** - Full Dutch and English support

## Tech Stack

- **Framework**: Vue 3
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Localization**: vue-i18n
- **Data Storage**: localStorage (with future Supabase integration planned)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/          # Vue components
│   ├── ui/             # Reusable UI components (GlassCard, GlassButton, etc.)
│   ├── Dashboard.vue
│   ├── MedicationManager.vue
│   ├── CalendarView.vue
│   ├── SettingsView.vue
│   └── LogEpisodeModal.vue
├── composables/        # Vue composables for state management
│   ├── useSettings.js
│   ├── useMedicationStore.js
│   ├── useEpisodeStore.js
│   └── useMedicineDatabase.js
├── data/              # Static data
│   └── medicines.json
├── locales/           # Translation files
│   ├── nl.json
│   └── en.json
├── i18n.js           # i18n configuration
├── style.css         # Global styles
└── App.vue           # Main app component
```

## Design

EpiFriend features a modern glassmorphism design with:
- Deep purple and vibrant neon accent colors
- Dark mode interface
- Smooth animations and transitions
- Mobile-first responsive layout

## Privacy

All data is stored locally in your browser's localStorage. No data is sent to external servers, ensuring complete privacy.

## Future Enhancements

- Cloud sync with Supabase
- Export data as PDF/JSON
- Medication allergy cross-reference
- Advanced analytics and insights
- PWA support for offline usage

## License

Private project - All rights reserved

## Author

Built with ❤️ for tracking epilepsy and improving quality of life
