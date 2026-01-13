import { insertPhoto, fetchAlbums, updateAlbumOrder, storeImageBlob, fetchAlbums as getAlbums, getImageBlobURL, createAlbumIfMissing } from './db.js';

const fileInput = document.getElementById('fileInput');
const albumsContainer = document.getElementById('albumsContainer');
const clearBtn = document.getElementById('clearBtn');

let draggingId = null;

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
    const created = Date.now();
    await storeImageBlob(id, f);
    await insertPhoto({id, name: f.name, album, created_at: created});
  }
  await renderAlbums();
}

async function clearAll(){
  // for demo: clear DB by reloading the page storage (simple approach)
  if(confirm('Clear all photos and albums from this browser?')){
    localStorage.clear();
    // Drop IndexedDB database
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
    placeholder.textContent = 'No albums yet — upload photos to get started.';
    albumsContainer.appendChild(placeholder);
    return;
  }

  for(const alb of albums){
    const el = await createAlbumElement(alb);
    albumsContainer.appendChild(el);
  }
}

async function createAlbumElement(album){
  const card = document.createElement('article');
  card.className = 'album';
  card.setAttribute('draggable','true');
  card.dataset.albumId = album.id;

  // drag events
  card.addEventListener('dragstart',(e)=>{
    draggingId = album.id;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', album.id);
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend',()=>{
    draggingId = null;
    card.classList.remove('dragging');
    document.querySelectorAll('.album').forEach(a=>a.classList.remove('dropTarget'));
  });

  card.addEventListener('dragover',(e)=>{
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    card.classList.add('dropTarget');
  });
  card.addEventListener('dragleave',()=>{
    card.classList.remove('dropTarget');
  });
  card.addEventListener('drop',async(e)=>{
    e.preventDefault();
    card.classList.remove('dropTarget');
    const fromId = e.dataTransfer.getData('text/plain') || draggingId;
    const toId = album.id;
    if(!fromId || fromId===toId) return;
    await reorderAlbums(fromId,toId);
  });

  // header
  const header = document.createElement('div');
  header.className = 'albumHeader';
  const title = document.createElement('div');
  title.className = 'albumTitle';
  title.textContent = album.title + ` (${album.photos.length})`;
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
  if(album.photos.length===0){
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No photos';
    grid.appendChild(empty);
  } else {
    for(const p of album.photos){
      const tile = document.createElement('div');
      tile.className = 'photoTile';
      const img = document.createElement('img');
      const url = await getImageBlobURL(p.id);
      img.src = url || '';
      img.alt = p.name;
      tile.appendChild(img);
      grid.appendChild(tile);
    }
  }

  card.appendChild(header);
  card.appendChild(grid);
  return card;
}

async function reorderAlbums(fromId,toId){
  // fetch current order and rearrange
  const albums = await getAlbums();
  const ids = albums.map(a=>a.id);
  const fromIndex = ids.indexOf(fromId);
  const toIndex = ids.indexOf(toId);
  if(fromIndex===-1 || toIndex===-1) return;
  ids.splice(fromIndex,1);
  ids.splice(toIndex,0,fromId);
  await updateAlbumOrder(ids);
  await renderAlbums();
}

// allow dropping to end of container
albumsContainer.addEventListener('dragover', (e)=>{
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});
albumsContainer.addEventListener('drop', async (e)=>{
  e.preventDefault();
  const fromId = e.dataTransfer.getData('text/plain') || draggingId;
  if(!fromId) return;
  const albums = await getAlbums();
  const ids = albums.map(a=>a.id).filter(i=>i!==fromId);
  ids.push(fromId);
  await updateAlbumOrder(ids);
  await renderAlbums();
});

// initialize db and bind UI
(async function init(){
  // the db module has already initialized when imported (it dynamically loads sql.js on its first call)
  fileInput.addEventListener('change', async (e)=>{ await addFiles(e.target.files); fileInput.value = ''; });
  clearBtn.addEventListener('click', clearAll);
  await renderAlbums();
})();
