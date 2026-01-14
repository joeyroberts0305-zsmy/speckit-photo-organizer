import { initDB, insertPhoto, fetchAlbums, updateAlbumOrder, storeImageBlob, fetchAlbums as getAlbums, getImageBlobURL, createAlbumIfMissing } from './db.js';
import { classifyImage, initClassifier } from './classifier.js';

const fileInput = document.getElementById('fileInput');
const albumsContainer = document.getElementById('albumsContainer');
const clearBtn = document.getElementById('clearBtn');

let draggingId = null;

const CATEGORY_ICONS = {
  people: '👥',
  animals: '🐾',
  plants: '🌿',
  other: '📷'
};

const CATEGORY_NAMES = {
  people: 'People',
  animals: 'Animals',
  plants: 'Plants',
  other: 'Other'
};

function formatDateKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function cryptoRandomId(){
  return Math.random().toString(36).slice(2,9);
}

async function addFiles(fileList){
  const files = Array.from(fileList).filter(f=>f.type.startsWith('image/'));
  for(const f of files){
    const id = cryptoRandomId();
    const album = formatDateKey(new Date(f.lastModified));
    const category = await classifyImage(f);
    const created = Date.now();
    await storeImageBlob(id, f);
    await insertPhoto({id, name: f.name, album, category, created_at: created});
  }
  await renderAlbums();
}

async function clearAll(){
  if(confirm('Clear all photos and albums from this browser?')){
    localStorage.clear();
    const dbDelete = indexedDB.deleteDatabase('speckit-store');
    dbDelete.onsuccess = ()=>{ location.reload(); };
    dbDelete.onerror = ()=>{ alert('Failed to clear IndexedDB'); };
  }
}

async function renderAlbums(){
  albumsContainer.innerHTML = '';
  const albums = await getAlbums();
  
  if(albums.length===0){
    const placeholder = document.createElement('div');
    placeholder.className = 'albumPlaceholder';
    placeholder.textContent = 'No photos yet — upload photos to get started.';
    albumsContainer.appendChild(placeholder);
    return;
  }

  // Group photos by category across all albums
  const categoryGroups = {
    people: [],
    animals: [],
    plants: [],
    other: []
  };

  for(const alb of albums){
    for(const photo of alb.photos){
      const cat = photo.category || 'other';
      if(categoryGroups[cat]){
        categoryGroups[cat].push({...photo, albumDate: alb.title});
      }
    }
  }

  // Render category sections
  for(const [category, photos] of Object.entries(categoryGroups)){
    if(photos.length > 0){
      const section = await createCategorySection(category, photos);
      albumsContainer.appendChild(section);
    }
  }
}

async function createCategorySection(category, photos){
  const card = document.createElement('article');
  card.className = 'album categoryAlbum';
  card.dataset.category = category;

  // header
  const header = document.createElement('div');
  header.className = 'albumHeader';
  const title = document.createElement('div');
  title.className = 'albumTitle';
  title.textContent = `${CATEGORY_ICONS[category]} ${CATEGORY_NAMES[category]} (${photos.length})`;
  
  const actions = document.createElement('div');
  const toggle = document.createElement('button');
  toggle.textContent = 'Toggle';
  toggle.addEventListener('click',()=>{
    grid.classList.toggle('hidden');
  });
  actions.appendChild(toggle);
  header.appendChild(title);
  header.appendChild(actions);

  // grid
  const grid = document.createElement('div');
  grid.className = 'photoGrid';
  
  for(const p of photos){
    const tile = document.createElement('div');
    tile.className = 'photoTile';
    tile.title = `${p.name} (${p.albumDate})`;
    const img = document.createElement('img');
    const url = await getImageBlobURL(p.id);
    img.src = url || '';
    img.alt = p.name;
    tile.appendChild(img);
    grid.appendChild(tile);
  }

  card.appendChild(header);
  card.appendChild(grid);
  return card;
}

// allow dropping to end of container (kept for future drag/drop between categories)
albumsContainer.addEventListener('dragover', (e)=>{
  e.preventDefault();
});

// initialize db and bind UI
(async function init(){
  await initDB();
  await initClassifier();
  fileInput.addEventListener('change', async (e)=>{ 
    await addFiles(e.target.files); 
    fileInput.value = ''; 
  });
  clearBtn.addEventListener('click', clearAll);
  await renderAlbums();
})();


