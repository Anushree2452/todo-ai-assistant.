INSERT INTO `users` (`name`, `email`, `password_hash`, `role`) VALUES
('Admin User', 'admin@todoapp.com', '$2b$12$ev44ucO/m3dZNA8LnWEWQev/Mhc1P15lQqGgUHz/dmPP3CiebvTR6', 'Admin'),
('Standard User', 'user@todoapp.com', '$2b$12$xYOvx4MrxrIKDa0dUKA56.qvmYQ8uuaiCkiRGkUuVnO/UpVVt2Z0K', 'User');

INSERT INTO `categories` (`user_id`, `name`)
SELECT `id`, 'Work' FROM `users` WHERE `email` = 'user@todoapp.com';

INSERT INTO `tasks` (`user_id`, `category_id`, `title`, `description`, `status`, `priority`, `due_date`)
SELECT u.`id`, c.`id`, 'Set up project repository', 'Initialize repo and configure CI/CD pipeline', 'Pending', 'high', '2026-11-25'
FROM `users` u JOIN `categories` c ON c.`user_id` = u.`id` WHERE u.`email` = 'user@todoapp.com';

INSERT INTO `tasks` (`user_id`, `category_id`, `title`, `description`, `status`, `priority`, `due_date`)
SELECT u.`id`, c.`id`, 'Design wireframes', 'Create Figma mockups for task board', 'Pending', 'medium', '2026-11-28'
FROM `users` u JOIN `categories` c ON c.`user_id` = u.`id` WHERE u.`email` = 'user@todoapp.com';

INSERT INTO `tasks` (`user_id`, `category_id`, `title`, `description`, `status`, `priority`, `due_date`)
SELECT u.`id`, c.`id`, 'Implement database schema', 'Create migration and models for MySQL', 'InProgress', 'high', '2026-11-22'
FROM `users` u JOIN `categories` c ON c.`user_id` = u.`id` WHERE u.`email` = 'user@todoapp.com';

INSERT INTO `tasks` (`user_id`, `category_id`, `title`, `description`, `status`, `priority`, `due_date`)
SELECT u.`id`, c.`id`, 'Install dependencies', 'Set up Python virtual environment and packages', 'Completed', 'low', '2026-11-18'
FROM `users` u JOIN `categories` c ON c.`user_id` = u.`id` WHERE u.`email` = 'user@todoapp.com';
