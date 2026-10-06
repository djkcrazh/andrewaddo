#!/usr/bin/env python3
"""Local preview that matches what Vercel serves.

Python's mimetypes reads /etc/apache2/mime.types on macOS, which maps .m4a to
audio/mp4a-latm -- a type browsers refuse to decode. Vercel serves audio/mp4.
Pin the handful of types that matter so local and production agree.

    python3 serve.py [port]        # default 8743
"""
import functools
import http.server
import mimetypes
import socketserver
import sys
from pathlib import Path

TYPES = {
    ".m4a": "audio/mp4",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".otf": "font/otf",
    ".ttf": "font/ttf",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
}
for ext, ctype in TYPES.items():
    mimetypes.add_type(ctype, ext)


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, **TYPES}

    # Only audio is cached locally: it is large, it never changes mid-session,
    # and leaving it uncached made the Sound page re-download every track on
    # every reload. Everything else -- html, js, pdf, images, fonts -- is
    # no-store, so a file you just replaced shows up on refresh.
    CACHEABLE = (".m4a", ".mp3", ".wav")

    def end_headers(self):
        path = self.path.split("?", 1)[0].lower()
        if path.endswith(self.CACHEABLE):
            self.send_header("Cache-Control", "public, max-age=3600")
        else:
            self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8743
    root = Path(__file__).parent / "site"
    handler = functools.partial(Handler, directory=str(root))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"serving {root} at http://localhost:{port}")
        httpd.serve_forever()
