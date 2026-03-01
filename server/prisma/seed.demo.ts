import { PrismaClient, Category, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.link.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();

  console.log('Seeding demo data...');

  // ── WORK tasks ──────────────────────────────────────────────────────────

  await prisma.task.create({
    data: {
      title: 'Launch v2.0 of the dashboard',
      description: 'Ship the redesigned analytics dashboard to production',
      notes: 'Blocked on final QA sign-off from design. Staging looks good.',
      category: Category.WORK,
      priority: Priority.URGENT,
      dueDate: new Date('2026-03-05'),
      subtasks: {
        create: [
          { title: 'Finalize feature list with PM', order: 0, completed: true, completedAt: new Date() },
          { title: 'Fix regression in bar charts', order: 1, completed: true, completedAt: new Date() },
          { title: 'Write release notes', order: 2 },
          { title: 'Deploy to staging', order: 3 },
          { title: 'Get sign-off from design', order: 4 },
        ],
      },
      links: {
        create: [
          { title: 'Linear project board', url: 'https://linear.app' },
          { title: 'Figma designs', url: 'https://figma.com' },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Onboard new backend engineer',
      description: 'Get Alex up to speed on the codebase and team workflows',
      category: Category.WORK,
      priority: Priority.HIGH,
      dueDate: new Date('2026-03-07'),
      subtasks: {
        create: [
          { title: 'Provision GitHub + AWS access', order: 0, completed: true, completedAt: new Date() },
          { title: 'Schedule intro calls with team', order: 1, completed: true, completedAt: new Date() },
          { title: 'Share architecture overview doc', order: 2 },
          { title: 'Pair on first ticket', order: 3 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Write Q1 engineering retrospective',
      description: 'Document wins, misses, and process improvements for Q1',
      notes: 'Use last quarter\'s retro as a template. Get input from the team async before the meeting.',
      category: Category.WORK,
      priority: Priority.HIGH,
      dueDate: new Date('2026-03-14'),
      links: {
        create: [
          { title: 'Q4 retro doc (template)', url: 'https://notion.so' },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Update public API documentation',
      description: 'Reflect the new endpoints added in the v1.8 release',
      category: Category.WORK,
      priority: Priority.MEDIUM,
      dueDate: new Date('2026-03-20'),
      subtasks: {
        create: [
          { title: 'Audit existing docs for stale content', order: 0 },
          { title: 'Document /v2/reports endpoints', order: 1 },
          { title: 'Add code examples for auth flow', order: 2 },
        ],
      },
      links: {
        create: [
          { title: 'Docs site', url: 'https://readme.com' },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Refactor authentication middleware',
      description: 'Consolidate the three separate auth middlewares into one',
      category: Category.WORK,
      priority: Priority.MEDIUM,
      completed: true,
      completedAt: new Date('2026-02-21'),
    },
  });

  await prisma.task.create({
    data: {
      title: 'Set up error monitoring in production',
      description: 'Integrate Sentry (or similar) so we stop finding out about bugs from users',
      category: Category.WORK,
      priority: Priority.MEDIUM,
      dueDate: new Date('2026-03-28'),
      subtasks: {
        create: [
          { title: 'Evaluate Sentry vs Datadog', order: 0 },
          { title: 'Instrument the API server', order: 1 },
          { title: 'Set up alert routing in Slack', order: 2 },
        ],
      },
    },
  });

  // ── PERSONAL tasks ───────────────────────────────────────────────────────

  await prisma.task.create({
    data: {
      title: 'Set up home server',
      description: 'Repurpose the old Mac Mini as a self-hosted media and backup server',
      notes: 'Already have Ubuntu ISO downloaded. Look into Tailscale for remote access.',
      category: Category.PERSONAL,
      priority: Priority.HIGH,
      dueDate: new Date('2026-03-09'),
      subtasks: {
        create: [
          { title: 'Install Ubuntu Server 24.04', order: 0, completed: true, completedAt: new Date() },
          { title: 'Configure nginx reverse proxy', order: 1 },
          { title: 'Set up automated backups to B2', order: 2 },
          { title: 'Enable Tailscale for remote access', order: 3 },
        ],
      },
      links: {
        create: [
          { title: 'Tailscale docs', url: 'https://tailscale.com/kb' },
          { title: 'Self-Hosted subreddit', url: 'https://reddit.com/r/selfhosted' },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Learn Rust — finish "The Book"',
      description: 'Work through the official Rust book, at least chapters 1–15',
      category: Category.PERSONAL,
      priority: Priority.MEDIUM,
      dueDate: new Date('2026-04-01'),
      subtasks: {
        create: [
          { title: 'Ch 1–4: Ownership basics', order: 0, completed: true, completedAt: new Date() },
          { title: 'Ch 5–8: Structs, enums, collections', order: 1, completed: true, completedAt: new Date() },
          { title: 'Ch 9–11: Error handling & testing', order: 2 },
          { title: 'Ch 12–15: Closures, iterators, smart pointers', order: 3 },
        ],
      },
      links: {
        create: [
          { title: 'The Rust Book', url: 'https://doc.rust-lang.org/book/' },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Plan spring hiking trip',
      description: 'Weekend trip to the Cascades — figure out trail, gear, and logistics',
      category: Category.PERSONAL,
      priority: Priority.LOW,
      dueDate: new Date('2026-04-15'),
      subtasks: {
        create: [
          { title: 'Pick a trail and check permit requirements', order: 0 },
          { title: 'Check weather window', order: 1 },
          { title: 'Confirm who\'s coming', order: 2 },
          { title: 'Audit gear — replace worn boot laces', order: 3 },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Read "A Philosophy of Software Design"',
      description: 'John Ousterhout\'s book on managing complexity in software systems',
      category: Category.PERSONAL,
      priority: Priority.LOW,
      links: {
        create: [
          { title: 'Book on Goodreads', url: 'https://goodreads.com' },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Cancel unused subscriptions',
      description: 'Audit recurring charges and cut anything not being used',
      category: Category.PERSONAL,
      priority: Priority.MEDIUM,
      completed: true,
      completedAt: new Date('2026-02-18'),
    },
  });

  console.log('Demo data loaded successfully!');
}

main()
  .catch((e) => {
    console.error('Error loading demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
