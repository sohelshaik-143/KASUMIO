-- Migration V16: Add full_name and avatar_url to users table
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(1024) NULL;
