import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        path = os.path.abspath("index.html").replace("\\", "/")
        await page.goto(f"file:///{path}")
        
        # 1. Test hamburger menu toggle
        nav_toggle = page.locator(".nav-toggle")
        await nav_toggle.click()
        await page.wait_for_timeout(400)
        
        is_open = await page.evaluate("() => document.querySelector('.main-nav').classList.contains('is-open')")
        aria_exp = await nav_toggle.get_attribute("aria-expanded")
        print(f"Menu opened: {is_open}, aria-expanded: {aria_exp}")
        
        # Capture screenshot of open menu
        os.makedirs("assets/img/raw", exist_ok=True)
        await page.screenshot(path="assets/img/raw/mobile-menu-verified.png")
        
        # Click a nav link inside menu
        first_link = page.locator(".main-nav a[href='#filosofia']")
        await first_link.click()
        await page.wait_for_timeout(400)
        
        is_closed = await page.evaluate("() => !document.querySelector('.main-nav').classList.contains('is-open')")
        print(f"Menu closed after link click: {is_closed}")
        
        # 2. Test Service Modal
        service_btn = page.locator(".service-card button[data-service='psicologia']").first
        await service_btn.scroll_into_view_if_needed()
        await service_btn.click()
        await page.wait_for_timeout(300)
        
        modal_open = await page.evaluate("() => document.getElementById('service-dialog').open")
        modal_title = await page.evaluate("() => document.getElementById('dlg-title').innerText")
        print(f"Service modal open: {modal_open}, Title: '{modal_title}'")
        await page.screenshot(path="assets/img/raw/mobile-modal-verified.png")
        
        # Close modal
        close_btn = page.locator(".dlg-close")
        await close_btn.click()
        await page.wait_for_timeout(200)
        modal_closed = await page.evaluate("() => !document.getElementById('service-dialog').open")
        print(f"Service modal closed: {modal_closed}")
        
        # 3. Test Workshop CTA href
        workshop_cta = page.locator(".workshop-card a.workshop-btn").first
        await workshop_cta.scroll_into_view_if_needed()
        href = await workshop_cta.get_attribute("href")
        print(f"Workshop CTA href: {href}")
        
        # 4. Test Floating WhatsApp button
        wa_float = page.locator(".wa-float")
        wa_href = await wa_float.get_attribute("href")
        print(f"Floating WhatsApp href: {wa_href}")
        
        # 5. Test Audio elements & trigger on scroll
        audio_btn = page.locator("#audio-toggle")
        audio_visible = await audio_btn.is_visible()
        print(f"Audio float button visible: {audio_visible}")
        
        # Scroll down to trigger audio
        await page.evaluate("() => window.scrollTo(0, 150)")
        await page.wait_for_timeout(300)
        
        audio_src = await page.evaluate("() => document.getElementById('bg-audio').getAttribute('src')")
        print(f"Audio src configured: {audio_src}")

        # 6. Test Blog section & cards
        blog_cards_count = await page.locator(".blog-card").count()
        print(f"Blog cards count: {blog_cards_count}")

        # 7. Check 0 horizontal overflow
        widths = await page.evaluate("() => ({ docClient: document.documentElement.clientWidth, docScroll: document.documentElement.scrollWidth, bodyClient: document.body.clientWidth, bodyScroll: document.body.scrollWidth })")
        print(f"Widths check: {widths}")

        # 8. Full page mobile screenshot
        await page.screenshot(path="assets/img/raw/mobile-full-verified.png", full_page=True)
        print("Full mobile screenshot saved.")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
