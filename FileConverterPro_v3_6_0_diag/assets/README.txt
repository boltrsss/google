FileConverterPro v3.6.0 (Diagnostics build)
------------------------------------------
• Shows a banner at the top telling you whether Cropper.js loaded.
• Adds touch-action:none to the image to allow dragging on some browsers.
• Ensures a crop box is created if none exists (so you can see the lines).
• Uses zoomTo() and guards to prevent undefined errors.

If the banner says "Cropper.js not loaded":
  1) Cloudflare may be blocking CDN scripts via CSP or Rocket Loader.
  2) Solutions:
     - Host cropper.min.js and cropper.min.css locally (same folder).
     - Or allowlist unpkg.com in Content-Security-Policy:
         script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com;
     - Disable Rocket Loader for this page (it can defer/wrap scripts).