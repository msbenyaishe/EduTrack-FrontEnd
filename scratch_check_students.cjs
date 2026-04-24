const mysql = require('mysql2/promise');

async function checkStudents() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'edutrack_db'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT id, name, email, personal_image, portfolio_link FROM students WHERE email IN (?, ?)',
      ['mohamedsaidbenyaiche@gmail.com', 'said@gmail.com']
    );
    console.log('Students data:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

checkStudents();
