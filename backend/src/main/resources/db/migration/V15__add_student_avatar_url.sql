-- Migration V15: Add avatar_url to students table
ALTER TABLE students ADD COLUMN avatar_url VARCHAR(1024) NULL;
