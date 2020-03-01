const inquirer = require("inquirer");
const mysql = require('mysql');
const port = 3306;

const connection = mysql.createConnection({
    host: 'localhost',
    port: port,
    user: 'root',
    password: 'cbr954rr',
    database: 'homework12',
  });

  connection.connect((err) => {
    if (err) throw err;
  });
  console.log("beginning");

  connection.end();