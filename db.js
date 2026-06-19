const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "placement_portal",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.log("MySQL not connected:", err.message);
    } else {
        console.log("MySQL Connected");
    }
});

module.exports = db;