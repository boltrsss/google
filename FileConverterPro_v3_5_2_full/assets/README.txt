FileConverterPro v3.5.2 (UI Patch)
----------------------------------
Fixes:
  • Prevented overlay from stealing pointer events (drag now works).
  • Replaced zoom delta logic with zoomTo() for reliability.
  • Removed use of non-existent cropper.center(); implemented safe center.
  • Guarded wheel sync to avoid undefined errors.

Tip: open via a local web server (not file://) to avoid blob:null errors.