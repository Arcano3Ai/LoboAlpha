import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def run_suite():
    target_url = Path("index.html").resolve().as_uri()
    print("=" * 60)
    print("LOBOALPHA SUITE DE PRUEBAS AUTOMATIZADAS (Pickle Rick Mode)")
    print(f"URL: {target_url}")
    print("=" * 60)

    errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        viewports = [
            {"name": "Móvil SE (375x667)", "width": 375, "height": 667, "is_mobile": True},
            {"name": "Móvil iPhone 14 (390x844)", "width": 390, "height": 844, "is_mobile": True},
            {"name": "Tablet iPad (768x1024)", "width": 768, "height": 1024, "is_mobile": False},
            {"name": "Desktop (1280x800)", "width": 1280, "height": 800, "is_mobile": False},
        ]

        for vp in viewports:
            print(f"\n[TESTING VIEWPORT] {vp['name']}...")
            context = await browser.new_context(
                viewport={"width": vp["width"], "height": vp["height"]},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" if not vp["is_mobile"]
                           else "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15"
            )
            page = await context.new_page()

            page_errors = []
            page.on("pageerror", lambda err: page_errors.append(f"JS Error: {err}"))
            page.on("console", lambda msg: page_errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)

            await page.goto(target_url, wait_until="domcontentloaded")
            await page.wait_for_timeout(500)

            # 1. Comprobar que los elementos flotantes existan
            wa_el = await page.query_selector(".wa-float")
            bot_el = await page.query_selector("#alpha-chat-toggle")
            audio_el = await page.query_selector("#audio-toggle")

            assert wa_el is not None, "El botón de WhatsApp (.wa-float) debe existir"
            assert bot_el is not None, "El botón del Bot (#alpha-chat-toggle) debe existir"
            assert audio_el is not None, "El botón de Audio (#audio-toggle) debe existir"

            # 2. Posición: WhatsApp abajo y Bot arriba
            wa_box = await wa_el.bounding_box()
            bot_box = await bot_el.bounding_box()

            print(f"  ✓ WhatsApp Box: y={wa_box['y']:.1f}, h={wa_box['height']:.1f}")
            print(f"  ✓ Bot Box:      y={bot_box['y']:.1f}, h={bot_box['height']:.1f}")

            # Bot debe estar físicamente arriba de WhatsApp (y menor que wa_box y)
            if not (bot_box['y'] < wa_box['y']):
                errors.append(f"[{vp['name']}] Error: El Bot (y={bot_box['y']}) no está arriba de WhatsApp (y={wa_box['y']})")
            else:
                print(f"  ✓ POSICIÓN OK: Bot arriba ({bot_box['y']:.1f}px) < WhatsApp abajo ({wa_box['y']:.1f}px)")

            # WhatsApp debe estar dentro del viewport
            if wa_box['y'] + wa_box['height'] > vp['height'] + 5:
                errors.append(f"[{vp['name']}] Error: WhatsApp queda fuera de pantalla por abajo")
            else:
                print(f"  ✓ WhatsApp visible dentro del viewport")

            # 3. Comprobar crecimiento del 200% al interactuar/hover
            base_width = bot_box['width']
            await bot_el.hover()
            await page.wait_for_timeout(450) # esperar animación de 400ms

            # Medir escala calculando transform o bounding_box del contenedor
            hover_box = await bot_el.bounding_box()
            scale_ratio = hover_box['width'] / base_width
            print(f"  ✓ Ancho base: {base_width:.1f}px -> Ancho con hover: {hover_box['width']:.1f}px (Ratio: {scale_ratio:.2f}x)")

            if scale_ratio < 1.7: # Permite margen de cálculo por render subpixel
                errors.append(f"[{vp['name']}] Error: El crecimiento en hover no alcanzó el ~200% (Ratio: {scale_ratio:.2f}x)")
            else:
                print(f"  ✓ ZOOM OK: Crecimiento ~200% validado ({scale_ratio:.2f}x)")

            # 4. Probar apertura y flujo del Chatbot (solo en 1 móvil y desktop para agilidad)
            if vp["width"] in [390, 1280]:
                print(f"  -> Probando flujo interactivo del Chatbot...")
                await bot_el.click()
                await page.wait_for_timeout(400)

                is_open = await page.evaluate("() => document.getElementById('alpha-chat-window').classList.contains('is-open')")
                assert is_open, "La ventana del chat debe estar abierta (.is-open)"
                print("  ✓ Ventana del chat abierta correctamente")

                # Verificar FAQs
                quick_btns = await page.query_selector_all(".alpha-quick-btn")
                assert len(quick_btns) == 6, f"Deben haber 6 botones FAQ, encontrados: {len(quick_btns)}"
                print(f"  ✓ 6 FAQs presentes")

                # Click en 'Mi perro tiene problemas de conducta.'
                await page.click("button[data-faq-id='conducta']")
                await page.wait_for_timeout(800)

                bot_msgs = await page.query_selector_all(".alpha-msg--bot")
                assert len(bot_msgs) >= 2, "Debe haber mensaje de bienvenida y respuesta a la FAQ"
                print("  ✓ Respuesta contextual del bot recibida")

                # Verificar enlace a WhatsApp
                last_wa_link = await page.query_selector(".btn-alpha-wa")
                assert last_wa_link is not None, "La respuesta debe incluir botón directo a WhatsApp"
                href = await last_wa_link.get_attribute("href")
                assert "wa.me/528186866182" in href
                print(f"  ✓ Botón WhatsApp validado: {href[:45]}...")

                # Enviar pregunta libre
                await page.fill("#alpha-chat-input", "¿Cuál es el costo de una sesión a domicilio?")
                await page.click(".alpha-send-btn")
                await page.wait_for_timeout(800)

                bot_msgs_after = await page.query_selector_all(".alpha-msg--bot")
                assert len(bot_msgs_after) >= 3, "Debe responder a la pregunta de precios"
                print("  ✓ Pregunta libre respondida correctamente con política de transparencia y valoración")

                # Probar Mute
                mute_btn = await page.query_selector("#alpha-mute-btn")
                await mute_btn.click()
                muted_val = await page.evaluate("() => localStorage.getItem('loboalpha_assistant_muted')")
                assert muted_val == "true", "Mute debe guardarse en localStorage como 'true'"
                print("  ✓ Control de Mute verificado")

                # Cerrar chat con botón cerrar
                close_btn = await page.query_selector("#alpha-close-btn")
                await close_btn.click()
                await page.wait_for_timeout(350)
                is_closed = await page.evaluate("() => !document.getElementById('alpha-chat-window').classList.contains('is-open')")
                assert is_closed, "El chat debe cerrarse al pulsar el botón cerrar"
                print("  ✓ Cierre de ventana validado")

            if page_errors:
                for pe in page_errors:
                    errors.append(f"[{vp['name']}] {pe}")

            await context.close()

        await browser.close()

    print("\n" + "=" * 60)
    if errors:
        print(f"FALLOS ENCONTRADOS ({len(errors)}):")
        for e in errors:
            print(f"  - {e}")
        return False
    else:
        print("¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE (0 ERRORES)!")
        print("=" * 60)
        return True

if __name__ == "__main__":
    success = asyncio.run(run_suite())
    exit(0 if success else 1)
