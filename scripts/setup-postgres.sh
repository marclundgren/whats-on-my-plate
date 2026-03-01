#!/bin/bash

# Setup script for PostgreSQL in WSL

echo "=========================================="
echo "PostgreSQL Setup for What's On My Plate"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    echo "PostgreSQL installed successfully!"
else
    echo "✓ PostgreSQL is already installed."
fi

echo ""

# Check if pg_lsclusters exists (Debian/Ubuntu)
if command -v pg_lsclusters &> /dev/null; then
    echo "Checking PostgreSQL clusters..."

    # Check if any clusters exist
    CLUSTER_COUNT=$(sudo pg_lsclusters -h 2>/dev/null | wc -l)

    if [ "$CLUSTER_COUNT" -eq 0 ]; then
        echo "No PostgreSQL clusters found. Creating default cluster..."
        PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
        sudo pg_createcluster $PG_VERSION main --start
        echo "✓ PostgreSQL cluster created and started"
    else
        echo "✓ PostgreSQL cluster exists"
        # Make sure it's started
        sudo pg_ctlcluster $(sudo pg_lsclusters -h | awk '{print $1, $2}' | head -1) start 2>/dev/null || echo "Cluster already running"
    fi
else
    echo "Starting PostgreSQL service..."
    sudo service postgresql start
fi

# Wait for PostgreSQL to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
sleep 3

# Verify PostgreSQL is running
if ! sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
    echo "❌ PostgreSQL is not responding. Please check logs:"
    echo "   sudo tail -f /var/log/postgresql/postgresql-*-main.log"
    exit 1
fi

echo "✓ PostgreSQL is running"

# Check if database already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='whats_on_my_plate'" 2>/dev/null)

if [ "$DB_EXISTS" = "1" ]; then
    echo ""
    echo "✓ Database 'whats_on_my_plate' already exists."
    echo "   If you want to reset it, run: ./scripts/reset-database.sh"
else
    echo ""
    echo "Creating database user and database..."

    # Create user (ignore error if already exists)
    sudo -u postgres psql -c "CREATE USER \"user\" WITH PASSWORD 'password';" 2>/dev/null || echo "  (User already exists, continuing...)"

    # Grant CREATEDB permission (needed for Prisma shadow database)
    sudo -u postgres psql -c "ALTER USER \"user\" CREATEDB;"

    # Create database
    sudo -u postgres psql -c "CREATE DATABASE whats_on_my_plate OWNER \"user\";"

    # Grant privileges
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE whats_on_my_plate TO \"user\";"

    # Grant schema privileges (needed for Prisma)
    sudo -u postgres psql -d whats_on_my_plate -c "GRANT ALL ON SCHEMA public TO \"user\";"

    echo "✓ Database created successfully!"
fi

echo ""
echo "=========================================="
echo "PostgreSQL Setup Complete!"
echo "=========================================="
echo ""
echo "Database Details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: whats_on_my_plate"
echo "  User: user"
echo "  Password: password"
echo ""
echo "Connection String:"
echo "  postgresql://user:password@localhost:5432/whats_on_my_plate"
echo ""
echo "Next steps:"
echo "  1. Run migrations: cd server && npm run db:migrate"
echo "  2. Seed database (optional): cd server && npm run db:seed"
echo ""
