"""
Pipeline de optimizaciÃ³n de imÃ¡genes para la landing de LOBOALPHA.

- Convierte las fotografÃ­as de assets/img/raw a WebP responsivo (srcset).
- Recorta los mÃ¡rgenes blancos del logotipo SIN alterar su diseÃ±o
  (solo se elimina espacio vacÃ­o alrededor) y genera variantes WebP/PNG.
- Genera favicons a partir del logotipo original (cuadrado).
- Compone la imagen Open Graph 1200x630 (< 300 KB, JPG).

Uso:  python scripts/build_images.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "assets" / "img" / "raw"
OUT = ROOT / "assets" / "img"

# nombre -> (anchos objetivo, relaciÃ³n de aspecto objetivo w/h o None para conservar)
PHOTOS: dict[str, tuple[list[int], float | None]] = {
    "hero": ([640, 1024, 1376], 16 / 9),
    "cta": ([640, 1024, 1376], 16 / 9),
    "conexion": ([640, 1024, 1264], 3 / 2),
    "filosofia": ([480, 896], 4 / 5),
    "psicologia": ([480, 800], 4 / 3),
    "etologia": ([480, 800], 4 / 3),
    "conducta": ([480, 800], 4 / 3),
    "rehabilitacion": ([480, 800], 4 / 3),
    "educacion": ([480, 800], 4 / 3),
    "obediencia": ([480, 800], 4 / 3),
    "lenguaje-postura": ([400, 700], 3 / 4),
    "lenguaje-mirada": ([400, 700], 3 / 4),
    "lenguaje-movimiento": ([400, 700], 3 / 4),
    "lenguaje-senales": ([400, 700], 3 / 4),
}

WEBP_QUALITY = 78


def find_raw(name: str) -> Path | None:
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        p = RAW / f"{name}{ext}"
        if p.exists():
            return p
    return None


def crop_to_aspect(img: Image.Image, aspect: float | None) -> Image.Image:
    if aspect is None:
        return img
    w, h = img.size
    current = w / h
    if abs(current - aspect) < 0.01:
        return img
    if current > aspect:  # demasiado ancha -> recortar lados
        new_w = int(h * aspect)
        left = (w - new_w) // 2
        return img.crop((left, 0, left + new_w, h))
    new_h = int(w / aspect)
    top = (h - new_h) // 2
    return img.crop((0, top, w, top + new_h))


def build_photos() -> dict:
    manifest: dict[str, dict] = {}
    for name, (widths, aspect) in PHOTOS.items():
        src = find_raw(name)
        if not src:
            print(f"[WARN] Falta imagen original: {name}")
            continue
        img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        img = crop_to_aspect(img, aspect)
        ow, oh = img.size
        produced = []
        for w in widths:
            target_w = min(w, ow)  # nunca escalar hacia arriba
            target_h = round(target_w * oh / ow)
            resized = img.resize((target_w, target_h), Image.LANCZOS)
            dest = OUT / f"{name}-{w}.webp"
            resized.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
            produced.append({"file": dest.name, "w": target_w, "h": target_h,
                             "kb": round(dest.stat().st_size / 1024, 1)})
        manifest[name] = {"original": [ow, oh], "variants": produced}
        print(f"[OK] {name}: {[(p['file'], p['kb']) for p in produced]}")
    return manifest


def trim_white(img: Image.Image, pad_ratio: float = 0.03) -> Image.Image:
    rgb = img.convert("RGB")
    bg = Image.new("RGB", rgb.size, (255, 255, 255))
    diff = ImageChops.difference(rgb, bg).convert("L").point(lambda p: 255 if p > 18 else 0)
    bbox = diff.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    pad = int(max(r - l, b - t) * pad_ratio)
    return img.crop((max(l - pad, 0), max(t - pad, 0),
                     min(r + pad, img.width), min(b + pad, img.height)))


def build_logo() -> Image.Image:
    src = RAW / "logo-original.png"
    logo = Image.open(src).convert("RGB")
    trimmed = trim_white(logo)
    for w in (240, 480, 800):
        h = round(w * trimmed.height / trimmed.width)
        r = trimmed.resize((w, h), Image.LANCZOS)
        r.save(OUT / f"logo-loboalpha-{w}.webp", "WEBP", quality=90, method=6)
    r = trimmed.resize((480, round(480 * trimmed.height / trimmed.width)), Image.LANCZOS)
    r.save(OUT / "logo-loboalpha-480.png", "PNG", optimize=True)
    print(f"[OK] logo recortado: {trimmed.size}")

    # Favicons desde el logotipo original cuadrado (sin modificar el diseÃ±o)
    square = logo
    for size, name in ((512, "icon-512.png"), (192, "icon-192.png"),
                       (180, "apple-touch-icon.png"), (32, "favicon-32.png")):
        square.resize((size, size), Image.LANCZOS).save(OUT / name, "PNG", optimize=True)
    return trimmed


def build_og(logo_trimmed: Image.Image) -> None:
    hero_src = find_raw("hero")
    W, H = 1200, 630
    canvas = Image.new("RGB", (W, H), (255, 255, 255))
    if hero_src:
        hero = ImageOps.exif_transpose(Image.open(hero_src)).convert("RGB")
        photo_w = 640
        hero = crop_to_aspect(hero, photo_w / H)
        hero = hero.resize((photo_w, H), Image.LANCZOS)
        canvas.paste(hero, (W - photo_w, 0))
    # Panel blanco con el logotipo Ã­ntegro
    panel_w = 560
    logo_w = 470
    logo_h = round(logo_w * logo_trimmed.height / logo_trimmed.width)
    lg = logo_trimmed.resize((logo_w, logo_h), Image.LANCZOS)
    canvas.paste(Image.new("RGB", (panel_w, H), (255, 255, 255)), (0, 0))
    canvas.paste(lg, ((panel_w - logo_w) // 2, (H - logo_h) // 2))
    dest = OUT / "og-loboalpha.jpg"
    quality = 85
    while True:
        canvas.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
        if dest.stat().st_size < 300 * 1024 or quality <= 50:
            break
        quality -= 5
    print(f"[OK] OG image: {round(dest.stat().st_size / 1024, 1)} KB (q={quality})")


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = build_photos()
    trimmed = build_logo()
    build_og(trimmed)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())

