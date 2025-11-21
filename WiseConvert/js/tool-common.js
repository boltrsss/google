

function setResult(message, dataUrl, filename) {
  const result = document.querySelector('.result-area');
  if (!result) return;
  result.innerHTML = '';

  var infoText = '';
  if (typeof window !== 'undefined' && window.currentToolState && window.currentToolState.file) {
    var origBytes = window.currentToolState.file.size || 0;
    var origKb = (origBytes / 1024).toFixed(1);
    var outKb = null;
    if (dataUrl && dataUrl.startsWith('data:')) {
      var base64 = dataUrl.split(',')[1] || '';
      var outBytes = Math.floor(base64.length * 3 / 4);
      outKb = (outBytes / 1024).toFixed(1);
    }
    if (outKb !== null) {
      var diff = (origKb - outKb).toFixed(1);
      var perc = origKb > 0 ? (((origKb - outKb) / origKb) * 100).toFixed(1) : '0.0';
      infoText = ' (original: ' + origKb + ' KB → new: ' + outKb + ' KB, change: ' +
        (diff >= 0 ? '-' : '+') + Math.abs(diff) + ' KB, ' + perc + '%)';
    } else {
      infoText = ' (original: ' + origKb + ' KB)';
    }
  }

  const p = document.createElement('p');
  p.textContent = message + infoText;
  result.appendChild(p);

  if (dataUrl) {
    const previewWrap = document.createElement('div');
    previewWrap.className = 'result-preview';
    const img = document.createElement('img');
    img.src = dataUrl;
    previewWrap.appendChild(img);
    result.appendChild(previewWrap);
    const link = createDownloadLink(dataUrl, filename);
    result.appendChild(link);

    try {
      saveToHistory(message, dataUrl, filename);
    } catch (e) {}
  }
}


function saveToHistory(message, dataUrl, filename) {
  if (!dataUrl) return;
  var entry = {
    message: message,
    filename: filename || 'file',
    dataUrl: dataUrl,
    time: new Date().toISOString()
  };
  var list = [];
  try {
    var raw = localStorage.getItem('wiseconvert-history');
    if (raw) list = JSON.parse(raw);
  } catch (e) {}
  list.unshift(entry);
  if (list.length > 10) list = list.slice(0, 10);
  try {
    localStorage.setItem('wiseconvert-history', JSON.stringify(list));
  } catch (e) {}
}
