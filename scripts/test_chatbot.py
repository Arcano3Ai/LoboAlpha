import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def test_alpha_chatbot():
    target_url = Path("index.html").resolve().as_uri()
    print(f"Cargando {target_url}...")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # 1. Test en Móvil (iPhone 14 viewport)
        print("--- Test en Móvil (390x844) ---")
        context_mobile = await browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15"
        )
        page = await context_mobile.new_page()
        
        # Interceptar logs de consola
        page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser Error] {err}"))
        
        await page.goto(target_url)
        await page.wait_for_selector("#alpha-chat-toggle")
        
        # Verificar que el video del avatar esté presente y muteado
        video = await page.query_selector(".alpha-avatar-video")
        is_muted = await video.evaluate("el => el.muted")
        is_loop = await video.evaluate("el => el.loop")
        print(f"Avatar Video: muted={is_muted}, loop={is_loop}")
        assert is_muted == True, "El video debe estar mudo por defecto"
        assert is_loop == True, "El video debe estar en loop"

        # Verificar posiciones relativas: WhatsApp abajo, Bot arriba
        wa_bbox = await page.locator(".wa-float").bounding_box()
        bot_bbox = await page.locator("#alpha-chat-toggle").bounding_box()
        print(f"WhatsApp Box: y={wa_bbox['y']}, height={wa_bbox['height']}")
        print(f"Bot Box: y={bot_bbox['y']}, height={bot_bbox['height']}")
        assert bot_bbox['y'] < wa_bbox['y'], "El Bot debe estar arriba de WhatsApp"

        # Tomar screenshot con el avatar cerrado en móvil (estado normal)
        await page.screenshot(path="assets/img/raw/test-mobile-closed.png")

        # Probar interacción / hover (crecimiento al 200%)
        print("Activando hover/interacción en el bot...")
        await page.hover("#alpha-chat-toggle")
        await page.wait_for_timeout(400)
        await page.screenshot(path="assets/img/raw/test-mobile-hover-zoom200.png")
        print("Screenshot de hover al 200% guardado.")
        
        # Hacer clic en el avatar para abrir la ventana
        print("Pulsando avatar circular para abrir chat...")
        await page.click("#alpha-chat-toggle")
        await page.wait_for_timeout(600)
        
        # Verificar que la ventana esté abierta
        is_open = await page.evaluate("() => document.getElementById('alpha-chat-window').classList.contains('is-open')")
        print(f"Chat Window isOpen: {is_open}")
        assert is_open == True
        
        # Verificar encabezado y subtítulo
        title_text = await page.text_content("#alpha-chat-title")
        subtitle_text = await page.text_content("#alpha-chat-subtitle")
        print(f"Title: {title_text}, Subtitle: {subtitle_text}")
        assert "ALPHA" in title_text
        
        # Verificar presencia de las 6 preguntas frecuentes
        quick_btns = await page.query_selector_all(".alpha-quick-btn")
        print(f"Total botones FAQ: {len(quick_btns)}")
        assert len(quick_btns) == 6
        
        btn_texts = [await b.text_content() for b in quick_btns]
        print(f"Botones FAQ disponibles: {btn_texts}")
        
        # Probar click en FAQ: "¿Qué servicios ofrecen?"
        print("Pulsando FAQ: ¿Qué servicios ofrecen?...")
        await page.click("button[data-faq-id='servicios']")
        await page.wait_for_timeout(1000)
        
        # Verificar que haya llegado la respuesta del bot
        bot_msgs = await page.query_selector_all(".alpha-msg--bot")
        print(f"Mensajes de ALPHA en el chat: {len(bot_msgs)}")
        assert len(bot_msgs) >= 2 # Bienvenida + Respuesta
        
        # Verificar botón de WhatsApp
        wa_btn = await page.query_selector(".btn-alpha-wa")
        wa_href = await wa_btn.get_attribute("href")
        print(f"Enlace WhatsApp en mensaje: {wa_href}")
        assert "wa.me/528186866182" in wa_href
        
        # Captura de pantalla del chat abierto con respuesta en móvil
        await page.screenshot(path="assets/img/raw/test-mobile-faq-response.png")
        
        # Probar envío de texto libre
        print("Escribiendo pregunta libre: 'Mi perro le ladra a otros perros en el parque'...")
        await page.fill("#alpha-chat-input", "Mi perro le ladra a otros perros en el parque")
        await page.click(".alpha-send-btn")
        await page.wait_for_timeout(1000)
        
        # Captura de pantalla de la respuesta libre
        await page.screenshot(path="assets/img/raw/test-mobile-free-text.png")
        
        # Probar botón de Mute
        print("Probando botón de silencio/mute...")
        mute_btn = await page.query_selector("#alpha-mute-btn")
        await mute_btn.click()
        is_muted_storage = await page.evaluate("() => localStorage.getItem('loboalpha_assistant_muted')")
        print(f"Storage Muted: {is_muted_storage}")
        assert is_muted_storage == "true"
        
        # Probar cerrar chat
        await page.click("#alpha-close-btn")
        await page.wait_for_timeout(500)
        is_open_after_close = await page.evaluate("() => document.getElementById('alpha-chat-window').classList.contains('is-open')")
        print(f"Chat Window isOpen after close: {is_open_after_close}")
        assert is_open_after_close == False
        
        # 2. Test en Desktop (1280x800)
        print("\n--- Test en Desktop (1280x800) ---")
        context_desktop = await browser.new_context(viewport={"width": 1280, "height": 800})
        page_desktop = await context_desktop.new_page()
        await page_desktop.goto(target_url)
        await page_desktop.wait_for_selector("#alpha-chat-toggle")
        
        # Abrir y verificar posición flotante en esquina inferior derecha
        await page_desktop.click("#alpha-chat-toggle")
        await page_desktop.wait_for_timeout(600)
        await page_desktop.screenshot(path="assets/img/raw/test-desktop-open.png")
        print("Screenshot desktop guardado con éxito.")
        
        await browser.close()
        print("\n¡Todos los tests pasaron exitosamente!")

if __name__ == "__main__":
    asyncio.run(test_alpha_chatbot())
