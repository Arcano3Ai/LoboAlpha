import asyncio
from playwright.async_api import async_playwright
import os
import pprint

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True
        )
        path = os.path.abspath("index.html").replace("\\", "/")
        await page.goto(f"file:///{path}")
        
        toggle = page.locator(".nav-toggle")
        menu = page.locator("#menu")
        
        # 1. Click toggle to open
        await toggle.click()
        await page.wait_for_timeout(300)
        
        state1 = await page.evaluate("""() => {
            const m = document.getElementById('menu');
            const r = m.getBoundingClientRect();
            const links = Array.from(m.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.getAttribute('href'),
                visible: a.offsetWidth > 0 && a.offsetHeight > 0
            }));
            return {
                isOpen: m.classList.contains('is-open'),
                bodyMenuOpen: document.body.classList.contains('menu-open'),
                rect: { top: Math.round(r.top), height: Math.round(r.height), width: Math.round(r.width) },
                linksCount: links.length,
                allLinksVisible: links.every(l => l.visible),
                links: links
            };
        }""")
        print("=== Menu Open State ===")
        pprint.pprint(state1)
        
        # 2. Test click on a link inside menu (e.g., Blog)
        blog_link = page.locator("#menu a[href='#articulos']")
        await blog_link.scroll_into_view_if_needed()
        await blog_link.click()
        await page.wait_for_timeout(400)
        
        closed_after_click = await page.evaluate("() => !document.getElementById('menu').classList.contains('is-open')")
        body_unlocked = await page.evaluate("() => !document.body.classList.contains('menu-open')")
        url_hash = await page.evaluate("() => window.location.hash")
        print(f"Menu closed after link click: {closed_after_click}")
        print(f"Body unlocked after click: {body_unlocked}")
        print(f"URL hash after click: {url_hash}")
        
        # 3. Test open and close with toggle
        await toggle.click()
        await page.wait_for_timeout(300)
        reopened = await page.evaluate("() => document.getElementById('menu').classList.contains('is-open')")
        print(f"Menu reopened with toggle: {reopened}")
        
        await toggle.click()
        await page.wait_for_timeout(300)
        closed_with_toggle = await page.evaluate("() => !document.getElementById('menu').classList.contains('is-open')")
        print(f"Menu closed with toggle: {closed_with_toggle}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
