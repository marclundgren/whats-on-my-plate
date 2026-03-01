# What's On My Plate

A simple, self-hosted task tracking application for managing work and personal tasks. Built with React, TypeScript, Node.js, Express, and PostgreSQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- **Task Management**: Create, edit, delete, and complete tasks
- **Categories**: Organize tasks into Work and Personal categories
- **Priority Levels**: Set priority (Low, Medium, High, Urgent) for each task
- **Due Dates**: Track deadlines with visual indicators for overdue tasks
- **Subtasks**: Break down tasks into smaller, manageable subtasks
- **Notes**: Add detailed notes to any task
- **Filtering**: Filter tasks by category and completion status
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Context API** for state management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM for database management
- **PostgreSQL** database
- **Zod** for request validation

## Prerequisites

- Node.js 20.x or higher (installed via nvm)
- PostgreSQL 15 or higher
- npm 10.x or higher

## Quick Start

### 1. Clone the Repository

```bash
cd /home/marc/Dev/self-hosted/whats-on-my-plate
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Set Up PostgreSQL

```bash
# Run the setup script (installs PostgreSQL, creates database)
./scripts/setup-postgres.sh
```

This script will:
- Install PostgreSQL (if not already installed)
- Start the PostgreSQL service
- Create a database named `whats_on_my_plate`
- Create a database user with appropriate permissions

### 4. Run Database Migrations

```bash
cd server
npm run db:migrate
```

When prompted for a migration name, enter: `init`

### 5. (Optional) Seed Sample Data

```bash
cd server
npm run db:seed
```

This creates 4 sample tasks with subtasks to help you explore the application.

### 6. Start the Application

```bash
# From the root directory
./scripts/start-dev.sh
```

Or manually:

```bash
# Terminal 1: Start PostgreSQL (if not running)
./scripts/start-postgres.sh

# Terminal 2: Start server and client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## Development Scripts

### Root Directory

```bash
npm run dev              # Start both client and server
npm run build            # Build both client and server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
```

### Server (cd server)

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed the database
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:generate      # Generate Prisma client
```

### Client (cd client)

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Database Management Scripts

All scripts are in the `scripts/` directory:

### PostgreSQL Scripts

```bash
./scripts/setup-postgres.sh          # Complete PostgreSQL setup
./scripts/start-postgres.sh          # Start PostgreSQL service
./scripts/stop-postgres.sh           # Stop PostgreSQL service
./scripts/check-postgres.sh          # Verify PostgreSQL status
./scripts/reset-database.sh          # Drop and recreate database (deletes all data!)
./scripts/fix-prisma-permissions.sh  # Grant CREATEDB permission for migrations
```

See `scripts/README.md` for detailed documentation.

## Project Structure

```
whats-on-my-plate/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   │   ├── layout/       # Header, Sidebar
│   │   │   ├── tasks/        # Task components
│   │   │   └── ui/           # Reusable UI components
│   │   ├── context/          # React Context for state
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   ├── app.ts            # Express app setup
│   │   └── index.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Database migrations
│   │   └── seed.ts           # Sample data
│   ├── package.json
│   └── tsconfig.json
│
├── scripts/                   # Utility scripts
│   ├── setup-postgres.sh     # PostgreSQL setup
│   ├── start-postgres.sh     # Start PostgreSQL
│   ├── start-dev.sh          # Start dev environment
│   └── README.md             # Scripts documentation
│
├── package.json               # Root package.json
├── docker-compose.yml         # Docker Compose config
└── README.md                  # This file
```

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks (supports filtering)
  - Query params: `category`, `completed`, `priority`, `sortBy`, `order`
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/complete` - Toggle task completion
- `DELETE /api/tasks/:id` - Delete task

### Subtasks

- `POST /api/tasks/:taskId/subtasks` - Create subtask
- `PUT /api/tasks/:taskId/subtasks/:subtaskId` - Update subtask
- `PATCH /api/tasks/:taskId/subtasks/:subtaskId/complete` - Toggle subtask completion
- `DELETE /api/tasks/:taskId/subtasks/:subtaskId` - Delete subtask

## Database Schema

### Task

- `id` - UUID primary key
- `title` - Task title (required)
- `description` - Brief description
- `notes` - Detailed notes
- `category` - WORK or PERSONAL
- `priority` - LOW, MEDIUM, HIGH, or URGENT
- `dueDate` - Optional due date
- `completed` - Completion status
- `completedAt` - Timestamp of completion
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Subtask

- `id` - UUID primary key
- `title` - Subtask title (required)
- `completed` - Completion status
- `completedAt` - Timestamp of completion
- `order` - Display order
- `taskId` - Foreign key to Task
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Environment Variables

### Server (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/whats_on_my_plate
CLIENT_URL=http://localhost:5173
```

### Client (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

## Common Issues & Troubleshooting

### PostgreSQL not starting

**Problem**: PostgreSQL service won't start after WSL restart

**Solution**:
```bash
./scripts/start-postgres.sh
```

PostgreSQL doesn't auto-start in WSL, so you'll need to start it manually after restarting your computer.

### Permission denied to create database

**Problem**: Prisma migration fails with permission error

**Solution**:
```bash
./scripts/fix-prisma-permissions.sh
cd server && npm run db:migrate
```

### Cannot connect to database

**Problem**: Application can't connect to PostgreSQL

**Solution**:
```bash
./scripts/check-postgres.sh
```

This will diagnose the issue and tell you what needs to be fixed.

### Node.js not found

**Problem**: `node: command not found`

**Solution**:
```bash
# Load nvm
source ~/.nvm/nvm.sh
# Verify node is available
node --version
```

Add this to your `~/.bashrc` or `~/.zshrc` to load nvm automatically:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## Usage Guide

### Creating a Task

1. Click the "+ Add Task" button in the header
2. Fill in the task details:
   - **Title** (required): Brief task name
   - **Description**: One-line summary
   - **Category**: Work or Personal
   - **Priority**: Low, Medium, High, or Urgent
   - **Due Date**: Optional deadline
   - **Notes**: Detailed information
3. Click "Create Task"

### Managing Tasks

- **Complete a task**: Click the checkbox next to the task
- **Edit a task**: Click the edit icon (pencil)
- **Delete a task**: Click the delete icon (trash)
- **Filter tasks**: Use the sidebar to filter by category

### Working with Subtasks

Subtasks are displayed below their parent task. You can:
- Check off completed subtasks
- View progress (e.g., "3/5 subtasks")
- Add new subtasks when creating or editing a task

## Production Deployment

### Building for Production

```bash
# Build both client and server
npm run build
```

### Deployment Options

1. **Traditional VPS/Server**
   - Build the application
   - Set up PostgreSQL
   - Run migrations
   - Serve the built client from a web server (nginx/Apache)
   - Run the server with PM2 or systemd

2. **Docker** (future enhancement)
   - Use the provided `docker-compose.yml` as a starting point
   - Add Dockerfiles for client and server
   - Deploy with Docker Compose

## Future Enhancements

- [ ] Recurring tasks
- [ ] Task tags/labels
- [ ] File attachments
- [ ] Task comments
- [ ] Activity log
- [ ] Export to CSV
- [ ] Mobile app
- [ ] Multi-user support
- [ ] Email/push notifications
- [ ] Dark mode
- [ ] Keyboard shortcuts

## Contributing

This is a personal project, but feel free to fork and customize it for your own use!

## License

MIT License - feel free to use this project however you'd like.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `scripts/README.md` for database-related issues
3. Check server logs: `cd server && npm run dev`
4. Check browser console for frontend errors

## Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
