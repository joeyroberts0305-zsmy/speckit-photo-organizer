# Speckit Photo Organizer (Vite + sql.js)

This variant stores album metadata in a local SQLite DB using `sql.js` (SQLite compiled to WASM). Image blobs are stored in IndexedDB.

Quick start

```bash
# from project root
npm install
npm run dev
# open http://localhost:5173
```

Notes & Limitations
- The SQLite DB is stored in IndexedDB as a binary blob (serialized sqlite DB). Images are stored separately in IndexedDB.
- No images are uploaded to a remote server.
- For production you'd likely move sqlite storage to server-side or use a more robust browser-storage strategy depending on size.

