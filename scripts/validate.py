"""Validaciones estáticas de la landing: JSON-LD, manifest, recursos referenciados, OG."""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
errors = []

html = open("index.html", encoding="utf-8").read()
js = open("assets/js/main.js", encoding="utf-8").read()

m = re.search(r'application/ld\+json">(.*?)</script>', html, re.S)
try:
    json.loads(m.group(1))
except Exception as e:  # noqa: BLE001
    errors.append(f"JSON-LD inválido: {e}")

for f in ("site.webmanifest",):
    try:
        json.load(open(f, encoding="utf-8-sig"))
    except Exception as e:  # noqa: BLE001
        errors.append(f"{f} inválido: {e}")

refs = set(re.findall(r"assets/(?:img|css|js)/[\w\-\.]+", html + js))
missing = sorted(r for r in refs if not os.path.exists(r))
if missing:
    errors.append(f"Recursos faltantes: {missing}")

og = "assets/img/og-loboalpha.jpg"
if os.path.getsize(og) >= 300 * 1024:
    errors.append("OG image >= 300KB")
for tag in ("og:title", "og:description", "og:url", "og:image"):
    if f'property="{tag}"' not in html:
        errors.append(f"Falta {tag}")
if not re.search(r'property="og:image" content="https://', html):
    errors.append("og:image no es absoluta https")

h1 = len(re.findall(r"<h1[\s>]", html))
if h1 != 1:
    errors.append(f"Se esperaba 1 <h1>, hay {h1}")
imgs_no_alt = re.findall(r"<img(?![^>]*\balt=)[^>]*>", html)
if imgs_no_alt:
    errors.append(f"Imágenes sin alt: {len(imgs_no_alt)}")

print(f"Recursos verificados: {len(refs)}")
print("\n".join(errors) if errors else "TODO OK")
sys.exit(1 if errors else 0)
