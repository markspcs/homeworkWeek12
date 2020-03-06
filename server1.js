const inquirer = require("inquirer");
const mysql = require('mysql');
const figlet = require('figlet');
const debug = 1;
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

main()
.then(function(result) {
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
  await menu();
  console.log("end of main");
//  promptNext();
  
  return;
}
//////////////////////////////////////////////////////
//Main menu
async function menu() {
  const choices = await inquirer.prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'whatToDo',
      choices: [
        'Quit',
        'View all Employees',
        'View Roles',
        'View Departments',
        'Add an Employee',
        'Add a Role',
        'Add a Department',
        'Update Employee Role',
        'Update Employee Manager',
        'Delete an Employee'
      ],
    },
  ]);
  debug && console.log(choices.whatToDo);
  switch (choices.whatToDo) {
    case 'View all Employees':
      //const employees = await showEmployees();
      console.table(await listEmployees());
      break;
    case 'View Roles':
      //const roles = await readRoles();
      console.table(await listRoles());
      break;
    case 'View Departments':
      //const depts = await readDepartments();
      console.table(await listDepartments());
      break;
    case 'Add an Employee':
      debug && console.log("add employ");
      await createEmployee();
      break;
    case 'Add a Role':
      debug && console.log("add role");
      await createRole();
      break;
    case 'Add a Department':
      //await addDepartment();
      break;
    case 'Update Employee Role':
      //await updateRole();
      break;
    case 'Update Employee Manager':
      //await updateManager();
      break;
    case 'Delete an Employee':
      //await deleteEmployee();
      break;
    default:
      quit();
      break;
  }
  console.log("ended");
  return;
  //return choices.whatToDo;
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
      choices: departments,
    },
  ]).then((a) => {
    createRole(a.title, a.salary, +a.deptId);
  });
}
////////////////////////////////////////////////
function insertRole(title, salary, deptId) {
  connection.query(
    'INSERT INTO role SET ?',
    {
      title: title,
      salary: salary,
      dept_id: deptId,
    },
    (err, res) => {
      if (err) throw err;
      console.log(`${res.affectedRows} Role created\n`);
    },
  );
}
/////////////////////////////////////////////////
async function createEmployee() {
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
    const roleID = +a.roleId;
    const managerID = (a.managerID === '0') ? null : +a.managerID;
    //make manager and role answers go directly to createEmployee
    insertEmployee(answers.first, answers.last, roleId, managerId);
  });
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
      "SELECT employee_id, first_name, last_name, title, name as department, salary, (SELECT CONCAT(first_name, ' ', last_name) FROM employee WHERE employee_id = employee.manager_id) AS manager " +
       "FROM employee left join role on employee.role_id = role.role_id left join department on role.department_id = department.department_id",
      (err, res) => {
        if (err) reject(err);
        resolve(res);
      },
    );
  });
}
////////////////////////////////////////////////////////
function getInfo() {
  // Run Query
  connection.query("SELECT CONCAT(first_name, ' ', last_name) as name, employee_id FROM employee", (err, res) => {
    if (err) throw err;
    //users.length = 0;
    //managers.length = 0;
    //managers.push({ message: 'None', value: '0' });
    res.forEach((element) => {
      let user = { name: '', id: '' };
      user.name = element.name;
      user.id = element.employee_id.toString();
      users.push(user);
      managers.push(user);
    });
  });
  connection.query("SELECT title, role_id FROM role", (err, res) => {
    if (err) throw err;
    //roles.length = 0;
    res.forEach((element) => {
      const user = { title: '', id: '' };
      user.title = element.title;
      user.roleId = element.role_id.toString();
      roles.push(user);
    });
  });
  connection.query("SELECT name, department_id FROM department", (err, res) => {
    if (err) throw err;
    //departments.length = 0;
    res.forEach((element) => {
      const user = { dept: '', id: '' };
      user.dept = element.dept_name;
      user.id = element.department_id.toString();
      depts.push(user);
    });
  });
}
////////////////////////////////////////////////////////   
function quit() {
    connection.end();
    process.exit;
  }
/////////////////////////////////////////////////
  function showEmployees() {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT a.id, first_name, last_name, title, salary, dept_name, (SELECT CONCAT(first_name, ' ', last_name) FROM tracker_db.employee WHERE id = a.manager_id) AS manager FROM tracker_db.employee a " +
        "left join tracker_db.role on role_id = tracker_db.role.id " +
        "left join tracker_db.department on tracker_db.role.dept_id = tracker_db.department.id",
        (err, res) => {
          if (err) reject(err);
          resolve(res);
        },
      );
    });
  }
  function createEmployee(first_name, last_name, role_id, manager_id) {
    connection.query(
      'INSERT INTO employee SET ?',
      {
        first_name: first_name,
        last_name: last_name,
        role_id: role_id,
        manager_id: manager_id,
      },
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} Employee inserted!\n`);
      },
    );
  }
  function createRole(title, salary, dept_id) {
    connection.query(
      'INSERT INTO role SET ?',
      {
        title: title,
        salary: salary,
        dept_id: dept_id,
      },
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} Role inserted!\n`);
      },
    );
  }
  function createDepartment(dept_name) {
    connection.query(
      'INSERT INTO department SET ?',
      {
        dept_name: dept_name,
      },
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} Department inserted!\n`);
      },
    );
  }
  function updateEmployeeRole(id, role_id) {
    connection.query(
      'UPDATE employee SET ? WHERE ?',
      [
        {
          role_id: role_id,
        },
        {
          id: id,
        },
      ],
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} Employee role updated!\n`);
      },
    );
  }
  function updateEmployeeManager(id, manager_id) {
    connection.query(
      'UPDATE employee SET ? WHERE ?',
      [
        {
          manager_id: manager_id,
        },
        {
          id: id,
        },
      ],
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} Employee manager updated!\n`);
      },
    );
  }
  function removeEmployee(id) {
    connection.query(
      'DELETE FROM employee WHERE ?',
      {
        id: id,
      },
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} Employee deleted!\n`);
      },
    );
  }
  function readRoles() {
    return new Promise((resolve, reject) => {
      // Run Query
      connection.query('SELECT * FROM role', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  }
  function readDepartments() {
    return new Promise((resolve, reject) => {
      // Run Query
      connection.query('SELECT * FROM department', (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    });
  }
  function getUsers() {
    // Run Query
    connection.query("SELECT CONCAT(first_name, ' ', last_name) as name, id as value FROM employee", (err, res) => {
      if (err) throw err;
      users.length = 0;
      managers.length = 0;
      managers.push({ message: 'None', value: '0' });
      res.forEach((element) => {
        const user = { message: '', value: '' };
        user.message = element.name;
        user.value = element.value.toString();
        users.push(user);
        managers.push(user);
      });
    });
  }
  function getRoles() {
    // Run Query
    connection.query("SELECT title as name, id as value FROM role", (err, res) => {
      if (err) throw err;
      roles.length = 0;
      res.forEach((element) => {
        const user = { message: '', value: '' };
        user.message = element.name;
        user.value = element.value.toString();
        roles.push(user);
      });
    });
  }
  function getDepartments() {
    // Run Query
    connection.query("SELECT dept_name as name, id as value FROM department", (err, res) => {
      if (err) throw err;
      departments.length = 0;
      res.forEach((element) => {
        const user = { message: '', value: '' };
        user.message = element.name;
        user.value = element.value.toString();
        departments.push(user);
      });
    });
  }


  async function addRole() {
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
        name: 'deptID',
        choices: departments,
      },
    ]).then((answers) => {
      createRole(answers.title, answers.salary, +answers.deptID);
    });
  }
  async function addDepartment() {
    await prompt([
      {
        type: 'input',
        message: 'Department Name: ',
        name: 'deptName',
      },
    ]).then((answers) => {
      createDepartment(answers.deptName);
    });
  }
  async function updateRole() {
    await prompt([
      {
        type: 'select',
        message: 'Which Employee: ',
        name: 'emplID',
        choices: users,
      },
      {
        type: 'select',
        message: 'Choose a Role: ',
        name: 'roleID',
        choices: roles,
      },
    ]).then((answers) => {
      updateEmployeeRole(answers.emplID, answers.roleID);
    });
  }
  async function updateManager() {
    await prompt([
      {
        type: 'select',
        message: 'Which Employee: ',
        name: 'emplID',
        choices: users,
      },
      {
        type: 'select',
        message: 'Choose Manager: ',
        name: 'managerID',
        choices: managers,
      },
    ]).then((answers) => {
      updateEmployeeManager(answers.emplID, answers.managerID);
    });
  }
  async function deleteEmployee() {
    await prompt([
      {
        type: 'select',
        message: 'Which Employee: ',
        name: 'emplID',
        choices: users,
      },
    ]).then((answers) => {
      removeEmployee(answers.emplID);
    });
  }
  async function promptNext() {
    const next = await mainMenu();
    switch (next) {
      case 'View all Employees':
        const employees = await showEmployees();
        console.table(employees);
        break;
      case 'View Roles':
        const roles = await readRoles();
        console.table(roles);
        break;
      case 'View Departments':
        const depts = await readDepartments();
        console.table(depts);
        break;
      case 'Add an Employee':
        await addEmployee();
        break;
      case 'Add a Role':
        await addRole();
        break;
      case 'Add a Department':
        await addDepartment();
        break;
      case 'Update Employee Role':
        await updateRole();
        break;
      case 'Update Employee Manager':
        await updateManager();
        break;
      case 'Delete an Employee':
        await deleteEmployee();
        break;
      default:
        quit();
        break;
    }
    promptNext();
  }

 