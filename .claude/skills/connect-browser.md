Connect to the running app in the browser for visual feedback and debugging.

Steps:
1. Use `mcp__plugin_playwright_playwright__browser_navigate` to navigate to `http://localhost:5173`
2. Use `mcp__plugin_playwright_playwright__browser_take_screenshot` to capture the current state and show it to the user
3. Use `mcp__plugin_playwright_playwright__browser_snapshot` to get the accessibility tree if you need to understand the DOM structure
4. Report what you see to the user

When debugging:
- Use `mcp__plugin_playwright_playwright__browser_console_messages` to check for existing console errors/logs
- Use `mcp__plugin_playwright_playwright__browser_evaluate` to run JavaScript in the page (e.g. `console.log(...)`, inspect state, etc.)
- If the user asks to add a temporary console log to a source file, edit the file, wait for Vite hot reload, then take a screenshot and check console messages
- Always clean up any temporary console.log statements added to source files after debugging is done

For interaction:
- Use `mcp__plugin_playwright_playwright__browser_click` to click elements
- Use `mcp__plugin_playwright_playwright__browser_fill_form` to fill inputs
- Use `mcp__plugin_playwright_playwright__browser_network_requests` to inspect API calls

Always take a screenshot after any interaction to confirm the result.
