import os
from PIL import Image, ImageOps, ImageEnhance

BRAIN = r"C:\Users\sergi\.gemini\antigravity\brain\6f0c9ca1-fa81-4cfe-9d2a-fc174f2dc08d"
RAW = os.path.join("assets", "img", "raw")
OUT = os.path.join("assets", "img")

os.makedirs(OUT, exist_ok=True)
os.makedirs(RAW, exist_ok=True)

# 1. Copiar imagen original generada de reactividad
src_reactividad = os.path.join(BRAIN, "blog_reactividad_1794715028505.jpg")
dest_raw_reactividad = os.path.join(RAW, "blog-reactividad.jpg")
if os.path.exists(src_reactividad):
    with open(src_reactividad, "rb") as fsrc, open(dest_raw_reactividad, "wb") as fdest:
        fdest.write(fsrc.read())
    print("[OK] blog-reactividad copiada a raw")

# 2. Fuentes para los 3 artículos
sources = {
    "blog-reactividad": dest_raw_reactividad,
    "blog-lenguaje": os.path.join(BRAIN, "lenguaje_senales_1794709873657.jpg"),
    "blog-intuitiva": os.path.join(BRAIN, "educacion_1794709873186.jpg")
}

def crop_aspect(img, target_aspect=16/9):
    w, h = img.size
    current = w / h
    if current > target_aspect:
        new_w = int(h * target_aspect)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_aspect)
        top = int((h - new_h) * 0.35)  # Enfoque ligeramente hacia arriba para rostros
        top = max(0, min(top, h - new_h))
        return img.crop((0, top, w, top + new_h))

for name, src_path in sources.items():
    if not os.path.exists(src_path):
        print(f"[WARN] No existe {src_path}")
        continue
    img = ImageOps.exif_transpose(Image.open(src_path)).convert("RGB")
    cropped = crop_aspect(img, 16/9)
    
    # Generar variantes WebP 1024 y 640
    for w in (1024, 640):
        h = round(w * 9 / 16)
        resized = cropped.resize((w, h), Image.LANCZOS)
        out_webp = os.path.join(OUT, f"{name}-{w}.webp")
        resized.save(out_webp, "WEBP", quality=82, method=6)
        print(f"[OK] {out_webp} ({os.path.getsize(out_webp)/1024:.1f} KB)")
        
    # Generar imagen OG 1200x630 para compartir en redes sociales y WhatsApp
    og_cropped = crop_aspect(img, 1200/630)
    og_img = og_cropped.resize((1200, 630), Image.LANCZOS)
    out_og = os.path.join(OUT, f"og-{name}.jpg")
    og_img.save(out_og, "JPEG", quality=84, optimize=True)
    print(f"[OK] {out_og} ({os.path.getsize(out_og)/1024:.1f} KB, < 300KB)")

print("[SUCCESS] Todas las imágenes de blog generadas.")
