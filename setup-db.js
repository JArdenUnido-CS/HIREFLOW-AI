import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function executeSqlFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // Split by semicolons but handle multi-line statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  for (const statement of statements) {
    try {
      // Use query() for statements like USE, CREATE DATABASE, CREATE TABLE
      // Use execute() for regular queries
      if (statement.toUpperCase().startsWith('USE ') || 
          statement.toUpperCase().startsWith('CREATE DATABASE') ||
          statement.toUpperCase().startsWith('DROP')) {
        await connection.query(statement);
      } else {
        await connection.execute(statement);
      }
    } catch (err) {
      if (!err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
        console.warn('⚠️ Statement warning:', err.message.substring(0, 100));
      }
    }
  }
}

async function setupDatabase() {
  let connection;
  try {
    console.log('Connecting to MySQL...');
    
    const pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });
    
    connection = await pool.getConnection();
    console.log('✓ Connected to MySQL');
    
    // Read and execute schema file
    console.log('Creating database and tables...');
    const schemaPath = path.join(__dirname, 'server/database/schema.sql');
    await executeSqlFile(connection, schemaPath);
    console.log('✓ Database schema created');
    
    // Read and execute seed file
    console.log('Seeding database...');
    const seedPath = path.join(__dirname, 'server/database/seed.sql');
    await executeSqlFile(connection, seedPath);
    console.log('✓ Database seeded with sample data');
    
    // Verify data
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM hireflow_ai.users');
    const [jobs] = await connection.execute('SELECT COUNT(*) as count FROM hireflow_ai.jobs');
    const [candidates] = await connection.execute('SELECT COUNT(*) as count FROM hireflow_ai.candidates');
    
    console.log('\n📊 Database Summary:');
    console.log(`  Users: ${users[0]?.count || 0}`);
    console.log(`  Jobs: ${jobs[0]?.count || 0}`);
    console.log(`  Candidates: ${candidates[0]?.count || 0}`);
    
    // Show user emails
    const [userList] = await connection.execute('SELECT email, role FROM hireflow_ai.users');
    console.log('\n👤 Users in database:');
    userList.forEach(user => {
      console.log(`  ${user.email} (${user.role})`);
    });
    
    connection.release();
    console.log('\n✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nMake sure MySQL is running:');
    console.error('  docker ps | grep mysql');
    console.error('\nIf not running, start it with:');
    console.error('  docker run -d --name hireflow-mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=true -p 3306:3306 mysql:8.0');
    process.exit(1);
  }
}

setupDatabase();
