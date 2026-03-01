#!/bin/bash

# Reset the database (drops and recreates)

echo "=========================================="
echo "WARNING: This will DELETE all data!"
echo "=========================================="
echo ""
read -p "Are you sure you want to reset the database? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Dropping database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS whats_on_my_plate;"

echo "Recreating database..."
sudo -u postgres psql -c "CREATE DATABASE whats_on_my_plate OWNER \"user\";"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE whats_on_my_plate TO \"user\";"

echo ""
echo "Database reset complete!"
echo ""
echo "Next steps:"
echo "  1. Run migrations: npm run db:migrate"
echo "  2. Seed database (optional): npm run db:seed"
echo ""
