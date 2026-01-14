// src/db.js
// Minimal wrapper around sql.js and IndexedDB to store SQLite DB binary and image blobs.

const IDB_NAME = 'speckit-store';
const IDB_VERSION = 1;
const STORE_IMAGES = 'images';
const STORE_DB = 'sqlite';

let SQL;
let db; // sql.js Database instance

function openIdb(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = ()=>{
      const idb = req.result;
      if(!idb.objectStoreNames.contains(STORE_IMAGES)) idb.createObjectStore(STORE_IMAGES);
      if(!idb.objectStoreNames.contains(STORE_DB)) idb.createObjectStore(STORE_DB);
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function idbGet(store, key = 'sqlite'){
  const idb = await openIdb();
  return new Promise((resolve, reject)=>{
    const tx = idb.transaction(store, 'readonly');
    const st = tx.objectStore(store);
    const r = st.get(key);
    r.onsuccess = ()=>resolve(r.result);
    r.onerror = ()=>reject(r.error);
  });
}

async function idbPut(store, key, value){
  const idb = await openIdb();
  return new Promise((resolve, reject)=>{
    const tx = idb.transaction(store, 'readwrite');
    const st = tx.objectStore(store);
    const r = st.put(value, key);
    r.onsuccess = ()=>resolve(r.result);
    r.onerror = ()=>reject(r.error);
  });
}

export async function initDB(){
  // load sql.js dynamically
  const mod = await import('sql.js');
  const initSqlJs = mod.default || mod;
  const basePath = import.meta.url.split('/').slice(0, -2).join('/');
  SQL = await initSqlJs({ locateFile: file => `${basePath}/node_modules/sql.js/dist/${file}` });

  // check for serialized DB in IndexedDB
  const serialized = await idbGet(STORE_DB, 'sqlite');
  if(serialized){
    db = new SQL.Database(new Uint8Array(serialized));
  } else {
    db = new SQL.Database();
    // create basic schema
    db.run(`CREATE TABLE IF NOT EXISTS albums (id TEXT PRIMARY KEY, title TEXT, position INTEGER);
            CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, name TEXT, album TEXT, created_at INTEGER);
    `);
    await persistDB();
  }
  return { runQuery, ensureAlbumExists, addPhoto, getAlbums, setAlbumOrder, persistDB, storeImageBlob, getImageBlobURL, exportDB };
}

async function persistDB(){
  const data = db.export();
  await idbPut(STORE_DB, 'sqlite', data);
}

async function exportDB(){
  return db.export();
}

function runQuery(sql, params=[]){
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while(stmt.step()){
    const row = stmt.getAsObject();
    rows.push(row);
  }
  stmt.free();
  return rows;
}

async function ensureAlbumExists(id){
  const rows = runQuery('SELECT id FROM albums WHERE id = ?',[id]);
  if(rows.length===0){
    const posRows = runQuery('SELECT MAX(position) as m FROM albums');
    const pos = (posRows[0] && posRows[0].m) ? posRows[0].m + 1 : 1;
    const stmt = db.prepare('INSERT INTO albums (id, title, position) VALUES (?, ?, ?)');
    stmt.run([id, id, pos]);
    stmt.free();
    await persistDB();
  }
}

async function addPhoto({id, name, album, created_at}){
  await ensureAlbumExists(album);
  const stmt = db.prepare('INSERT INTO photos (id,name,album,created_at) VALUES (?,?,?,?)');
  stmt.run([id, name, album, created_at]);
  stmt.free();
  await persistDB();
}

async function setAlbumOrder(order){
  // order is array of album ids in new positional order
  const stmt = db.prepare('UPDATE albums SET position = ? WHERE id = ?');
  for(let i=0;i<order.length;i++){
    stmt.run([i+1, order[i]]);
  }
  stmt.free();
  await persistDB();
}

function getAlbums(){
  // returns albums ordered by position with photo metadata (without image data)
  const albums = runQuery('SELECT id,title,position FROM albums ORDER BY position');
  for(const a of albums){
    const photos = runQuery('SELECT id,name,created_at FROM photos WHERE album = ? ORDER BY created_at',[a.id]);
    a.photos = photos;
  }
  return albums;
}

async function storeImageBlob(id, blob){
  // store blob with key = id in images store
  await idbPut(STORE_IMAGES, id, blob);
}

async function getImageBlobURL(id){
  const blob = await idbGet(STORE_IMAGES, id);
  if(!blob) return null;
  return URL.createObjectURL(blob);
}

export { persistDB as saveDB, ensureAlbumExists as createAlbumIfMissing, addPhoto as insertPhoto, getAlbums as fetchAlbums, setAlbumOrder as updateAlbumOrder, storeImageBlob, getImageBlobURL };
