/**
 * LOBOALPHA ASSISTANT - "ALPHA AI"
 * Asistente virtual inteligente para Loboalpha · Javier Baños
 * Arquitectura modular y accesible sin dependencias externas.
 */

(function () {
  'use strict';

  // Configuración y estado
  const CONFIG = {
    phone: '528186866182',
    audioSrc: 'assets/audio/alpha-bark-short.mp3',
    cooldownMs: 3500, // Evitar ladridos repetitivos molestos
    typingDelayMs: 600,
    storageMuteKey: 'loboalpha_assistant_muted'
  };

  const state = {
    isOpen: false,
    isMuted: localStorage.getItem(CONFIG.storageMuteKey) === 'true',
    lastBarkTime: 0,
    isTyping: false
  };

  // Base de conocimiento especializada de LOBOALPHA
  const FAQ_QUESTIONS = [
    {
      id: 'servicios',
      label: '¿Qué servicios ofrecen?',
      triggerText: '¿Qué servicios ofrecen?'
    },
    {
      id: 'conducta',
      label: 'Mi perro tiene problemas de conducta.',
      triggerText: 'Mi perro tiene problemas de conducta.'
    },
    {
      id: 'adiestramiento',
      label: '¿Cómo funciona el adiestramiento?',
      triggerText: '¿Cómo funciona el adiestramiento?'
    },
    {
      id: 'psicologia',
      label: '¿Qué es la psicología canina?',
      triggerText: '¿Qué es la psicología canina?'
    },
    {
      id: 'comunicacion',
      label: '¿Qué es la comunicación intuitiva?',
      triggerText: '¿Qué es la comunicación intuitiva?'
    },
    {
      id: 'agendar',
      label: '¿Cómo puedo agendar una sesión?',
      triggerText: '¿Cómo puedo agendar una sesión?'
    }
  ];

  const KNOWLEDGE_BASE = {
    servicios: {
      text: `En **Loboalpha** trabajamos de forma integral con programas adaptados a cada perro y familia en Monterrey:\n\n` +
            `🐾 **Psicología Canina y Etología:** Evaluación del origen emocional y de conducta.\n` +
            `🐾 **Modificación de Conducta:** Miedos, fobias, reactividad y agresividad.\n` +
            `🐾 **Educación y Obediencia:** Convivencia sana, hábitos y respuesta confiable.\n` +
            `🐾 **Método Natural:** Adiestramiento respetuoso sin violencia ni collares de castigo.\n` +
            `🐾 **Comunicación Intuitiva con Animales:** Conexión profunda facilitada por Javier Baños.\n` +
            `🐾 **Talleres Grupales y Sesiones a Domicilio / en Campo.**`,
      waText: 'Hola Javier, me gustaría conocer más sobre los servicios de Loboalpha para mi perro.'
    },

    conducta: {
      text: `¡Te entiendo perfectamente! Cuando un perro ladra en exceso, jala la correa, destruye cosas en casa o se muestra reactivo, **no está siendo "malo"**: está expresando estrés, frustración, miedo o falta de comunicación.\n\n` +
            `En Loboalpha no usamos castigos ni violencia. **Javier Baños** analiza la causa profunda y diseña un plan terapéutico para rehabilitar su bienestar y tu tranquilidad.`,
      waText: 'Hola Javier, mi perro tiene problemas de conducta y quisiera una valoración en Loboalpha.'
    },

    adiestramiento: {
      text: `El adiestramiento en Loboalpha se basa en el **Método Natural y el respeto animal**:\n\n` +
            `1. **Sin someter ni obligar:** Trabajamos con la cooperación voluntaria y motivación del perro.\n` +
            `2. **En situaciones reales:** Entrenamos en parques, calles y en tu propio hogar, no en pistas artificiales.\n` +
            `3. **Educando al guía:** Te enseñamos a ti y a tu familia a leer sus señales de calma para mantener el aprendizaje de por vida.`,
      waText: 'Hola Javier, me interesa saber cómo funciona el método de adiestramiento de Loboalpha.'
    },

    psicologia: {
      text: `La **psicología canina** estudia cómo percibe, siente y procesa el mundo tu perro.\n\n` +
            `A diferencia del simple entrenamiento de trucos, la psicología se enfoca en sus **emociones, niveles de ansiedad, apego y estado mental**. Al entender la raíz de lo que siente, resolvemos los problemas de raíz en lugar de solo silenciar los síntomas.`,
      waText: 'Hola Javier, quisiera saber más sobre la psicología canina aplicada a mi perro.'
    },

    comunicacion: {
      text: `La **comunicación intuitiva con animales** es una disciplina de sintonización empática y conexión profunda que facilita **Javier Baños**.\n\n` +
            `Permite escuchar y comprender lo que tu compañero animal necesita expresar: duelos, cambios familiares, temores o mensajes emocionales, fortaleciendo un lazo de empatía y comprensión mutua incondicional.`,
      waText: 'Hola Javier, me llama mucho la atención la comunicación intuitiva y quisiera más informes.'
    },

    agendar: {
      text: `¡Con mucho gusto! Para agendar una valoración personalizada con **Javier Baños** en Monterrey y su área metropolitana:\n\n` +
            `1. Contáctalo directamente por WhatsApp pulsando el botón aquí abajo.\n` +
            `2. Cuéntale brevemente sobre tu perrito (edad, raza y situación actual).\n` +
            `3. Javier coordinará contigo la fecha y modalidad ideal (sesión a domicilio o en campo).`,
      waText: 'Hola Javier, me gustaría agendar una valoración presencial para mi perro en Loboalpha.'
    },

    // Reglas de seguridad y límites
    veterinaria: {
      text: `Como asistente canino, **no puedo diagnosticar enfermedades ni recetar medicamentos** 🏥. Si tu perro presenta decaimiento, dolor, vómitos o cualquier malestar físico, te recomiendo llevarlo cuanto antes con su médico veterinario de confianza.\n\n` +
            `Para todo lo relacionado con su educación, conducta y equilibrio emocional, Javier Baños con gusto te puede apoyar.`,
      waText: 'Hola Javier, quisiera una consulta sobre el comportamiento y bienestar de mi perro.'
    },

    precios: {
      text: `Cada perro y situación familiar son distintos, por lo que **Javier Baños** evalúa cada caso para ofrecer el programa adecuado (valoración inicial, sesiones individuales o talleres grupales).\n\n` +
            `Escríbele directamente por WhatsApp para platicarle de tu perro y te dará los costos y opciones exactas con toda transparencia.`,
      waText: 'Hola Javier, me gustaría consultar los costos y opciones de sesiones para mi perro.'
    },

    javier: {
      text: `**Javier Baños** es el fundador y director de Loboalpha. Cuenta con amplia trayectoria en psicología canina, etología, adiestramiento natural y comunicación intuitiva con animales en Monterrey.\n\n` +
            `Su enfoque se centra en recuperar la confianza y armonía entre perros y humanos desde el respeto y el entendimiento mutuo.`,
      waText: 'Hola Javier, estuve conociendo Loboalpha y me gustaría ponerme en contacto directo contigo.'
    },

    saludo: {
      text: `¡Hola! 🐾 ¡Guau! Qué alegría saludarte. Soy **ALPHA**, el asistente canino de Loboalpha. ¿Cómo se llama tu compañero de cuatro patas y en qué te podemos apoyar hoy?`,
      waText: 'Hola Javier, estoy explorando el sitio de Loboalpha y quisiera información.'
    },

    despedida: {
      text: `¡Fue un placer ayudarte! 🐕 Te mando una movidita de cola y un fuerte abrazo a ti y a tu perrito. ¡Aquí estaré si me necesitas!`,
      waText: 'Hola Javier, estuve platicando con Alpha y me gustaría ponerme en contacto.'
    },

    fallback: {
      text: `¡Qué buena pregunta! Al tratarse de un caso específico de tu perrito, lo más profesional y seguro es que lo revise directamente **Javier Baños** para darte una orientación exacta sin suposiciones.\n\n` +
            `¿Gustas escribirle un mensaje directo por WhatsApp? Puedes usar el botón de abajo.`,
      waText: 'Hola Javier, tengo una duda específica sobre mi perro y me gustaría platicar contigo.'
    }
  };

  // Motor semántico de palabras clave para preguntas libres
  function matchIntent(userMessage) {
    const raw = (userMessage || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Detección de consultas médicas / veterinarias (estricta regla ética)
    if (/enferm|medicina|medicamento|vomit|sangr|diarrea|pastilla|dosis|inyecc|fiebre|cojea|tumor|herida|parasit|parvo|distemper|moquillo|garrapata|pulga/.test(raw)) {
      return 'veterinaria';
    }

    // 2. Precios / Costos
    if (/precio|costo|cuanto cuesta|tarifa|cuanto cobran|cotiz|valor/.test(raw)) {
      return 'precios';
    }

    // 3. Citas / Agendar / Contacto
    if (/agend|cita|sesion|contacto|telefono|whatsapp|ubicacion|donde estan|horario|reserv/.test(raw)) {
      return 'agendar';
    }

    // 4. Javier Baños
    if (/javier|banos|quien eres|quien es|instructor|fundador|experiencia/.test(raw)) {
      return 'javier';
    }

    // 5. Conducta / Problemas
    if (/conduct|agresiv|mied|fobia|ansiedad|separacion|mord|destru|ladra|reactiv|muerde|jala|pelea|pip|orina/.test(raw)) {
      return 'conducta';
    }

    // 6. Adiestramiento / Entrenamiento / Obediencia
    if (/adiestra|entrena|obedien|comportam|truco|sentarse|paseo|correa|limite/.test(raw)) {
      return 'adiestramiento';
    }

    // 7. Psicología Canina
    if (/psicolog|etolog|mente|emocion|estres|frustra/.test(raw)) {
      return 'psicologia';
    }

    // 8. Comunicación Intuitiva
    if (/intuitiv|telepat|conexion|sinton|espiritual|mensaje/.test(raw)) {
      return 'comunicacion';
    }

    // 9. Servicios generales
    if (/servicio|que hacen|que ofrecen|paquete|taller|curso|clase/.test(raw)) {
      return 'servicios';
    }

    // 10. Saludos
    if (/^(hola|buen(as|os)|hey|que tal|saludos|buenas tardes|buenos dias)/.test(raw)) {
      return 'saludo';
    }

    // 11. Agradecimiento / Despedida
    if (/gracias|muchas gracias|adios|bye|hasta luego|chao/.test(raw)) {
      return 'despedida';
    }

    return 'fallback';
  }

  // Elementos del DOM
  let container, toggleBtn, chatWindow, messagesContainer, form, input, muteBtn, closeBtn, barkAudio;

  function initAudio() {
    if (!barkAudio) {
      barkAudio = new Audio(CONFIG.audioSrc);
      barkAudio.preload = 'auto';
    }
  }

  function playBark() {
    if (state.isMuted) return;
    const now = Date.now();
    if (now - state.lastBarkTime < CONFIG.cooldownMs) return; // Cooldown anti-molestia
    state.lastBarkTime = now;

    try {
      initAudio();
      barkAudio.currentTime = 0;
      const playPromise = barkAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Bloqueo de autoplay del navegador ignorado de forma segura
        });
      }
    } catch (e) {
      // Ignorar de forma no bloqueante
    }
  }

  function setMuted(muted) {
    state.isMuted = muted;
    localStorage.setItem(CONFIG.storageMuteKey, muted ? 'true' : 'false');
    if (muteBtn) {
      muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      muteBtn.setAttribute('title', muted ? 'Activar sonido de Alpha' : 'Silenciar sonido de Alpha');
      const iconMuted = muteBtn.querySelector('.ico-muted');
      const iconActive = muteBtn.querySelector('.ico-active');
      if (iconMuted && iconActive) {
        iconMuted.style.display = muted ? 'block' : 'none';
        iconActive.style.display = muted ? 'none' : 'block';
      }
    }
  }

  function formatMessageHtml(rawText) {
    // Parser seguro de markdown simple (**bold**, \n\n, listas)
    let safe = rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Negritas
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Párrafos
    const paragraphs = safe.split('\n\n').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      // Líneas con saltos simples
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean).join('');

    return paragraphs;
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function appendMessage(sender, text, options = {}) {
    const msgEl = document.createElement('div');
    msgEl.className = `alpha-msg alpha-msg--${sender}`;

    if (sender === 'bot') {
      const avatarMini = document.createElement('div');
      avatarMini.className = 'alpha-msg__avatar';
      avatarMini.innerHTML = `
        <img src="assets/media/alpha-avatar-poster.jpg" alt="ALPHA" width="32" height="32" loading="lazy">
      `;
      msgEl.appendChild(avatarMini);
    }

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'alpha-msg__bubble';
    bubbleEl.innerHTML = formatMessageHtml(text);

    // Botón de WhatsApp contextual si aplica
    if (options.waText) {
      const waAction = document.createElement('div');
      waAction.className = 'alpha-msg__action';
      const encoded = encodeURIComponent(options.waText);
      waAction.innerHTML = `
        <a class="btn-alpha-wa" href="https://wa.me/${CONFIG.phone}?text=${encoded}" target="_blank" rel="noopener noreferrer">
          <svg class="ico" aria-hidden="true" width="16" height="16"><use href="#i-whatsapp"/></svg>
          Platicar con Javier por WhatsApp
        </a>
      `;
      bubbleEl.appendChild(waAction);
    }

    msgEl.appendChild(bubbleEl);
    messagesContainer.appendChild(msgEl);
    scrollToBottom();
  }

  function showTypingIndicator() {
    if (state.isTyping) return;
    state.isTyping = true;

    const typingEl = document.createElement('div');
    typingEl.className = 'alpha-msg alpha-msg--bot alpha-msg--typing';
    typingEl.id = 'alpha-typing-indicator';
    typingEl.innerHTML = `
      <div class="alpha-msg__avatar">
        <img src="assets/media/alpha-avatar-poster.jpg" alt="ALPHA" width="32" height="32">
      </div>
      <div class="alpha-msg__bubble alpha-typing-bubble" aria-label="ALPHA está escribiendo">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesContainer.appendChild(typingEl);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    state.isTyping = false;
    const indicator = document.getElementById('alpha-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function renderQuickReplies() {
    const existing = messagesContainer.querySelector('.alpha-quick-replies');
    if (existing) existing.remove();

    const containerEl = document.createElement('div');
    containerEl.className = 'alpha-quick-replies';
    containerEl.setAttribute('role', 'group');
    containerEl.setAttribute('aria-label', 'Preguntas frecuentes sugeridas');

    FAQ_QUESTIONS.forEach(q => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'alpha-quick-btn';
      btn.textContent = q.label;
      btn.setAttribute('data-faq-id', q.id);
      btn.addEventListener('click', () => {
        handleUserQuery(q.triggerText, q.id);
      });
      containerEl.appendChild(btn);
    });

    messagesContainer.appendChild(containerEl);
    scrollToBottom();
  }

  function handleUserQuery(queryText, intentOverride = null) {
    const text = (queryText || '').trim();
    if (!text) return;

    // 1. Mostrar mensaje del usuario
    appendMessage('user', text);

    // 2. Determinar intención
    const intent = intentOverride || matchIntent(text);
    const response = KNOWLEDGE_BASE[intent] || KNOWLEDGE_BASE.fallback;

    // 3. Simular tipeo inteligente
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      appendMessage('bot', response.text, { waText: response.waText });
      // Ladrido suave al responder si no está silenciado
      playBark();
    }, CONFIG.typingDelayMs);
  }

  function openChat() {
    if (state.isOpen) return;
    state.isOpen = true;
    chatWindow.classList.add('is-open');
    chatWindow.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.classList.add('is-active');

    // Reproducir ladrido en la interacción
    playBark();

    // Si es la primera vez que se abre, asegurar que hay mensaje de bienvenida
    if (messagesContainer.children.length === 0) {
      renderWelcome();
    }

    // Enfocar input en desktop; en móvil evitar forzar zoom inmediato
    if (window.innerWidth > 640 && input) {
      setTimeout(() => input.focus(), 250);
    }
  }

  function closeChat() {
    if (!state.isOpen) return;
    state.isOpen = false;
    chatWindow.classList.remove('is-open');
    chatWindow.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.classList.remove('is-active');
    toggleBtn.focus();
  }

  function toggleChat() {
    if (state.isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function renderWelcome() {
    messagesContainer.innerHTML = '';
    const welcomeText = `¡Hola! Soy **ALPHA** 🐾\n\nEstoy aquí para ayudarte a conocer nuestros servicios y resolver tus dudas sobre tu perro.\n\nPuedes pulsar una de las preguntas frecuentes o escribirme lo que necesites:`;
    appendMessage('bot', welcomeText);
    renderQuickReplies();
  }

  function buildDOM() {
    container = document.createElement('div');
    container.className = 'alpha-chat-root';
    container.id = 'alpha-chat-assistant';

    container.innerHTML = `
      <!-- Botón Flotante con Avatar de Video Circular -->
      <button class="alpha-chat-toggle" id="alpha-chat-toggle" type="button"
              aria-label="Abrir asistente virtual Loboalpha: ALPHA" aria-expanded="false" aria-controls="alpha-chat-window">
        <div class="alpha-avatar-wrap">
          <video class="alpha-avatar-video" autoplay loop muted playsinline preload="metadata" poster="assets/media/alpha-avatar-poster.jpg">
            <source src="assets/media/alpha-avatar.mp4" type="video/mp4">
            <source src="assets/media/alpha-avatar.webm" type="video/webm">
          </video>
          <span class="alpha-status-dot" aria-hidden="true"></span>
        </div>
        <span class="alpha-chat-tooltip" aria-hidden="true">¡Hola! Pregúntale a ALPHA 🐾</span>
      </button>

      <!-- Ventana de Chat Elegante -->
      <section class="alpha-chat-window" id="alpha-chat-window" role="dialog" aria-modal="false"
               aria-labelledby="alpha-chat-title" aria-describedby="alpha-chat-subtitle" aria-hidden="true">
        <!-- Header -->
        <header class="alpha-chat-header">
          <div class="alpha-header-identity">
            <div class="alpha-header-avatar">
              <img src="assets/media/alpha-avatar-poster.jpg" alt="ALPHA avatar" width="40" height="40">
              <span class="alpha-online-badge" aria-hidden="true"></span>
            </div>
            <div class="alpha-header-text">
              <h2 id="alpha-chat-title" class="alpha-title">ALPHA <span class="alpha-badge-tag">AI</span></h2>
              <p id="alpha-chat-subtitle" class="alpha-subtitle">Asistente oficial · Loboalpha</p>
            </div>
          </div>
          <div class="alpha-header-controls">
            <!-- Botón de Mute de Sonido / Ladrido -->
            <button class="alpha-btn-icon alpha-mute-btn" id="alpha-mute-btn" type="button"
                    aria-label="Control de sonido" aria-pressed="false" title="Silenciar sonido de Alpha">
              <svg class="ico ico-active" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <svg class="ico ico-muted" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </button>
            <!-- Botón de Cerrar -->
            <button class="alpha-btn-icon alpha-close-btn" id="alpha-close-btn" type="button" aria-label="Cerrar asistente ALPHA">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        <!-- Mensajes -->
        <div class="alpha-messages" id="alpha-messages" role="log" aria-live="polite"></div>

        <!-- Formulario de entrada -->
        <form class="alpha-chat-form" id="alpha-chat-form" autocomplete="off">
          <input type="text" id="alpha-chat-input" class="alpha-chat-input"
                 placeholder="Hazle una pregunta a ALPHA..."
                 aria-label="Escribe tu mensaje a ALPHA" maxlength="240" required>
          <button type="submit" class="alpha-send-btn" aria-label="Enviar mensaje a ALPHA">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </section>
    `;

    document.body.appendChild(container);

    // Referencias
    toggleBtn = document.getElementById('alpha-chat-toggle');
    chatWindow = document.getElementById('alpha-chat-window');
    messagesContainer = document.getElementById('alpha-messages');
    form = document.getElementById('alpha-chat-form');
    input = document.getElementById('alpha-chat-input');
    muteBtn = document.getElementById('alpha-mute-btn');
    closeBtn = document.getElementById('alpha-close-btn');

    // Eventos
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);

    // Efecto de interacción (crecimiento al 200%) en hover y dispositivos táctiles
    toggleBtn.addEventListener('mouseenter', () => toggleBtn.classList.add('is-interacting'));
    toggleBtn.addEventListener('mouseleave', () => toggleBtn.classList.remove('is-interacting'));
    toggleBtn.addEventListener('touchstart', () => toggleBtn.classList.add('is-interacting'), { passive: true });
    toggleBtn.addEventListener('touchend', () => {
      setTimeout(() => toggleBtn.classList.remove('is-interacting'), 1200);
    }, { passive: true });

    muteBtn.addEventListener('click', () => {
      setMuted(!state.isMuted);
    });
    setMuted(state.isMuted);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value;
      if (!query.trim()) return;
      input.value = '';
      handleUserQuery(query);
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        closeChat();
      }
    });

    // Render inicial
    renderWelcome();
  }

  // Inicialización al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildDOM);
  } else {
    buildDOM();
  }
})();
