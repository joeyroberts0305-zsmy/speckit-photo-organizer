# Speckit Photo Organizer (Vite + sql.js + TensorFlow.js)

[![CI](https://github.com/joeyroberts0305-zsmy/speckit-photo-organizer/actions/workflows/ci.yml/badge.svg)](https://github.com/joeyroberts0305-zsmy/speckit-photo-organizer/actions/workflows/ci.yml)
[![Pages](https://github.com/joeyroberts0305-zsmy/speckit-photo-organizer/actions/workflows/deploy-pages.yml/badge.svg)](https://joeyroberts0305-zsmy.github.io/speckit-photo-organizer/)

A modern, fully client-side photo organizer that runs entirely in your browser. Upload photos, and they are automatically categorized using AI, then organized by type and date.

**[Try it live](https://joeyroberts0305-zsmy.github.io/speckit-photo-organizer/)** - No setup required!

## ✨ Features

- **📱 AI-Powered Auto-Categorization** - Photos automatically sorted into: 👥 People, 🐾 Animals, 🌿 Plants, 📷 Other
- **🗓️ Date-Based Organization** - Photos grouped by upload date within each category
- **💾 100% Client-Side Storage** - All data stays in your browser; nothing uploaded to servers
- **⚡ Fast & Responsive** - Built with Vite for instant load times
- **🎨 Modern UI** - Beautiful gradient design with smooth hover effects and animations
- **📊 Local SQLite DB** - Metadata stored in IndexedDB using sql.js (WebAssembly SQLite)
- **🔍 Image Preview** - Hover over photos to see date and filename
- **🗑️ One-Click Clear** - Reset all photos and albums without leaving the app

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev
# Open http://localhost:5173

# Build for production
npm run build
```

## How It Works

1. **Upload Photos** - Click "Upload Photos" and select images from your device
2. **AI Classification** - TensorFlow.js with MobileNet automatically analyzes each photo
3. **Auto-Organization** - Photos appear in category albums (People, Animals, Plants, Other)
4. **View by Category** - Toggle album visibility to focus on specific types
5. **Persistent Storage** - All photos and metadata saved locally in IndexedDB

## Technical Architecture

### Frontend Stack
- **Framework**: Vite + Vanilla JavaScript (no heavy dependencies)
- **UI**: Modern CSS with gradients and animations
- **Storage**: IndexedDB (images) + SQLite via sql.js (metadata)
- **AI**: TensorFlow.js + MobileNet v2 (client-side inference)

### Data Storage
- **Images**: Stored as blobs in IndexedDB
- **Metadata**: SQL database (serialized SQLite DB) in IndexedDB
- **Database**: sql.js (SQLite compiled to WebAssembly)
- **Schema**: Photos table with id, name, album (date), category, and timestamp

### Deployment
- **Hosting**: GitHub Pages (static files)
- **CI/CD**: GitHub Actions (build + deploy on push)
- **Base Path**: `/speckit-photo-organizer/` for GitHub Pages subdirectory

## Privacy & Security

✅ **Zero Server Upload** - All data stays on your device  
✅ **Offline Support** - Works without internet after initial load  
✅ **Session Isolation** - Each browser tab has independent storage  
✅ **Easy Reset** - Clear all data with one click  

## AI Classification Details

Uses [TensorFlow.js](https://www.tensorflow.org/js) with [MobileNet v2](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet):

**Supported Categories:**
- 👥 **People**: Detects faces, body parts, clothing (suit, shirt, dress, etc.)
- 🐾 **Animals**: Dogs, cats, birds, lions, tigers, leopards, and 30+ species
- 🌿 **Plants**: Flowers, trees, plants, succulents, gardens
- 📷 **Other**: Unmatched images

**Performance:**
- Inference: ~100-200ms per image
- Model: ~2-3MB (loaded from CDN)
- Confidence threshold: 5%+

**Limitations:**
- ⚠️ **People Detection** works best with frontal, unobstructed face photos
- Profile shots, partially visible faces, or people in action may be misclassified
- MobileNet trained on common objects; some specialized items classified as "Other"

## Browser Compatibility

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 14+
- ✅ Edge 79+

Requires WebAssembly (WASM) support and IndexedDB.

## Storage Limits

- **IndexedDB Quota**: 
  - Chrome: ~160MB (60% of available disk)
  - Firefox: ~50MB
  - Safari: ~50MB
  - Edge: ~160MB

Each photo takes ~50KB-500KB depending on resolution.

## Future Enhancements

- [ ] Manual category override buttons for misclassified images
- [ ] Export photo collection as ZIP
- [ ] Drag-and-drop between categories
- [ ] Search/filter by date range
- [ ] Dark/Light theme toggle
- [ ] Keyboard shortcuts
- [ ] Photo zoom/lightbox view

## Development

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run e2e tests (optional)
npm run test:e2e

# Run smoke tests
npm run ci:smoke
```

## License

MIT - Feel free to use, modify, and deploy!

## Contributing

Issues and pull requests welcome. Check [GitHub](https://github.com/joeyroberts0305-zsmy/speckit-photo-organizer) for open issues.


