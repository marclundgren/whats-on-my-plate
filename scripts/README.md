# Database Setup Scripts

These scripts help you manage PostgreSQL for the What's On My Plate application.

## Quick Start

Run this script first to install and configure PostgreSQL:

```bash
./scripts/setup-postgres.sh
```

This will:
- Install PostgreSQL (if not already installed)
- Start the PostgreSQL service
- Create the database user and database
- Display connection information

## Available Scripts

### `setup-postgres.sh`
**Purpose**: Complete PostgreSQL setup (install, configure, create database)

```bash
./scripts/setup-postgres.sh
```

Run this first! It handles everything needed to get PostgreSQL ready.

### `check-postgres.sh`
**Purpose**: Verify PostgreSQL is installed, running, and database is accessible

```bash
./scripts/check-postgres.sh
```

Use this to troubleshoot connection issues or verify your setup.

### `start-postgres.sh`
**Purpose**: Start the PostgreSQL service

```bash
./scripts/start-postgres.sh
```

Run this when PostgreSQL is not running (e.g., after restarting WSL).

### `stop-postgres.sh`
**Purpose**: Stop the PostgreSQL service

```bash
./scripts/stop-postgres.sh
```

Use this to cleanly shutdown PostgreSQL.

### `reset-database.sh`
**Purpose**: Drop and recreate the database (deletes all data!)

```bash
./scripts/reset-database.sh
```

⚠️ **Warning**: This will delete ALL your tasks and data! Use with caution.

## Typical Workflow

### First Time Setup
```bash
# 1. Setup PostgreSQL
./scripts/setup-postgres.sh

# 2. Generate Prisma client and run migrations
cd server
npm run db:generate
npm run db:migrate

# 3. (Optional) Seed with sample data
npm run db:seed
```

### After Restarting WSL
```bash
# PostgreSQL doesn't auto-start in WSL, so start it manually
./scripts/start-postgres.sh
```

### Troubleshooting
```bash
# Check if everything is working
./scripts/check-postgres.sh
```

## Database Connection Details

After running `setup-postgres.sh`, your database will be configured with:

- **Host**: localhost
- **Port**: 5432
- **Database**: whats_on_my_plate
- **User**: user
- **Password**: password
- **Connection String**: `postgresql://user:password@localhost:5432/whats_on_my_plate`

## Common Issues

### "PostgreSQL is NOT running"
**Solution**: Run `./scripts/start-postgres.sh`

### "Cannot connect to database"
**Solution**:
1. Run `./scripts/check-postgres.sh` to diagnose the issue
2. Make sure PostgreSQL service is running
3. Verify your `.env` file has the correct connection string

### "Database does not exist"
**Solution**: Run `./scripts/setup-postgres.sh` again

### Need to start fresh?
**Solution**: Run `./scripts/reset-database.sh` then re-run migrations

## Notes

- PostgreSQL in WSL doesn't auto-start on boot. You'll need to run `./scripts/start-postgres.sh` after restarting your computer.
- All scripts require `sudo` for PostgreSQL management.
- The default password is "password" - change this in production!
