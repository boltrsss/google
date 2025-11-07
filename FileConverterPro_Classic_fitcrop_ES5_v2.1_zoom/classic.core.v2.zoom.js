
(function(){
  function $(q,el){ return (el||document).querySelector(q); }
  function $$(q,el){ return Array.prototype.slice.call((el||document).querySelectorAll(q)); }

  var toastEl = $('#toast');
  function toast(msg){ toastEl.textContent=msg; toastEl.classList.add('show'); setTimeout(function(){ toastEl.classList.remove('show'); }, 1600); }

  var chooseBtn=$('#chooseBtn'), fileInput=$('#fileInput'), list=$('#fileList'), dropArea=$('#dropArea');
  chooseBtn.onclick=function(){ fileInput.click(); };
  fileInput.onchange=function(e){ for(var i=0;i<e.target.files.length;i++){ addRow(e.target.files[i]); } fileInput.value=''; };
  ;['dragenter','dragover'].forEach(function(evt){ dropArea.addEventListener(evt,function(e){ e.preventDefault(); dropArea.classList.add('hover'); });});
  ;['dragleave','drop'].forEach(function(evt){ dropArea.addEventListener(evt,function(e){ e.preventDefault(); dropArea.classList.remove('hover'); });});
  dropArea.addEventListener('drop', function(e){ var files=e.dataTransfer.files; for (var i=0;i<files.length;i++){ addRow(files[i]); } });

  function addRow(file){
    var r=document.createElement('div'); r.className='file-row';
    r.innerHTML='<span>'+file.name+' ('+Math.round(file.size/1024)+' KB)</span>\
    <span><button class="btn" data-act="crop">Crop</button>\
    <button class="btn primary" data-act="dl">Download</button></span>';
    r.querySelector('[data-act="dl"]').onclick=function(){ var a=document.createElement('a'); a.href=URL.createObjectURL(file); a.download=file.name; a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1200); };
    r.querySelector('[data-act="crop"]').onclick=function(){ openCrop(file); };
    list.appendChild(r);
  }

  function openCrop(file){
    var modal=$('#modal'); modal.classList.add('open'); modal.focus();
    var img=new Image(); var url=URL.createObjectURL(file);
    img.onload=function(){ URL.revokeObjectURL(url); buildCropper(img,{onApply:function(region){
      var c=$('#srcCanvas'); var out=document.createElement('canvas'); out.width=region.w; out.height=region.h;
      out.getContext('2d').drawImage(c, region.x, region.y, region.w, region.h, 0,0, region.w, region.h);
      out.toBlob(function(b){ var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=(file.name.replace(/\.(\w+)$/,'')||'image')+'_crop.png'; a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1500); modal.classList.remove('open');}, 'image/png', 0.95);
    }});};
    img.src=url;
  }

  function buildCropper(img, opts){
    var onApply=(opts&&opts.onApply)?opts.onApply:function(){};
    var modal=$('#modal');
    var stage=$('.stage'), wrap=$('.canvasWrap');
    var c=$('#srcCanvas'), ctx=c.getContext('2d');
    c.width=img.naturalWidth; c.height=img.naturalHeight; ctx.drawImage(img,0,0);
    var zoom=1;
    function setZoom(z){
      zoom=Math.max(0.1, Math.min(8, z));
      c.style.width = (c.width*zoom) + 'px';
      $('#zoomLabel').textContent = Math.round(zoom*100) + '%';
      update();
    }
    // fit on open
    function fitZoom(){
      // fit width into the visible area of stage
      var pad=16;
      var avail = stage.clientWidth - pad;
      var z = Math.min(1, avail / c.width);
      if (!isFinite(z) || z<=0) z=1;
      setZoom(z);
    }

    // Zoom controls
    $('#zoomIn').onclick = function(){ setZoom(zoom*1.1); };
    $('#zoomOut').onclick = function(){ setZoom(zoom/1.1); };
    $('#zoomFit').onclick = function(){ fitZoom(); };
    $('#zoom100').onclick = function(){ setZoom(1); };
    // Ctrl+Wheel zoom (basic keep-center)
    stage.addEventListener('wheel', function(e){
      if(!e.ctrlKey) return;
      e.preventDefault();
      var prev = zoom;
      setZoom(zoom * (e.deltaY<0?1.1:1/1.1));
      // try to keep the scroll position roughly stable
      var ratio = zoom/prev;
      stage.scrollLeft = Math.round(stage.scrollLeft * ratio);
      stage.scrollTop  = Math.round(stage.scrollTop  * ratio);
    }, {passive:false});

    // selection
    var sel=$('#selection'); sel.style.display='block';
    var pv=$('#pv'), pctx=pv.getContext('2d'), pvSize=$('#pvSize'), aspectSel=$('#aspectSel');
    var aspect='free'; aspectSel.onchange=function(){ aspect=this.value; update(); };

    var rect={x:0,y:0,w:0,h:0};
    var mode=null, start=null, startRect=null, handle=null;

    function nr(r){ return {x:Math.min(r.x,r.x+r.w),y:Math.min(r.y,r.y+r.h),w:Math.abs(r.w),h:Math.abs(r.h)}; }
    function scaleFactor(){ return ((c.clientWidth|| (c.width*zoom)) / c.width); }
    function toCanvas(p){ var s=scaleFactor(); return {x:p.x/s, y:p.y/s}; }
    function pos(e){ var b=c.getBoundingClientRect(); return {x:e.clientX-b.left, y:e.clientY-b.top}; }

    function enforceAspect(r){
      if(aspect==='free') return r;
      var sp=aspect.split(':'), ratio=parseFloat(sp[0])/parseFloat(sp[1]);
      var R=nr(r), wantH=Math.round(R.w/ratio), wantW=Math.round(R.h*ratio);
      if (wantH>R.h){ var d1=wantH-R.h; r.h = (r.h>=0)? r.h+d1 : r.h-d1; }
      else if (wantW>R.w){ var d2=wantW-R.w; r.w = (r.w>=0)? r.w+d2 : r.w-d2; }
      return r;
    }
    function bound(r){
      var R=nr(r);
      if (R.x<0){ r.x -= R.x; }
      if (R.y<0){ r.y -= R.y; }
      if (R.x+R.w>c.width){ r.w -= (R.x+R.w-c.width) * (r.w>=0?1:-1); }
      if (R.y+R.h>c.height){ r.h -= (R.y+R.h-c.height) * (r.h>=0?1:-1); }
      return r;
    }
    function update(){
      var R=nr(rect), s=scaleFactor();
      sel.style.left=(R.x*s)+'px'; sel.style.top=(R.y*s)+'px'; sel.style.width=(R.w*s)+'px'; sel.style.height=(R.h*s)+'px';
      // preview
      pctx.clearRect(0,0,pv.width,pv.height);
      if (R.w>=4 && R.h>=4){
        var sc=Math.min(pv.width/R.w, pv.height/R.h), pw=(R.w*sc)|0, ph=(R.h*sc)|0;
        pctx.drawImage(c,R.x,R.y,R.w,R.h, ((pv.width-pw)/2)|0, ((pv.height-ph)/2)|0, pw, ph);
        pvSize.textContent=R.w+' × '+R.h+'px';
      } else { pvSize.textContent='—'; }
    }

    // interactions
    var stageEl=$('.stage');
    stageEl.addEventListener('pointerdown', function(e){
      if (e.target===sel || e.target.classList.contains('h')) return;
      var p=toCanvas(pos(e));
      mode='new'; start=p; rect={x:p.x,y:p.y,w:0,h:0}; sel.style.display='block'; if (stageEl.setPointerCapture) try{ stageEl.setPointerCapture(e.pointerId);}catch(_){}
      update(); e.preventDefault();
    });

    sel.addEventListener('pointerdown', function(e){
      if (e.target.classList.contains('h')) return;
      var p=toCanvas(pos(e)); var R=nr(rect); if (R.w<4||R.h<4) return;
      mode='move'; start=p; startRect={x:R.x,y:R.y,w:R.w,h:R.h}; if (sel.setPointerCapture) try{ sel.setPointerCapture(e.pointerId);}catch(_){}
      e.preventDefault();
    });

    $$('.h', sel).forEach(function(hEl){
      hEl.addEventListener('pointerdown', function(e){
        mode='resize'; handle=hEl.getAttribute('data-h'); var p=toCanvas(pos(e)); start=p; var R=nr(rect); startRect={x:R.x,y:R.y,w:R.w,h:R.h}; if (hEl.setPointerCapture) try{ hEl.setPointerCapture(e.pointerId);}catch(_){}
        e.preventDefault();
      });
    });

    window.addEventListener('pointermove', function(e){
      if (!mode) return;
      var p=toCanvas(pos(e));
      if (mode==='new'){
        var w=p.x-start.x, h=p.y-start.y; rect=bound(enforceAspect({x:start.x,y:start.y,w:w,h:h})); update();
      } else if (mode==='move'){
        var dx=p.x-start.x, dy=p.y-start.y; var nx=Math.max(0, Math.min(c.width - startRect.w, startRect.x + dx)); var ny=Math.max(0, Math.min(c.height- startRect.h, startRect.y + dy));
        rect={x:nx,y:ny,w:startRect.w,h:startRect.h}; update();
      } else if (mode==='resize'){
        var r={x:startRect.x,y:startRect.y,w:startRect.w,h:startRect.h}, dx=p.x-start.x, dy=p.y-start.y;
        if (handle.indexOf('e')>-1) r.w = startRect.w + dx;
        if (handle.indexOf('w')>-1){ r.x = startRect.x + dx; r.w = startRect.w - dx; }
        if (handle.indexOf('s')>-1) r.h = startRect.h + dy;
        if (handle.indexOf('n')>-1){ r.y = startRect.y + dy; r.h = startRect.h - dy; }
        rect=bound(enforceAspect(r)); update();
      }
    });
    window.addEventListener('pointerup', function(){ mode=null; });

    modal.onkeydown=function(e){
      var R=nr(rect); 
      if (e.key==='=' && (e.ctrlKey||e.metaKey)){ setZoom(zoom*1.1); e.preventDefault(); return; }
      if (e.key==='-' && (e.ctrlKey||e.metaKey)){ setZoom(zoom/1.1); e.preventDefault(); return; }
      if (R.w<4||R.h<4) return;
      var step=e.shiftKey?10:1, nx=R.x, ny=R.y;
      if (e.key==='ArrowLeft'){ nx=Math.max(0, R.x-step); }
      else if (e.key==='ArrowRight'){ nx=Math.min(c.width-R.w, R.x+step); }
      else if (e.key==='ArrowUp'){ ny=Math.max(0, R.y-step); }
      else if (e.key==='ArrowDown'){ ny=Math.min(c.height-R.h, R.y+step); }
      else if (e.key==='Escape' || e.key==='Esc' || e.key==='Delete' || e.key==='Backspace'){ rect={x:0,y:0,w:0,h:0}; update(); toast('Selection cleared'); return; }
      else { return; }
      rect={x:nx,y:ny,w:R.w,h:R.h}; update(); e.preventDefault();
    };

    $('#resetCrop').onclick=function(){ rect={x:0,y:0,w:0,h:0}; update(); };
    $('#closeModal').onclick=function(){ $('#modal').classList.remove('open'); };
    $('#applyCrop').onclick=function(){ var R=nr(rect); if (R.w<4||R.h<4){ toast('Draw a selection first'); return; } onApply(R); };
    window.addEventListener('resize', function(){ fitZoom(); update(); });
    fitZoom(); // initial fit
    setTimeout(function(){ $('#modal').focus(); }, 0);
  }
})();