const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create mock user
  await prisma.user.upsert({
    where: { username: 'Manager1' },
    update: {},
    create: {
      username: 'Manager1',
      totalPoints: 1240,
      rank: 42
    }
  });

  // Seed Events
  const events = [
    { title: "Inter-College Cup Final", type: "FOOTBALL", date: "Oct 24, 2026 - 18:00", teams: "CS Dept vs MECH Dept", theme: "football", status: "UPCOMING" },
    { title: "Monaco Sim Racing", type: "F1 eSPORTS", date: "Oct 25, 2026 - 20:00", teams: "12 Drivers", theme: "f1", status: "PRACTICE" },
    { title: "TechNova Hackathon", type: "HACKATHON", date: "Live Now", teams: "24 Teams", theme: "hackathon", status: "LIVE" },
    { title: "T20 Campus Bash", type: "CRICKET", date: "Oct 26, 2026 - 15:00", teams: "Alumni vs Freshers", theme: "cricket", status: "UPCOMING" }
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }

  // Seed Players
  const players = [
    { name: 'Alex Hunter', role: 'Striker', cost: 15, theme: 'football', img: '⚽' },
    { name: 'Max Verstappen', role: 'Driver', cost: 25, theme: 'f1', img: '🏎️' },
    { name: 'Sarah Chen', role: 'Fullstack', cost: 10, theme: 'hackathon', img: '💻' },
    { name: 'David De Gea', role: 'Goalkeeper', cost: 12, theme: 'football', img: '🧤' },
    { name: 'Lewis Hamilton', role: 'Driver', cost: 24, theme: 'f1', img: '🏎️' },
    { name: 'Code Ninja', role: 'AI Dev', cost: 14, theme: 'hackathon', img: '🤖' },
    { name: 'Virat Kohli', role: 'Batsman', cost: 20, theme: 'cricket', img: '🏏' },
    { name: 'MS Dhoni', role: 'Wicketkeeper', cost: 18, theme: 'cricket', img: '🏏' },
  ];

  for (const player of players) {
    await prisma.player.create({ data: player });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
