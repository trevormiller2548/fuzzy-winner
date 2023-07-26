USE staff_db;

INSERT INTO departments (name)
VALUES 
  ("Product Management"),
  ("Engineering"),
  ("Quality Assurance"),
  ("Project Management");

INSERT INTO roles (title, salary, department_id)
VALUES 
  ("Product Manager", 140000, 1),
  ("Director, Product Management", 200000, 1),
  ("Lead Engineer", 150000, 2),
  ("Software Engineer", 120000, 2),
  ("QA Manager", 140000, 3),
  ("Project Manager", 110000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
  ("Eliza", "Miller", 2, null),
  ("Tammy", "Smith", 4, 3),
  ("George", "Johnson", 3, null),
  ("Shawn", "Betts", 5, null),
  ("Mark", "Olson", 6, null),
  ("Sally", "Loyd", 3, null),
  ("Amy", "Miller", 4, 6),
  ("John", "Burton", 1, 1);

