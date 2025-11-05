export function loadImageFromFile(file){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
export function canvasToBlob(canvas, type='image/png', quality=0.92){
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
export function changeExt(name, ext){
  const i = name.lastIndexOf('.');
  const base = i>0 ? name.slice(0,i) : name;
  return base + '.' + ext;
}
export function applyResize(canvas, mode, a, b){
  if(mode==='none' || !a) return canvas;
  const srcW = canvas.width, srcH = canvas.height;
  let w = srcW, h = srcH;
  if(mode==='longest'){
    const scale = a / Math.max(srcW, srcH);
    if(scale < 1){ w = Math.round(srcW*scale); h = Math.round(srcH*scale); }
  }else if(mode==='wh' && a && b){
    w = Math.round(a); h = Math.round(b);
  }else if(mode==='scale'){
    const scale = a/100;
    w = Math.round(srcW*scale); h = Math.round(srcH*scale);
  }
  if(w===srcW && h===srcH) return canvas;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d');
  ctx.drawImage(canvas, 0, 0, w, h);
  return out;
}
export function isSupportedImage(file){
  if(!file) return false;
  if(file.type && file.type.startsWith('image/')) return true;
  return /\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.name || '');
}
export const presets = {
  none: null,
  sq1080: { w:1080, h:1080 },
  pin1000x1500: { w:1000, h:1500 },
  ideo1080x1920: { w:1080, h:1920 },
  fbcover: { w:820, h:312 },
  xpost: { w:1200, h:675 },
  fbpost: { w:1200, h:1200 },
  ytthumb:{ w:1280, h:720 },
  li1200x628:{ w:1200, h:628 },
};
export function applyPreset(defaults, p){
  if(!p) return;
  defaults.resizeMode = 'wh';
  defaults.a = p.w; defaults.b = p.h;
}
let toastEl;
export function toast(msg){
  if(!toastEl){
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(()=>toastEl.classList.remove('show'), 2200);
}
export async function loadFromUrl(url){
  const res = await fetch(url, {mode:'cors'});
  if(!res.ok) throw new Error('HTTP '+res.status);
  const ct = res.headers.get('content-type') || '';
  if(!ct.startsWith('image/')) throw new Error('Not an image content-type');
  const blob = await res.blob();
  const name = url.split('/').pop().split('?')[0] || 'image';
  return new File([blob], name, { type: blob.type || ct });
}
export function pickerEnabled(kind){ return false; }
export async function pickFrom(kind){ return []; }
