-- AI Learning Assistant — Database Schema + Seed Data
-- Run this on a fresh MySQL server to set up the project on a new machine:
--   mysql -u root < schema.sql

CREATE DATABASE IF NOT EXISTS ai_learning_assistant;
USE ai_learning_assistant;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    course VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50),
    description TEXT
);

CREATE TABLE IF NOT EXISTS lectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS lecture_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    lecture_id INT NOT NULL,
    completed TINYINT DEFAULT 0,
    watched_percentage INT DEFAULT 0,
    last_watched DATETIME,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (lecture_id) REFERENCES lectures(id)
);

CREATE TABLE IF NOT EXISTS quiz (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_answer VARCHAR(1),
    FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    quiz_id INT NOT NULL,
    marks INT,
    percentage INT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quiz(id)
);

CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    certificate_file VARCHAR(500),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Seed data: matches the 5 courses offered on the registration form
-- (Artificial Intelligence, Machine Learning, Web Development, Cloud Computing,
-- Cyber Security), plus a Python Basics course used for early testing.

INSERT INTO courses (course_name, course_code, description) VALUES
('Python Basics', 'PY101', 'An introduction to Python programming covering syntax, data types, and control flow.'),
('Artificial Intelligence', 'AI101', 'Foundations of artificial intelligence, including search, knowledge representation, and machine learning basics.'),
('Machine Learning', 'ML101', 'Core machine learning concepts including supervised learning, model evaluation, and practical algorithms.'),
('Web Development', 'WD101', 'Building modern web applications with HTML, CSS, JavaScript, and backend frameworks.'),
('Cloud Computing', 'CC101', 'Introduction to cloud infrastructure, services, and deployment models.'),
('Cyber Security', 'CS101', 'Principles of cyber security, threat detection, and secure system design.');

INSERT INTO lectures (course_id, title, description, video_url)
SELECT id, CONCAT('Introduction to ', course_name), CONCAT('An introductory overview of ', course_name, '.'), 'https://www.youtube.com/watch?v=rfscVS0vtbw'
FROM courses;

INSERT INTO lectures (course_id, title, description, video_url)
SELECT id, CONCAT('Core Concepts in ', course_name), CONCAT('A deeper look at the core concepts of ', course_name, '.'), 'https://www.youtube.com/watch?v=cQT33yu9pY8'
FROM courses;

INSERT INTO quiz (course_id, title)
SELECT id, CONCAT(course_name, ' Quiz')
FROM courses;

INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
SELECT q.id, CONCAT('Which of these best describes ', c.course_name, '?'), 'An unrelated field', CONCAT('A field involving ', c.course_name), 'A cooking technique', 'A sports strategy', 'B'
FROM quiz q JOIN courses c ON q.course_id = c.id;

INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
SELECT q.id, 'What is the best way to learn a new technical subject?', 'Avoid practice', 'Consistent study and hands-on practice', 'Never ask questions', 'Skip the fundamentals', 'B'
FROM quiz q JOIN courses c ON q.course_id = c.id;
