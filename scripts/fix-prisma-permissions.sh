#!/bin/bash

# Fix Prisma permissions - grant CREATEDB to user

echo "Granting CREATEDB permission to user..."

sudo -u postgres psql -c "ALTER USER \"user\" CREATEDB;"

echo "✓ Permission granted!"
echo ""
echo "Now you can run migrations:"
echo "  cd server && npm run db:migrate"
