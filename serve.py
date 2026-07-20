"""Local dev server with correct MIME types for ES modules.

Windows' registry-derived mimetypes can report .js as text/plain, which
makes browsers refuse to execute <script type="module">. This wrapper
forces the right Content-Type for the extensions this project needs.

Usage: python serve.py [port]   (default port 8000)
"""
import http.server
import sys

EXTRA_TYPES = {
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".md": "text/markdown",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def guess_type(self, path):
        for ext, mime in EXTRA_TYPES.items():
            if path.endswith(ext):
                return mime
        return super().guess_type(path)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    http.server.test(HandlerClass=Handler, port=port)
