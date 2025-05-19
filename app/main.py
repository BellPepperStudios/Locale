import ollama
from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import mimetypes

# Simple memory for all users (not production safe)
conversation_history = []

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            filepath = "index.html"
        else:
            # Remove leading slash
            filepath = self.path.lstrip("/")
            # Prevent directory traversal
            if ".." in filepath or filepath.startswith("/"):
                self.send_response(403)
                self.end_headers()
                self.wfile.write(b"Forbidden")
                return

        if os.path.isfile(filepath):
            self.send_response(200)
            mime_type, _ = mimetypes.guess_type(filepath)
            self.send_header('Content-type', mime_type or 'application/octet-stream')
            self.end_headers()
            with open(filepath, "rb") as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"File not found.")

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        user_input = post_data.decode('utf-8')
        print(f"Received POST data: {user_input}")

        # Add user message to history
        conversation_history.append(f"User: {user_input}")

        # Build prompt from history (limit to last 10 exchanges for context)
        prompt = "\n".join(conversation_history[-10:]) + "\nAI:"

        try:
            response = ollama.generate(model="llama2", prompt=prompt)
            ai_response = response.get('response', response)
            # Add AI response to history
            conversation_history.append(f"AI: {ai_response}")

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(ai_response.encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Error: {e}".encode('utf-8'))

if __name__ == "__main__":
    PORT = 8000
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"Serving on http://localhost:{PORT}")
    httpd.serve_forever()