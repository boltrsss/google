
(() => {
// --- utils ---
function loadImageFromFile(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=URL.createObjectURL(file);});}
function canvasToBlob(canvas,type='image/png',quality=0.92){return new Promise(r=>canvas.toBlob(r,type,quality));}
function changeExt(name,ext){const i=name.lastIndexOf('.');const base=i>0?name.slice(0,i):name;return base+'.'+ext;}
function applyResize(canvas,mode,a,b){if(mode==='none'||!a)return canvas;const srcW=canvas.width,srcH=canvas.height;let w=srcW,h=srcH;if(mode==='longest'){const s=a/Math.max(srcW,srcH);if(s<1){w=Math.round(srcW*s);h=Math.round(srcH*s);}}else if(mode==='wh'&&a&&b){w=Math.round(a);h=Math.round(b);}else if(mode==='scale'){const s=a/100;w=Math.round(srcW*s);h=Math.round(srcH*s);}if(w===srcW&&h===srcH)return canvas;const out=document.createElement('canvas');out.width=w;out.height=h;out.getContext('2d').drawImage(canvas,0,0,w,h);return out;}
function isSupportedImage(file){if(!file)return false;if(file.type&&file.type.startsWith('image/'))return true;return /\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.name||'');}
const presets={none:null,sq1080:{w:1080,h:1080},pin1000x1500:{w:1000,h:1500},ideo1080x1920:{w:1080,h:1920},fbcover:{w:820,h:312},xpost:{w:1200,h:675},fbpost:{w:1200,h:1200},ytthumb:{w:1280,h:720},li1200x628:{w:1200,h:628}};
function applyPreset(defs,p){if(!p)return;defs.resizeMode='wh';defs.a=p.w;defs.b=p.h;}
let toastEl;function toast(msg){if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';document.body.appendChild(toastEl);}toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastEl._t);toastEl._t=setTimeout(()=>toastEl.classList.remove('show'),2200);}
async function loadFromUrl(url){const res=await fetch(url,{mode:'cors'});if(!res.ok)throw new Error('HTTP '+res.status);const ct=res.headers.get('content-type')||'';if(!ct.startsWith('image/'))throw new Error('Not an image');const blob=await res.blob();const name=url.split('/').pop().split('?')[0]||'image';return new File([blob],name,{type:blob.type||ct});}
// --- imageConvert ---
async function convertImage(file,target='png',opts={quality:0.9,resizeMode:'none',a:null,b:null}){
  const img=await loadImageFromFile(file);
  const canvas=document.createElement('canvas');
  canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
  canvas.getContext('2d').drawImage(img,0,0);
  const resized=applyResize(canvas,opts.resizeMode,opts.a,opts.b);
  let mime='image/png',ext='png';if(target==='jpeg'||target==='jpg'){mime='image/jpeg';ext='jpg';}if(target==='webp'){mime='image/webp';ext='webp';}
  const blob=await canvasToBlob(resized,mime,opts.quality||0.9);
  const outName=changeExt(file.name,ext);
  return {blob,outName};
}
// --- app ---
const fileInput=document.getElementById('fileInput');
const btnChoose=document.getElementById('btnChoose');
const dropzone=document.getElementById('dropzone');
const hamburger=document.getElementById('hamburger');
const mobileMenu=document.getElementById('mobileMenu');
const jobs=document.getElementById('jobs');
const urlInput=document.getElementById('urlInput');
const btnImportUrl=document.getElementById('btnImportUrl');
const btnGDrive=document.getElementById('btnGDrive');
const btnDropbox=document.getElementById('btnDropbox');
const defaults={quality:0.9,resizeMode:'none',a:null,b:null};
const q=document.getElementById('defaultQuality');
const mode=document.getElementById('defaultResizeMode');
const resBlock=document.getElementById('resizeInputs');
const a=document.getElementById('resizeA');
const b=document.getElementById('resizeB');
const presetSel=document.getElementById('preset');
document.getElementById('applyDefaults').addEventListener('click',()=>{defaults.quality=(+q.value)/100;defaults.resizeMode=mode.value;defaults.a=a.value?+a.value:null;defaults.b=b.value?+b.value:null;toast('Defaults updated ✅');});
mode.addEventListener('change',()=>{resBlock.style.display=mode.value==='none'?'none':'grid';});
presetSel.addEventListener('change',()=>{const p=presets[presetSel.value];if(p){applyPreset(defaults,p);mode.value='wh';resBlock.style.display='grid';a.value=p.w;b.value=p.h;toast('Preset applied');}});
btnChoose.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>addJobs([...e.target.files]));
['dragenter','dragover'].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();e.stopPropagation();dropzone.style.borderColor='#2CB1BC';}));
['dragleave','drop'].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();e.stopPropagation();dropzone.style.borderColor='#cdd5d8';}));
dropzone.addEventListener('drop',e=>addJobs([...e.dataTransfer.files]));
hamburger.addEventListener('click',()=>mobileMenu.classList.toggle('open'));
btnImportUrl.addEventListener('click',async()=>{const url=(urlInput.value||'').trim();if(!url)return toast('Please paste an image URL');try{const file=await loadFromUrl(url);addJobs([file]);toast('URL imported');}catch(err){toast('URL import failed (CORS/non-image).');console.error(err);}});
[btnGDrive,btnDropbox].forEach(btn=>{btn.classList.add('disabled');btn.disabled=true;btn.title='Not configured';});
const bulkFormatSel=document.getElementById('bulkFormat');
document.getElementById('btnConvertAll').addEventListener('click',async()=>{const format=bulkFormatSel.value;document.querySelectorAll('.job select').forEach(sel=>{sel.value=format;sel.dispatchEvent(new Event('change'));});const allRun=[...document.querySelectorAll('.job .controls .btn.primary')];for(const btn of allRun){await btn.click();}});
function addJobs(files){for(const file of files){if(!isSupportedImage(file)){toast('Unsupported format: '+(file.type||file.name));continue;}if(/(heic|heif)/i.test(file.type)||/\.(heic|heif)$/i.test(file.name)){toast('HEIC/HEIF need server add‑on. Skipped.');continue;}const li=document.createElement('li');li.className='job';const meta=document.createElement('div');meta.className='meta';meta.innerHTML=`<strong>${file.name}</strong><div class="small">${Math.round(file.size/1024)} KB · <span class="badge">${file.type||'image'}</span></div>`;const format=document.createElement('select');format.innerHTML=`<option value="png">PNG</option><option value="jpeg">JPG</option><option value="webp">WEBP</option>`;const run=document.createElement('button');run.className='btn primary';run.textContent='Convert';format.addEventListener('change',()=>{run.textContent='Convert';run.disabled=false;});run.addEventListener('click',async()=>{run.disabled=True;run.textContent='Converting…';try{const opts=JSON.parse(JSON.stringify(defaults));const {blob,outName}=await convertImage(file,format.value,opts);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=outName;a.click();URL.revokeObjectURL(url);run.textContent='Done ✓';}catch(err){console.error(err);toast('Conversion failed: '+err.message);run.textContent='Convert';}finally{run.disabled=false;}});const controls=document.createElement('div');controls.className='controls';controls.appendChild(format);controls.appendChild(run);li.appendChild(meta);li.appendChild(controls);jobs.appendChild(li);}}}
)();
