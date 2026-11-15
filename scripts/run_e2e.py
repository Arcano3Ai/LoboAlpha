import http.server
import socketserver
import threading
import time
import subprocess
import sys

PORT = 8000

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server():
    with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    time.sleep(1)
    print(f"Servidor HTTP corriendo en http://localhost:{PORT}")
    
    res = subprocess.run([sys.executable, "scripts/test_chatbot.py"])
    sys.exit(res.returncode)
