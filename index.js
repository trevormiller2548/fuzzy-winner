const mysql = require("mysql2/promise");
const inquirer = require("inquirer");
require("console.table");

// MySQL connection configuration
const connectionConfig = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Dogsandchickens@1991!",
    database: "staff_db", // Add this line to specify the database
  }

// Function to execute SQL queries
async function executeQuery(sql, values) {
  try {
    const connection = await mysql.createConnection(connectionConfig);
    const [rows] = await connection.execute(sql, values);
    connection.end();
    return rows;
  } catch (error) {
    throw error;
  }
}

// Function to display table data
function displayTable(data, headers) {
  console.table(headers, data);
}

// Function to view all employees
async function viewAllEmployees() {
  try {
    const employees = await executeQuery(`
      SELECT 
        e.id AS 'Employee ID', 
        e.first_name AS 'First Name', 
        e.last_name AS 'Last Name', 
        r.title AS 'Job Title', 
        d.name AS Department, 
        r.salary AS Salary,
        CONCAT(m.first_name, ' ', m.last_name) AS Manager
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN employees m ON e.manager_id = m.id
      ORDER BY e.id`);
    displayTable(employees, [
      'Employee ID',
      'First Name',
      'Last Name',
      'Job Title',
      'Department',
      'Salary',
      'Manager',
    ]);
  } catch (error) {
    console.error('Error viewing all employees:', error);
  }
}


// Function to add an employee
async function addEmployee() {
    try {
      const roles = await executeQuery("SELECT * FROM roles");
      const roleChoices = roles.map(({ id, title }) => ({
        value: id,
        name: title,
      }));
  
      const managers = await executeQuery("SELECT * FROM employees");
      const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        value: id,
        name: `${first_name} ${last_name}`,
      }));
  
      const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        {
          type: 'input',
          name: 'first_name',
          message: "Enter the employee's first name:",
        },
        {
          type: 'input',
          name: 'last_name',
          message: "Enter the employee's last name:",
        },
        {
          type: 'list',
          name: 'role_id',
          message: "Select the employee's roles:",
          choices: roleChoices,
        },
        {
          type: 'list',
          name: 'manager_id',
          message: "Select the employee's manager:",
          choices: [...managerChoices, { value: null, name: 'None' }],
        },
      ]);
  
      await executeQuery('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [first_name, last_name, role_id, manager_id]);
      console.log('Employee added successfully.');
    } catch (error) {
      console.error('Error adding an employee:', error);
        }
}

// Function to view all roles
async function viewAllRoles() {
  try {
    const roles = await executeQuery("SELECT * FROM roles");
    displayTable(roles, ['Roles ID', 'Title', 'Salary', 'Department ID']);
  } catch (error) {
    console.error('Error viewing all roles:', error);
  }
}

// Function to add a role
async function addRole() {
  try {
    const departments = await executeQuery("SELECT * FROM departments");
    const departmentChoices = departments.map(({ id, name }) => ({
      value: id,
      name,
    }));

    const { title, salary, department_id } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: "Enter the role's title:",
      },
      {
        type: 'input',
        name: 'salary',
        message: "Enter the role's salary:",
      },
      {
        type: 'list',
        name: 'department_id',
        message: "Select the role's department:",
        choices: departmentChoices,
      },
    ]);

    await executeQuery('INSERT INTO roles SET ?', {
      title,
      salary,
      department_id,
    });
    console.log('Role added successfully.');
  } catch (error) {
    console.error('Error adding a role:', error);
  }
}

// Function to view all departments
async function viewAllDepartments() {
  try {
    const departments = await executeQuery("SELECT * FROM departments");
    displayTable(departments, ['Department ID', 'Name']);
  } catch (error) {
    console.error('Error viewing all departments:', error);
  }
}

// Function to add a department
async function addDepartment() {
  try {
    const { departmentName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: "Enter the department name:",
      },
    ]);

    await executeQuery('INSERT INTO departments SET ?', {
      name: departmentName,
    });
    console.log('Department added successfully.');
  } catch (error) {
    console.error('Error adding a department:', error);
  }
}

// Function to view employees by manager
async function viewEmployeesByManager() {
    try {
      const managers = await executeQuery("SELECT * FROM employees");
      const managerChoices = managers.map(({ id, first_name, last_name }) => ({
        value: id,
        name: `${first_name} ${last_name}`,
      }));
  
      const { managerId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'managerId',
          message: 'Select the manager:',
          choices: managerChoices,
        },
      ]);
  
      const employees = await executeQuery(`
        SELECT 
          e.id AS 'Employee ID', 
          e.first_name AS 'First Name', 
          e.last_name AS 'Last Name', 
          r.title AS 'Job Title', 
          d.name AS Department, 
          r.salary AS Salary
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN departments d ON r.department_id = d.id
        WHERE e.manager_id = ?
        ORDER BY e.id`, [managerId]);
  
      if (employees.length === 0) {
        console.log('No employees found for this manager.');
      } else {
        displayTable(employees, [
          'Employee ID',
          'First Name',
          'Last Name',
          'Job Title',
          'Department',
          'Salary',
        ]);
      }
    } catch (error) {
      console.error('Error viewing employees by manager:', error);
    }
  }

// Function to view employees by department
async function viewEmployeesByDepartment() {
    try {
      const departments = await executeQuery("SELECT * FROM departments");
      const departmentChoices = departments.map(({ id, name }) => ({
        value: id,
        name,
      }));
  
      const { departmentId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'departmentId',
          message: 'Select the department:',
          choices: departmentChoices,
        },
      ]);
  
      const employees = await executeQuery(`
        SELECT 
          e.id AS 'Employee ID', 
          e.first_name AS 'First Name', 
          e.last_name AS 'Last Name', 
          r.title AS 'Job Title', 
          r.salary AS Salary,
          CONCAT(m.first_name, ' ', m.last_name) AS Manager
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN departments d ON r.department_id = d.id
        LEFT JOIN employees m ON e.manager_id = m.id
        WHERE d.id = ?
        ORDER BY e.id`, [departmentId]);
  
      if (employees.length === 0) {
        console.log('No employees found in this department.');
      } else {
        displayTable(employees, [
          'Employee ID',
          'First Name',
          'Last Name',
          'Job Title',
          'Salary',
          'Manager',
        ]);
      }
    } catch (error) {
      console.error('Error viewing employees by department:', error);
    }
  }
  

// Function to delete a department
async function deleteDepartment() {
  try {
    const departments = await executeQuery("SELECT * FROM departments");
    const departmentChoices = departments.map(({ id, name }) => ({
      value: id,
      name,
    }));

    const { departmentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the department to delete:',
        choices: departmentChoices,
      },
    ]);

    await executeQuery('DELETE FROM departments WHERE id = ?', [departmentId]);
    console.log('Department deleted successfully.');
  } catch (error) {
    console.error('Error deleting a department:', error);
  }
}

// Function to delete a role
async function deleteRole() {
  try {
    const roles = await executeQuery("SELECT * FROM roles");
    const roleChoices = roles.map(({ id, title }) => ({
      value: id,
      name: title,
    }));

    const { roleId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Select the role to delete:',
        choices: roleChoices,
      },
    ]);

    await executeQuery('DELETE FROM roles WHERE id = ?', [roleId]);
    console.log('Role deleted successfully.');
  } catch (error) {
    console.error('Error deleting a role:', error);
  }
}

// Function to delete an employee
async function deleteEmployee() {
  try {
    const employees = await executeQuery("SELECT * FROM employees");
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${first_name} ${last_name}`,
    }));

    const { employeeId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to delete:',
        choices: employeeChoices,
      },
    ]);

    await executeQuery('DELETE FROM employees WHERE id = ?', [employeeId]);
    console.log('Employee deleted successfully.');
  } catch (error) {
    console.error('Error deleting an employee:', error);
  }
}

// Function to prompt the user for actions
async function firstPrompt() {
  try {
    const { task } = await inquirer.prompt({
      type: 'list',
      name: 'task',
      message: 'What would you like to do?',
      choices: [
        'View all employees',
        'Add an employee',
        'View all roles',
        'Add a role',
        'View all departments',
        'Add a department',
        'Update employee managers',
        'View employees by manager',
        'View employees by department',
        'Delete a department',
        'Delete a role',
        'Delete an employee',
        'End',
      ],
    });

    switch (task) {
      case 'View all employees':
        await viewAllEmployees();
        break;
      case 'Add an employee':
        await addEmployee();
        break;
      case 'View all roles':
        await viewAllRoles();
        break;
      case 'Add a role':
        await addRole();
        break;
      case 'View all departments':
        await viewAllDepartments();
        break;
      case 'Add a department':
        await addDepartment();
        break;
      case 'Update employee managers':
        await updateEmployeeManagers();
        break;
      case 'View employees by manager':
        await viewEmployeesByManager();
        break;
      case 'View employees by department':
        await viewEmployeesByDepartment();
        break;
      case 'Delete a department':
        await deleteDepartment();
        break;
      case 'Delete a role':
        await deleteRole();
        break;
      case 'Delete an employee':
        await deleteEmployee();
        break;
      case 'End':
        process.exit(0);
        break;
      default:
        console.log('Invalid option. Please try again.');
        break;
    }

    firstPrompt();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function startApp() {
  try {
    const connection = await mysql.createConnection(connectionConfig);
    // Create the 'staff_db' database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS staff_db');
    await connection.query('USE staff_db');

    // Load and execute the schema.sql file
    const schemaSQL = require('fs').readFileSync('./schema.sql', 'utf8');
    const schemaQueries = schemaSQL.split(';');
    for (const query of schemaQueries) {
      if (query.trim()) {
        await connection.query(query);
      }
    }

    // Load and execute the seeds.sql file
    const seedsSQL = require('fs').readFileSync('./seeds.sql', 'utf8');
    const seedsQueries = seedsSQL.split(';');
    for (const query of seedsQueries) {
      if (query.trim()) {
        await connection.query(query);
      }
    }

    connection.end();
    console.log('Database setup and seed data inserted successfully.');

    // Start the application
    firstPrompt();
  } catch (error) {
    console.error('Error setting up the database:', error);
    process.exit(1);
  }
}

startApp();

