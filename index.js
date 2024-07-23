const inquirer = require("inquirer");
const { Client } = require("pg");
const cTable = require("console.table");

// Create a connection to the database
const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "0105",
  database: "employee_db",
});

client.connect((err) => {
  if (err) throw err;
  console.log("Connected to the employee_db database.");
  startApp();
});

// Function to start the application
const startApp = () => {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;
        case "Exit":
          client.end();
          break;
      }
    });
};

// Function to view all departments
const viewDepartments = () => {
  client.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    console.table(res.rows);
    startApp();
  });
};

// Function to view all roles
const viewRoles = () => {
  const query = `
    SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    LEFT JOIN department ON role.department_id = department.id
  `;
  client.query(query, (err, res) => {
    if (err) throw err;
    console.table(res.rows);
    startApp();
  });
};

// Function to view all employees
const viewEmployees = () => {
  const query = `
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
  `;
  client.query(query, (err, res) => {
    if (err) throw err;
    console.table(res.rows);
    startApp();
  });
};

// Function to add a department
const addDepartment = () => {
  inquirer
    .prompt({
      name: "name",
      type: "input",
      message: "Enter the name of the department:",
    })
    .then((answer) => {
      client.query(
        "INSERT INTO department (name) VALUES ($1)",
        [answer.name],
        (err, res) => {
          if (err) throw err;
          console.log("Department added successfully!");
          startApp();
        }
      );
    });
};

// Function to add a role
const addRole = () => {
  client.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    const departments = res.rows.map(({ id, name }) => ({ name, value: id }));

    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "Enter the title of the role:",
        },
        {
          name: "salary",
          type: "input",
          message: "Enter the salary of the role:",
        },
        {
          name: "department_id",
          type: "list",
          message: "Select the department for the role:",
          choices: departments,
        },
      ])
      .then((answers) => {
        client.query(
          "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
          [answers.title, answers.salary, answers.department_id],
          (err, res) => {
            if (err) throw err;
            console.log("Role added successfully!");
            startApp();
          }
        );
      });
  });
};

// Function to add an employee
const addEmployee = () => {
  client.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    const roles = res.rows.map(({ id, title }) => ({ name: title, value: id }));

    client.query("SELECT * FROM employee", (err, res) => {
      if (err) throw err;
      const managers = res.rows.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id,
      }));
      managers.push({ name: "None", value: null });

      inquirer
        .prompt([
          {
            name: "first_name",
            type: "input",
            message: "Enter the employee's first name:",
          },
          {
            name: "last_name",
            type: "input",
            message: "Enter the employee's last name:",
          },
          {
            name: "role_id",
            type: "list",
            message: "Select the employee's role:",
            choices: roles,
          },
          {
            name: "manager_id",
            type: "list",
            message: "Select the employee's manager:",
            choices: managers,
          },
        ])
        .then((answers) => {
          client.query(
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
            [
              answers.first_name,
              answers.last_name,
              answers.role_id,
              answers.manager_id,
            ],
            (err, res) => {
              if (err) throw err;
              console.log("Employee added successfully!");
              startApp();
            }
          );
        });
    });
  });
};

// Function to update an employee role
const updateEmployeeRole = () => {
  client.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    const employees = res.rows.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      value: id,
    }));

    client.query("SELECT * FROM role", (err, res) => {
      if (err) throw err;
      const roles = res.rows.map(({ id, title }) => ({
        name: title,
        value: id,
      }));

      inquirer
        .prompt([
          {
            name: "employee_id",
            type: "list",
            message: "Select the employee to update:",
            choices: employees,
          },
          {
            name: "role_id",
            type: "list",
            message: "Select the new role:",
            choices: roles,
          },
        ])
        .then((answers) => {
          client.query(
            "UPDATE employee SET role_id = $1 WHERE id = $2",
            [answers.role_id, answers.employee_id],
            (err, res) => {
              if (err) throw err;
              console.log("Employee role updated successfully!");
              startApp();
            }
          );
        });
    });
  });
};
