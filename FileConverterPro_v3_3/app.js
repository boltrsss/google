import { convertImage } from './modules/imageConvert.js';
// FIX: removed bad import of dataURLToBlob. We only need withDefaults (from utils) if desired.
// For clarity, we inline a tiny withDefaults here to avoid extra coupling.
const withDefaults = (d) => JSON.parse(JSON.stringify(d));

const fileInput = document.getElementById('fileInput');
const btnChoose = document.getElementById('btnChoose');
const dropzone  = document.getElementById('dropzone');
const hamburger = document.getElementById('hamburger');
const mobileMenu= document.getElementById('mobileMenu');
const jobs      = document.getElementById('jobs');

// Defaults
const defaults = {
  quality: 0.9,
  resizeMode: 'none',
  a: null,
  b: null,
};

// UI: default settings
const q = document.getElementById('defaultQuality');
const mode = document.getElementById('defaultResizeMode');
const resBlock = document.getElementById('resizeInputs');
const a = document.getElementById('resizeA');
const b = document.getElementById('resizeB');
document.getElementById('applyDefaults').addEventListener('click', () => {
  defaults.quality = (+q.value)/100;
  defaults.resizeMode = mode.value;
  defaults.a = a.value ? +a.value : null;
  defaults.b = b.value ? +b.value : null;
  alert('Defaults updated ✅');
});
mode.addEventListener('change', () => {
  resBlock.style.display = mode.value === 'none' ? 'none' : 'grid';
});

// File input + dnd
if (btnChoose && fileInput) btnChoose.addEventListener('click', () => fileInput.click());
if (fileInput) fileInput.addEventListener('change', (e) => addJobs([...e.target.files]));

['dragenter','dragover'].forEach(evt => dropzone && dropzone.addEventListener(evt, e => {
  e.preventDefault(); e.stopPropagation(); dropzone.style.borderColor = '#2CB1BC';
}));
['dragleave','drop'].forEach(evt => dropzone && dropzone.addEventListener(evt, e => {
  e.preventDefault(); e.stopPropagation(); dropzone.style.borderColor = '#cdd5d8';
}));
dropzone && dropzone.addEventListener('drop', (e) => addJobs([...e.dataTransfer.files]));

// Mobile menu toggle
hamburger && hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

function addJobs(files){
  if (!jobs) return;
  for(const file of files){
    if(!file.type.startsWith('image/')) continue;
    const li = document.createElement('li');
    li.className = 'job';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<strong>${file.name}</strong><div class="small">${Math.round(file.size/1024)} KB · <span class="badge">${file.type || 'image'}</span></div>`;

    const format = document.createElement('select');
    format.innerHTML = `<option value="png">PNG</option><option value="jpeg">JPG</option><option value="webp">WEBP</option>`;

    const run = document.createElement('button');
    run.className = 'btn primary';
    run.textContent = 'Convert';
    run.addEventListener('click', async () => {
      run.disabled = true; run.textContent = 'Converting…';
      try {
        const opts = withDefaults(defaults);
        const { blob, outName } = await convertImage(file, format.value, opts);
        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outName;
        a.click();
        URL.revokeObjectURL(url);
        run.textContent = 'Done ✓';
      } catch(err){
        console.error(err);
        alert('Conversion failed: ' + err.message);
        run.textContent = 'Convert';
      } finally {
        run.disabled = false;
      }
    });

    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.appendChild(format);
    controls.appendChild(run);

    li.appendChild(meta);
    li.appendChild(controls);
    jobs.appendChild(li);
  }
}
