import { convertImage } from './modules/imageConvert.js';
import { loadFromUrl, isSupportedImage, presets, applyPreset, toast, pickerEnabled, pickFrom } from './modules/utils.js';

const fileInput = document.getElementById('fileInput');
const btnChoose = document.getElementById('btnChoose');
const dropzone  = document.getElementById('dropzone');
const hamburger = document.getElementById('hamburger');
const mobileMenu= document.getElementById('mobileMenu');
const jobs      = document.getElementById('jobs');
const urlInput  = document.getElementById('urlInput');
const btnImportUrl = document.getElementById('btnImportUrl');
const btnGDrive = document.getElementById('btnGDrive');
const btnDropbox= document.getElementById('btnDropbox');

// Defaults
const defaults = {
  quality: 0.9,
  resizeMode: 'none',
  a: null,
  b: null,
};

// UI: default settings + presets
const q = document.getElementById('defaultQuality');
const mode = document.getElementById('defaultResizeMode');
const resBlock = document.getElementById('resizeInputs');
const a = document.getElementById('resizeA');
const b = document.getElementById('resizeB');
const presetSel = document.getElementById('preset');

document.getElementById('applyDefaults').addEventListener('click', () => {
  defaults.quality = (+q.value)/100;
  defaults.resizeMode = mode.value;
  defaults.a = a.value ? +a.value : null;
  defaults.b = b.value ? +b.value : null;
  toast('Defaults updated ✅');
});
mode.addEventListener('change', () => {
  resBlock.style.display = mode.value === 'none' ? 'none' : 'grid';
});
presetSel.addEventListener('change', () => {
  const p = presets[presetSel.value];
  if (p){
    applyPreset(defaults, p);
    // reflect into UI
    mode.value = 'wh';
    resBlock.style.display = 'grid';
    a.value = p.w; b.value = p.h;
    toast('Preset applied');
  }
});

// File input + dnd
btnChoose.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => addJobs([...e.target.files]));

['dragenter','dragover'].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); e.stopPropagation(); dropzone.style.borderColor = '#2CB1BC';
}));
['dragleave','drop'].forEach(evt => dropzone.addEventListener(evt, e => {
  e.preventDefault(); e.stopPropagation(); dropzone.style.borderColor = '#cdd5d8';
}));
dropzone.addEventListener('drop', (e) => addJobs([...e.dataTransfer.files]));

// Mobile menu toggle
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));

// URL import
btnImportUrl.addEventListener('click', async () => {
  const url = (urlInput.value || '').trim();
  if(!url) return toast('Please paste an image URL');
  try{
    const file = await loadFromUrl(url);
    addJobs([file]);
    toast('URL imported');
  }catch(err){
    toast('URL import failed (CORS/non-image).');
    console.error(err);
  }
});

// Cloud pickers (stubs; enable by adding keys + modules)
[btnGDrive, btnDropbox].forEach(btn => {
  if(!pickerEnabled(btn.dataset.picker)){
    btn.classList.add('disabled'); btn.disabled = true;
    btn.title = 'Not configured';
  }else{
    btn.addEventListener('click', async () => {
      const files = await pickFrom(btn.dataset.picker);
      addJobs(files);
    });
  }
});

// Bulk convert
const bulkFormatSel = document.getElementById('bulkFormat');
document.getElementById('btnConvertAll').addEventListener('click', async () => {
  const format = bulkFormatSel.value;
  // set all selects to bulk format
  document.querySelectorAll('.job select').forEach(sel => { sel.value = format; sel.dispatchEvent(new Event('change')); });
  const allRun = [...document.querySelectorAll('.job .controls .btn.primary')];
  for(const btn of allRun){
    await btn.click();
  }
});

function addJobs(files){
  for(const file of files){
    if(!isSupportedImage(file)){
      toast('Unsupported format: ' + (file.type || file.name));
      continue;
    }
    if (/(heic|heif)/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)){
      toast('HEIC/HEIF need server add‑on. Skipped.');
      continue;
    }

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

    format.addEventListener('change', () => { run.textContent = 'Convert'; run.disabled = false; });

    run.addEventListener('click', async () => {
      run.disabled = true; run.textContent = 'Converting…';
      try {
        const opts = JSON.parse(JSON.stringify(defaults));
        const { blob, outName } = await convertImage(file, format.value, opts);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outName;
        a.click();
        URL.revokeObjectURL(url);
        run.textContent = 'Done ✓';
      } catch(err){
        console.error(err);
        toast('Conversion failed: ' + err.message);
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
