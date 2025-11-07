FileConverterPro v3.6.1 (SAFE, Cloudflare‑friendly)
--------------------------------------------------
• Images are loaded via base64 (FileReader) — NO blob: URLs.
• Includes a local sample image (assets/sample.jpg) to avoid cross‑origin.
• Cropper.js can be self‑hosted: set USE_LOCAL=true and upload files to vendor/.
• Guards ensure crop box appears and zoom works reliably.

To self‑host Cropper:
  1) Download cropper.min.js and cropper.min.css (v1.6.2) locally.
  2) Put them in /vendor/ then open index.html and set USE_LOCAL=true near the top.
  3) Deploy the whole folder to Cloudflare.