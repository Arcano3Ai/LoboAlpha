/* =========================================================================
   LOBOALPHA — Interacciones
   Vanilla JS, sin dependencias. Progresivo: el sitio funciona sin JS.
   ========================================================================= */
(() => {
  "use strict";

  /* ---------- Configuración central ----------
     WhatsApp oficial de Loboalpha / Javier Baños: +52 81 8686 6182
     Formato internacional sin signos: 528186866182 */
  const CONFIG = Object.freeze({
    whatsappNumber: "528186866182",
    social: {
      instagram: "", // ej. "https://www.instagram.com/loboalpha"
      facebook: "",
      tiktok: "",
      youtube: "",
    },
  });

  const doc = document.documentElement;
  doc.classList.add("js");

  /* ---------- WhatsApp ---------- */
  const DEFAULT_MSG = "Hola Javier, me gustaría agendar una valoración para mi perro en Loboalpha.";
  const waLink = (msg) =>
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg || DEFAULT_MSG)}`;

  const applyWhatsApp = (el, msg) => {
    if (!CONFIG.whatsappNumber) return; // fallback: ancla #contacto
    el.href = waLink(msg || el.dataset.waMsg);
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  };
  document.querySelectorAll("[data-wa]").forEach((el) => applyWhatsApp(el));

  /* ---------- Redes sociales ---------- */
  document.querySelectorAll("[data-social]").forEach((el) => {
    const url = CONFIG.social[el.dataset.social];
    if (!url) return; // pendiente de configurar: se mantiene el ancla local
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  });

  /* ---------- Año ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header: estado al hacer scroll + WhatsApp flotante ---------- */
  const header = document.querySelector(".site-header");
  const waFloat = document.querySelector(".wa-float");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 24);
    waFloat?.classList.toggle("is-visible", y > window.innerHeight * 0.6);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu?.classList.toggle("is-open", open);
  };
  toggle?.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 960px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- Revelado al hacer scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finish = (el) => {
    el.classList.add("is-visible");
    // Retira la clase tras la animación para no bloquear los hover de las tarjetas
    setTimeout(() => el.classList.remove("reveal"), 1100 + (parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0) * 1000);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { finish(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach(finish);
  }

  /* ---------- Navegación activa por sección ---------- */
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]:not(.btn)')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Modal de servicios ---------- */
  const SERVICES = {
    psicologia: {
      title: "Psicología canina",
      img: "assets/img/psicologia-800.webp",
      alt: "Border collie mirando a los ojos de su entrenador",
      desc: "Profundizamos en la mente de tu perro: cómo percibe su entorno, qué emociones experimenta y qué necesita para sentirse seguro. Comprender su mundo interno es la base para cualquier cambio duradero.",
      list: ["Quieres entender por qué tu perro actúa como lo hace", "Notas cambios en su estado de ánimo o comportamiento", "Buscas mejorar la comunicación y el vínculo con él"],
    },
    etologia: {
      title: "Etología",
      img: "assets/img/etologia-800.webp",
      alt: "Perros interactuando de forma natural en el campo",
      desc: "Analizamos el comportamiento natural y social de tu perro: cómo se relaciona con otros perros, con las personas y con su entorno, considerando su raza, su etapa de vida y su historia.",
      list: ["Tu perro tiene dificultades para relacionarse con otros perros", "Quieres conocer las necesidades propias de su raza y edad", "Deseas comprender su conducta desde su naturaleza"],
    },
    conducta: {
      title: "Problemas de conducta",
      img: "assets/img/conducta-800.webp",
      alt: "Entrenador trabajando con calma junto a un perro reactivo",
      desc: "Identificamos el origen de las conductas que afectan la convivencia y diseñamos una ruta de trabajo clara y respetuosa, enfocada en la causa y no solo en el síntoma.",
      list: ["Reactividad hacia personas, perros o estímulos", "Miedos, fobias o ansiedad por separación", "Conductas agresivas o destructivas"],
    },
    rehabilitacion: {
      title: "Rehabilitación y terapia conductual",
      img: "assets/img/rehabilitacion-800.webp",
      alt: "Profesional junto a un perro tímido que se acerca con confianza",
      desc: "Programas de intervención conductual diseñados a la medida de cada perro, con objetivos progresivos y acompañamiento constante para que recupere su equilibrio y confianza.",
      list: ["Perros rescatados o con experiencias difíciles", "Casos que requieren un plan estructurado y gradual", "Familias que buscan acompañamiento durante el proceso"],
    },
    educacion: {
      title: "Educación canina",
      img: "assets/img/educacion-800.webp",
      alt: "Familia guiando con suavidad a su perro en casa",
      desc: "Construimos hábitos saludables y una comunicación clara entre tu perro y toda la familia, para que la convivencia diaria sea armónica, segura y disfrutable.",
      list: ["Llega un cachorro o un nuevo perro a casa", "Quieres establecer rutinas y límites claros", "Buscas que toda la familia se comunique igual con él"],
    },
    obediencia: {
      title: "Obediencia",
      img: "assets/img/obediencia-800.webp",
      alt: "Pastor alemán atento frente a su guía",
      desc: "Entrenamos comandos, autocontrol y atención para que tu perro responda de forma confiable a tus instrucciones, en casa y en el exterior.",
      list: ["Paseos con jalones de correa o poca atención", "Necesitas que acuda al llamado de forma confiable", "Quieres fortalecer el autocontrol en situaciones cotidianas"],
    },
    "metodo-natural": {
      title: "Método natural de educación y adiestramiento",
      img: "assets/img/metodo-natural-800.webp",
      alt: "Método natural de educación canina sin coerción",
      desc: "Educación basada en la motivación, la cooperación y el respeto al lenguaje propio de la especie canina. Sin métodos aversivos ni castigos, construyendo una confianza sólida y duradera.",
      list: ["Buscas una alternativa positiva y respetuosa para educar", "Quieres que tu perro responda por convicción y vínculo, no por miedo", "Deseas paseos relajados y comunicación clara en el hogar"],
    },
    "comunicacion-intuitiva": {
      title: "Comunicación intuitiva con animales",
      img: "assets/img/comunicacion-intuitiva-800.webp",
      alt: "Sesión de comunicación intuitiva con animales con Javier Baños",
      desc: "Un espacio de conexión empática y profunda facilitado por Javier Baños para sintonizar con el mundo interno, emocional y vivencial de tu animal de compañía, comprendiendo lo que necesita expresar.",
      list: ["Cambios repentinos en el ánimo o comportamiento sin causa médica", "Animales adoptados o rescatados con vivencias complejas", "Acompañamiento en procesos de duelo, cambio de hogar o etapa senior"],
    },
  };

  const dialog = document.getElementById("service-dialog");
  if (dialog && typeof dialog.showModal === "function") {
    const $ = (id) => document.getElementById(id);
    let lastTrigger = null;

    document.querySelectorAll("[data-service]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = SERVICES[btn.dataset.service];
        if (!s) return;
        lastTrigger = btn;
        $("dlg-title").textContent = s.title;
        $("dlg-desc").textContent = s.desc;
        $("dlg-img").src = s.img;
        $("dlg-img").alt = s.alt;
        const list = $("dlg-list");
        list.replaceChildren(...s.list.map((t) => Object.assign(document.createElement("li"), { textContent: t })));
        applyWhatsApp($("dlg-cta"), `Hola Loboalpha, me interesa el servicio de ${s.title} y me gustaría agendar una valoración.`);
        dialog.showModal();
      });
    });

    const close = () => dialog.close();
    dialog.querySelector("[data-close]")?.addEventListener("click", close);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
    $("dlg-cta")?.addEventListener("click", () => { if (!CONFIG.whatsappNumber) close(); });
    dialog.addEventListener("close", () => lastTrigger?.focus());
  } else {
    // Sin soporte de <dialog>: los botones llevan a contacto
    document.querySelectorAll("[data-service]").forEach((btn) =>
      btn.addEventListener("click", () => document.getElementById("contacto")?.scrollIntoView()));
  }
})();
