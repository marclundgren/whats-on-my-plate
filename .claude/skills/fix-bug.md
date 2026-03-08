Fix a bug in the app. Takes a description of the bug as input.

Steps:
1. Use `mcp__plugin_playwright_playwright__browser_navigate` to go to `http://localhost:5173` (or the relevant page if the user specifies one).
2. Use `mcp__plugin_playwright_playwright__browser_take_screenshot` to capture the current state and confirm the bug is visible.
3. Use `mcp__plugin_playwright_playwright__browser_console_messages` (level: "error") to check for console errors related to the bug.
4. Use `mcp__plugin_playwright_playwright__browser_network_requests` to check for failing API calls if the bug seems backend-related.
5. If more debugging is needed, use `mcp__plugin_playwright_playwright__browser_evaluate` to inspect runtime state, or temporarily add `console.log` statements to source files and check the console after Vite hot-reloads.
6. Read the relevant source files to understand the root cause.
7. Write the fix — edit the source file(s) directly.
8. Wait for Vite to hot-reload (a second or two), then take a screenshot to confirm the bug is gone.
9. Clean up any temporary `console.log` statements added during debugging.
10. Report what the root cause was and what was changed to fix it.
