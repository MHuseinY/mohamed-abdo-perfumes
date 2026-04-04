---
name: scroll-video-scrub
description: Build a smooth scroll-scrubbed video hero section using GSAP ScrollTrigger. Covers ffmpeg re-encoding for dense keyframes, Node.js range-aware server, and the exact JS pattern that works reliably in Chrome/Safari. Use when the user asks for a scroll-controlled video, video scrubbing on scroll, cinematic hero video, or parallax video background.
---

The user wants a hero section where scrolling controls video playback frame-by-frame (scroll scrubbing). This skill provides the complete, battle-tested implementation.

## Why Most Implementations Break

Three independent issues must ALL be solved for smooth scrubbing:

1. **Sparse keyframes in source video** — Default MP4s have keyframes every ~30 frames. Seeking to a non-keyframe position forces the browser to decode backwards from the nearest keyframe → visible chop and stutter. This is the #1 root cause.
2. **Server doesn't support HTTP range requests** — Python's `http.server` returns HTTP/1.0 (no `206 Partial Content`). Chrome needs byte-range responses to seek video. Without it, `video.readyState` stays 0.
3. **Video element not unlocked for seeking** — Chrome requires `play()` to be called at least once before programmatic `currentTime` seeks work reliably.

---

## Step 1 — Re-encode Video (ALWAYS do this first)

Run this ffmpeg command. If ffmpeg is not installed, find the binary and use its full path.

```bash
ffmpeg -i "input.mp4" \
  -c:v libx264 -preset slow -crf 23 \
  -g 1 -keyint_min 1 \
  -pix_fmt yuv420p \
  -an \
  -movflags +faststart \
  -y "output_scrub.mp4"
```

| Flag | Purpose |
|------|---------|
| `-g 1 -keyint_min 1` | Every frame is a keyframe (I-frame only). Instant seek to any position. |
| `-movflags +faststart` | Moves `moov` atom to front of file — browser starts playing without downloading entire file. |
| `-an` | Strip audio — muted scroll video doesn't need it, reduces file size. |
| `-crf 23` | Quality/size tradeoff. Range: 18 (high quality, large) → 28 (smaller, lower quality). |
| `-preset slow` | Better compression. Use `medium` if encode speed matters. |

**File size:** All-keyframe video is ~1.3–4× larger than original. Normal and acceptable for hero sections.

**Never** try to manually move the moov atom with Python or hex editing — always use `-movflags +faststart`.

---

## Step 2 — Range-Aware HTTP Server

Save as `server.js` in the project root. Required because Python `http.server` doesn't support HTTP 206 range responses.

```js
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 9090;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stat) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }

    const range = req.headers.range;
    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges':  'bytes',
        'Content-Length': chunkSize,
        'Content-Type':   contentType,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type':   contentType,
        'Accept-Ranges':  'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}).listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));
```

Start: `node server.js` — serves at `http://localhost:9090/`

---

## Step 3 — HTML Structure

The wrapper `#hero-wrapper` is what GSAP pins. The inner section holds the video.
**Never put `overflow:hidden` on any ancestor of `#hero-wrapper`** — GSAP inserts a spacer div that will be clipped.

```html
<!-- Wrapper: GSAP pins this -->
<div id="hero-wrapper">
  <section id="hero" style="position:relative; width:100%; height:100vh; overflow:hidden;">

    <!-- Video background -->
    <video id="hero-video" autoplay muted playsinline preload="auto"
           style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;">
      <source src="./video_scrub.mp4" type="video/mp4" />
    </video>

    <!-- Dark overlay -->
    <div style="position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);"></div>

    <!-- Hero content -->
    <div id="hero-content" style="position:relative; z-index:10;">
      <!-- headline, CTA buttons, etc. -->
    </div>

  </section>
</div>
```

Required video attributes:
| Attribute | Why |
|-----------|-----|
| `autoplay` | Helps unlock seeking on page load in Chrome |
| `muted` | Required for autoplay to work |
| `playsinline` | iOS: prevents video from hijacking fullscreen |
| `preload="auto"` | `video.duration` is NaN without this on mobile Safari |

---

## Step 4 — GSAP ScrollTrigger JavaScript

```js
gsap.registerPlugin(ScrollTrigger);

const video = document.getElementById('hero-video');

function initScrollScrub() {
  const dur = video.duration;
  if (!isFinite(dur) || dur <= 0) return;

  video.loop = false;
  video.pause();
  video.currentTime = 0;

  // Use onUpdate for explicit frame control (more reliable than gsap.to on currentTime)
  ScrollTrigger.create({
    trigger: '#hero-wrapper',
    start: 'top top',
    end: '+=220%',    // How long the pin lasts. 220% = 2.2 viewport heights of scroll.
    pin: true,
    scrub: 0,         // 0 = instant 1:1. 0.3 = slight cinematic lag. 1 = slow dramatic lag.
    onUpdate: (self) => {
      video.currentTime = self.progress * dur;
    }
  });

  // Optional: fade out hero content during first portion of pin
  gsap.to('#hero-content', {
    opacity: 0,
    y: -60,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero-wrapper',
      start: 'top top',
      end: '+=100%',
      scrub: true
    }
  });

  ScrollTrigger.refresh();
}

// 1. Wait for video to be ready
// 2. play().then(pause) → unlocks programmatic seeking in Chrome
// 3. Then init scroll scrub
video.addEventListener('canplay', () => {
  video.play()
    .then(() => { video.pause(); initScrollScrub(); })
    .catch(() => initScrollScrub()); // autoplay blocked? still init
}, { once: true });

// Graceful fallback if video fails
video.addEventListener('error', () => {
  document.getElementById('hero').style.background =
    'linear-gradient(135deg, #111 0%, #333 100%)';
  video.style.display = 'none';
}, { once: true });
```

---

## Tuning Reference

| Goal | Change |
|------|--------|
| Instant 1:1 scroll feel | `scrub: 0` |
| Slight cinematic lag | `scrub: 0.3` |
| Slow dramatic lag | `scrub: 1` |
| Video ends before scroll pin ends | Increase `end: '+=300%'` |
| Smaller output file | `-crf 26` or `-crf 28` |
| Higher visual quality | `-crf 18` or `-crf 20` |
| Faster ffmpeg encode | `-preset medium` or `-preset fast` |

---

## Checklist Before Testing

- [ ] Video re-encoded with `-g 1 -keyint_min 1` and `-movflags +faststart`
- [ ] `<source src>` points to the re-encoded `_scrub.mp4` file
- [ ] Using Node.js `server.js` (not Python http.server)
- [ ] No `overflow:hidden` on any ancestor of `#hero-wrapper`
- [ ] `gsap.registerPlugin(ScrollTrigger)` called before any ScrollTrigger usage
- [ ] GSAP and ScrollTrigger loaded from CDN before the script block

---

## Dead Ends (Don't Try These)

- **Blob URL fetch** — `fetch().blob()` + `URL.createObjectURL()`: `loadedmetadata` never fires in Chrome for large blob video URLs.
- **Python http.server** — No HTTP 206 range support. `video.readyState` stays 0. Video never loads.
- **Manual moov atom manipulation** — Error-prone Python byte manipulation corrupts the file. Use ffmpeg.
- **`fastSeek()`** — Snaps to nearest keyframe, not the exact time. Makes chop worse.
- **`gsap.to(video, { currentTime })`** — Works but less explicit. Prefer `onUpdate` for debuggability.
