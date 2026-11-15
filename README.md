# LOBOALPHA — Psicología, Comunicación y Adiestramiento Canino

Landing page comercial de alto rendimiento para **LOBOALPHA**, especializada en etología, comportamiento, psicología y adiestramiento canino.

## 🚀 Características
- **Diseño & UX/UI:** Experiencia responsive mobile-first, paleta corporativa oficial (azul profundo, turquesa, verde lima, fondo blanco limpio) con microinteracciones y animaciones suaves.
- **Rendimiento Visual:** Fotografías cinemáticas optimizadas en formato WebP con `srcset` adaptativo y fallback.
- **SEO & Social Share:**
  - Marcado semántico HTML5 y Schema.org estructurado (`ProfessionalService`).
  - Metadatos Open Graph (`og:image`, `og:title`, `og:description`, `og:url`) optimizados para WhatsApp y redes sociales (< 300KB).
  - Archivos estándar `sitemap.xml`, `robots.txt` y `site.webmanifest`.
- **Conversión:** Canal de atención directa a WhatsApp para agendar valoraciones y conocer servicios.

## 📁 Estructura del Proyecto
```text
Alpha Dog/
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── (scripts interactivos)
│   └── img/
│       ├── raw/
│       └── (WebP responsivos, logos y OpenGraph)
├── scripts/
│   └── build_images.py
├── index.html
├── robots.txt
├── site.webmanifest
└── sitemap.xml
```

## 🛠️ Desarrollo Local
Para previsualizar localmente:
```bash
python -m http.server 8080 --bind 127.0.0.1
```
Abre en tu navegador: `http://127.0.0.1:8080/`
