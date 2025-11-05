// Utils — added dataURLToBlob shim for backward compatibility.
// (app.js hotfix no longer imports it, but keeping the export avoids future breakage.)
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
// Backward-compat shim: DataURL -> Blob
export function dataURLToBlob(dataURL){
  const parts = dataURL.split(',');
  const meta = parts[0];
  const base64 = parts[1];
  const mime = /data:(.*?);base64/.exec(meta)?.[1] || 'application/octet-stream';
  const bin = atob(base64);
  const len = bin.length;
  const u8 = new Uint8Array(len);
  for(let i=0;i<len;i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}
export function changeExt(name, ext){
  const i = name.lastIndexOf('.');
  const base = i>0 ? name.slice(0,i) : name;
  return base + '.' + ext;
}
export function withDefaults(d){
  return JSON.parse(JSON.stringify(d));
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
