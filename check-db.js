const Database = require('better-sqlite3');
const db = new Database('dev.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('dev.db tables:', tables);

try {
  const db2 = new Database('prisma/dev.db');
  const tables2 = db2.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('prisma/dev.db tables:', tables2);
} catch (e) {
  console.log('No prisma/dev.db');
}
