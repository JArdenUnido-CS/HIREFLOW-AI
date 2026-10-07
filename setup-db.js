const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  try {
    console.log('🔄 Connecting to MySQL...');
    
    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      multipleStatements: true,
    });

    console.log('✓ Connected to MySQL');

    // Drop and recreate database
    console.log('🔄 Setting up database...');
    await connection.query('DROP DATABASE IF EXISTS hireflow_ai');
    await connection.query('CREATE DATABASE IF NOT EXISTS hireflow_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✓ Database created');

    // Close and reconnect to the new database
    await connection.end();

    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'hireflow_ai',
      multipleStatements: true,
    });

    // Read schema file
    const schemaPath = path.join(__dirname, 'server', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔄 Creating tables...');
    try {
      await connection.query(schemaSQL);
      console.log('✓ Tables created');
    } catch (e) {
      console.error('Error creating tables:', e.message);
    }

    // Read seed file
    const seedPath = path.join(__dirname, 'server', 'database', 'seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('🔄 Inserting seed data...');
    try {
      await connection.query(seedSQL);
      console.log('✓ Seed data inserted');
    } catch (e) {
      console.error('Error inserting seed:', e.message);
    }

    // Verify tables
    console.log('🔄 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✓ Tables in database:', tables.length);
    for (const table of tables) {
      const tableName = table[Object.keys(table)[0]];
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  - ${tableName}: ${rows[0].count} records`);
    }

    console.log('\n✅ Database setup complete!');
    console.log('Ready to start the application.\n');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
