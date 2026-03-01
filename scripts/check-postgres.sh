#!/bin/bash

# Check PostgreSQL status and connection

echo "=========================================="
echo "PostgreSQL Status Check"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is NOT installed"
    echo "   Run: ./scripts/setup-postgres.sh"
    exit 1
else
    echo "✓ PostgreSQL is installed"
fi

# Check if service is running
if sudo service postgresql status | grep -q "online"; then
    echo "✓ PostgreSQL service is running"
else
    echo "❌ PostgreSQL service is NOT running"
    echo "   Run: ./scripts/start-postgres.sh"
    exit 1
fi

# Check if database exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='whats_on_my_plate'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo "✓ Database 'whats_on_my_plate' exists"
else
    echo "❌ Database 'whats_on_my_plate' does NOT exist"
    echo "   Run: ./scripts/setup-postgres.sh"
    exit 1
fi

# Try to connect to database
if PGPASSWORD=password psql -h localhost -U user -d whats_on_my_plate -c "SELECT 1;" &>/dev/null; then
    echo "✓ Can connect to database"
else
    echo "❌ Cannot connect to database"
    exit 1
fi

echo ""
echo "=========================================="
echo "All checks passed! PostgreSQL is ready."
echo "=========================================="
