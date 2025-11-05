import { loadImageFromFile, canvasToBlob, changeExt, applyResize } from './modules/utils.js';

export async function convertImage(file, target='png', opts={quality:0.9, resizeMode:'none', a:null, b:null}){
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const resized = applyResize(canvas, opts.resizeMode, opts.a, opts.b);
  let mime = 'image/png', ext = 'png';
  if(target==='jpeg' || target==='jpg'){ mime='image/jpeg'; ext='jpg'; }
  if(target==='webp'){ mime='image/webp'; ext='webp'; }
  const blob = await canvasToBlob(resized, mime, opts.quality || 0.9);
  const outName = changeExt(file.name, ext);
  return { blob, outName };
}
