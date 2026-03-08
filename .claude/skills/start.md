Start the development server for this project.

Steps:
1. Check if `node_modules` is missing in any of the three locations: root, `server/`, or `client/`. If any are missing, run `npm run install:all` from the project root first.
2. Ensure the PostgreSQL database is running via Docker. Run `docker compose up -d db` from the project root. If Docker daemon is not running, launch it first with `open -a Docker` and wait for it to be ready (poll `docker info` every 5 seconds, up to 60 seconds).
3. Kill any existing processes using the dev server ports. Use: `lsof -ti:3001,5173 | xargs kill -9 2>/dev/null || true`
4. Start the dev server in the background using `npm run dev` from the project root. Use `run_in_background: true` on the Bash tool call.
5. Tell the user the server is starting and what URLs to expect (client at http://localhost:5173, server at http://localhost:3001).
