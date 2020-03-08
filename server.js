const { prompt } = require('enquirer');
const mysql = require('mysql');
const figlet = require('figlet');
const debug = 0;
const port = 3306;

const connection = mysql.createConnection({
  host: 'localhost',
  port: port,
  user: 'root',
  password: 'cbr954rr',
  database: 'homework12',
});

const managers = [];
const depts = [];
const roles = [];
const users = [];

connection.connect((err) => {
  if (err) throw err;
});
debug && console.log("beginning");

main().then(function (result) {
    debug && console.log("end");
    quit();
  });


//////////////////////////////////////////////
//Main everything starts here
async function main() {
  console.log(figlet.textSync('Employee', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
  }));
  console.log(figlet.textSync('Tracker', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
  }));
  getInfo();
  let cont = 1;
  while (cont) {
    cont = await menu();
    debug && console.log("end of main");
  };
  return;
}
//////////////////////////////////////////////////////
//Main menu
async function menu() {
  const choices = await prompt([
    {
      type: 'select',
      message: 'What would you like to do?',
      name: 'whatToDo',
      choices: [

        'View all Employees',
        'View all Employess by Roles',
        'View all Employees by Department',
        'Add a Employee',
        'Add a Role',
        'Add a Department',
        'Update Employee Role',
        'Quit'
      ],
    },
  ]);
  debug && console.log(choices.whatToDo);
  switch (choices.whatToDo) {
    case 'View all Employees':
      console.table(await listEmployees());
      break;
    case 'View all Employess by Roles':
      console.table(await listRoles());
      break;
    case 'View all Employees by Department':
      console.table(await listDepartments());
      break;
    case 'Add a Employee':
      debug && console.log("add employ");
      await createEmployee();
      break;
    case 'Add a Role':
      debug && console.log("add role");
      await createRole();
      break;
    case 'Add a Department':
      await createDept();
      break;
    case 'Update Employee Role':
      await updateRole();
      break;
    default:
      return 0;
  }
  return 1;

}
/////////////////////////////////////////////////
//Start of update or creates. Each function has 
// a create section, and subsquent insert/update function.
/////////////////////////////////////////////////
async function updateRole() {
  await prompt([
    {
      type: 'select',
      message: 'What Employee role would you like to change: ',
      name: 'empId',
      choices: users,
    },
    {
      type: 'select',
      message: 'New Role for employee: ',
      name: 'roleId',
      choices: roles,
    },
  ]).then((a) => {
    changeRole(a.empId, a.roleId);
  });
}
/////////////////////////////////////////////////
function changeRole(empId, roleId) {
  connection.query(
    'UPDATE employee SET ? WHERE ?',[{role_id: roleId},{employee_id: empId}],
    (err, res) => {
      if (err) throw err;
      console.log(`${res.affectedRows} Employee role updated\n`);
    },
  );
}
/////////////////////////////////////////////////
async function createDept() {
  await prompt([
    {
      type: 'input',
      message: 'Enter new Department name: ',
      name: 'dept',
    }
  ]).then((a) => {
    insertDept(a.dept)
  })
}
/////////////////////////////////////////////////
function insertDept(dept) {
  connection.query(
    'INSERT INTO department set ?',
    {
      name: dept,
    },
    (err, res) => {
      if (err) throw err;
      debug && console.log(`${res.affectedRows} department named ${dept} created\n`);
      depts.push({ message: dept, value: res.insertId });
    },
  );

}
/////////////////////////////////////////////////
async function createRole() {
  await prompt([
    {
      type: 'input',
      message: 'Enter Title: ',
      name: 'title',
    },
    {
      type: 'input',
      message: 'Enter Salary: ',
      name: 'salary',
    },
    {
      type: 'select',
      message: 'Choose a Department: ',
      name: 'deptId',
      choices: depts,
    },
  ]).then((a) => {
    insertRole(a.title, a.salary, +a.deptId);
  });
  return;
}
////////////////////////////////////////////////
function insertRole(title, salary, deptId) {
  connection.query(
    'INSERT INTO role SET ?',
    {
      title: title,
      salary: salary,
      department_id: deptId,
    },
    (err, res) => {
      if (err) throw err;
      debug && console.log(`${res.affectedRows} Role named ${title} created\n`);
      roles.push({ message: title, value: res.insertId });
    },
  );

}
/////////////////////////////////////////////////
async function createEmployee() {
  debug && console.log("in createEmployee \n" + "\n");
  await prompt([
    {
      type: 'input',
      message: 'Enter First Name: ',
      name: 'first',
    },
    {
      type: 'input',
      message: 'Enter Last Name: ',
      name: 'last',
    },
    {
      type: 'select',
      message: 'Choose a Role: ',
      name: 'roleId',
      choices: roles,
    },
    {
      type: 'select',
      message: 'Choose a Manager: ',
      name: 'managerId',
      choices: managers,
    },
  ]).then((a) => {
    debug && console.log(`roleId: ${a.roleId} manager: ${a.managerId} \n`);
    insertEmployee(a.first, a.last, a.roleId, a.managerId);
  });
  return;
}
//////////////////////////////////////////////////////////////
function insertEmployee(first, last, roleId, managerId) {
  connection.query(
    'INSERT INTO employee SET ?',
    {
      first_name: first,
      last_name: last,
      role_id: roleId,
      manager_id: managerId,
    },
    (err, res) => {
      if (err) throw err;
      debug && console.log(`${res.affectedRows} Employee added\n`);
    },
  );
}
//////////////////////////////////////////////////////////////
//Starting here is just the list functions for various asks
//////////////////////////////////////////////////////////////
function listDepartments() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM department', (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}
////////////////////////////////////////////////////////
function listRoles() {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM role', (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}
////////////////////////////////////////////////////////
function listEmployees() {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT e.employee_id, e.first_name, e.last_name, role.title, department.name as department, role.salary, CONCAT(m.first_name, ' ', m.last_name) as manager
      FROM employee e
      left join employee m on e.manager_id = m.employee_id 
      left join role on e.role_id = role.role_id 
      left join department on role.department_id = department.department_id`,
      (err, res) => {
        if (err) reject(err);
        resolve(res);
      },
    );
  });
}
////////////////////////////////////////////////////////
//This is the initial population of all the data for viewing
////////////////////////////////////////////////////////
function getInfo() {
  connection.query("SELECT CONCAT(first_name, ' ', last_name) as name, employee_id FROM employee", (err, res) => {
    if (err) throw err;
    res.forEach((element) => {
      let a = { message: '', value: '' };
      a.message = element.name;
      a.value = element.employee_id.toString();
      users.push(a);
      managers.push(a);
    });
  });
  connection.query("SELECT title, role_id FROM role", (err, res) => {
    if (err) throw err;
    //roles.length = 0;
    res.forEach((element) => {
      let b = { message: '', value: '' };
      b.message = element.title;
      b.value = element.role_id.toString();
      debug && console.log(`roles: ${b.message} and ${b.value}`);
      roles.push(b);
    });
  });
  connection.query("SELECT name, department_id FROM department", (err, res) => {
    if (err) throw err;
    res.forEach((element) => {
      let c = { message: '', value: '' };
      c.message = element.name;
      c.value = element.department_id.toString();
      debug && console.log(`depts: ${c.message} and ${c.value}`);
      depts.push(c);
    });
  });
}
////////////////////////////////////////////////////////   
function quit() {
  connection.end();
  process.exit;
}
