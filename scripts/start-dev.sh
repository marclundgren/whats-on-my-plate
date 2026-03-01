#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Start PostgreSQL if not running
echo "Checking PostgreSQL..."
if ! sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
    echo "Starting PostgreSQL..."
    ./scripts/start-postgres.sh
fi

echo ""
echo "=========================================="
echo "Starting What's On My Plate"
echo "=========================================="
echo ""
echo "Server will run on: http://localhost:3001"2
echo "Client will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run both servers
npm run dev