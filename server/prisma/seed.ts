import { PrismaClient, Category, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create some sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Complete project proposal',
      description: 'Finish the Q1 project proposal document',
      notes: 'Need to include budget estimates and timeline',
      category: Category.WORK,
      priority: Priority.HIGH,
      dueDate: new Date('2026-02-01'),
      subtasks: {
        create: [
          { title: 'Research market trends', order: 0 },
          { title: 'Draft budget section', order: 1 },
          { title: 'Review with team', order: 2 }
        ]
      }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Buy groceries',
      description: 'Weekly grocery shopping',
      category: Category.PERSONAL,
      priority: Priority.MEDIUM,
      dueDate: new Date('2026-01-25'),
      subtasks: {
        create: [
          { title: 'Milk and eggs', order: 0 },
          { title: 'Fresh vegetables', order: 1 },
          { title: 'Bread', order: 2 }
        ]
      }
    }
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Fix production bug',
      description: 'Login issue reported by users',
      notes: 'Check authentication middleware and session handling',
      category: Category.WORK,
      priority: Priority.URGENT,
      dueDate: new Date('2026-01-24')
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Plan vacation',
      description: 'Summer vacation planning',
      category: Category.PERSONAL,
      priority: Priority.LOW,
      completed: true,
      completedAt: new Date()
    }
  });

  console.log('Seed data created successfully!');
  console.log({ task1, task2, task3, task4 });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
