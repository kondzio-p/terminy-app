const { PrismaClient } = require('./src/generated/prisma');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
