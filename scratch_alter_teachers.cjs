const mysql = require('../backend/node_modules/mysql2/promise');

async function alterTeachersTable() {
  const conn = await mysql.createConnection({
    host: 'mysql-msbenyaishe.alwaysdata.net',
    user: 'msbenyaishe_third',
    password: 'dB@Jbk9GBfnJUFP',
    database: 'msbenyaishe_edutrack'
  });
  
  try {
    console.log("Adding telegram_chat_id...");
    try {
      await conn.query("ALTER TABLE teachers ADD COLUMN telegram_chat_id VARCHAR(255) DEFAULT NULL;");
      console.log("telegram_chat_id added");
    } catch (e) { console.log("telegram_chat_id already exists or error:", e.message); }

    console.log("Adding telegram_notification_preferences...");
    try {
      await conn.query("ALTER TABLE teachers ADD COLUMN telegram_notification_preferences JSON DEFAULT NULL;");
      console.log("telegram_notification_preferences added");
    } catch (e) { console.log("telegram_notification_preferences already exists or error:", e.message); }

  } catch (err) {
    console.error("Error altering teachers table:", err);
  } finally {
    conn.end();
  }
}

alterTeachersTable();
