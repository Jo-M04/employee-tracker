-- Create the database (run this command in your psql console if necessary)
-- CREATE DATABASE employee_db;

-- Connect to the database
\c employee_db

-- Create the tables
CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
  id SERIAL PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary NUMERIC(10, 2) NOT NULL,
  department_id INT REFERENCES department(id)
);

CREATE TABLE employee (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT REFERENCES role(id),
  manager_id INT REFERENCES employee(id)
);
