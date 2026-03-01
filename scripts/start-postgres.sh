#!/bin/bash

# Start PostgreSQL service

echo "Starting PostgreSQL..."

# Check if pg_lsclusters command exists (Debian/Ubuntu specific)
if command -v pg_lsclusters &> /dev/null; then
    echo "Checking PostgreSQL clusters..."

    # List clusters and check if any exist
    CLUSTERS=$(sudo pg_lsclusters -h 2>/dev/null | wc -l)

    if [ "$CLUSTERS" -eq 0 ]; then
        echo "No PostgreSQL clusters found. Creating default cluster..."
        # Get PostgreSQL version
        PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
        sudo pg_createcluster $PG_VERSION main --start
    else
        # Start all clusters
        echo "Starting PostgreSQL clusters..."
        sudo pg_ctlcluster $(pg_lsclusters -h | awk '{print $1, $2}' | head -1) start 2>/dev/null || true
    fi
fi

# Start the PostgreSQL service
sudo service postgresql start

# Wait a moment
sleep 2

# Check if PostgreSQL is actually running by trying to connect
if sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
    echo "✓ PostgreSQL is running!"

    # Show running clusters
    if command -v pg_lsclusters &> /dev/null; then
        echo ""
        echo "Running clusters:"
        sudo pg_lsclusters
    fi
else
    echo "❌ PostgreSQL service started but cannot connect."
    echo ""
    echo "Troubleshooting:"
    echo "1. Check status: sudo service postgresql status"
    echo "2. Check logs: sudo tail -f /var/log/postgresql/postgresql-*-main.log"
    echo "3. List clusters: sudo pg_lsclusters"
    exit 1
fi
