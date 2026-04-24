const mysql = require('../backend/node_modules/mysql2/promise');

async function alterTeachersTable() {
  const conn = await mysql.createConnection({
    host: 'mysql-msbenyaishe.alwaysdata.net',
    user: 'msbenyaishe_third',
    password: 'dB@Jbk9GBfnJUFP',
    database: 'msbenyaishe_edutrack'
  });
  
  try {
    await conn.query("ALTER TABLE teachers ADD COLUMN personal_image VARCHAR(255) DEFAULT NULL;");
    console.log("Teachers table altered successfully");
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column already exists");
    } else {
      console.error("Error altering teachers table:", err);
    }
  } finally {
    conn.end();
  }
}

alterTeachersTable();
