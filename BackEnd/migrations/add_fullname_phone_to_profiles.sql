-- Add fullName and phone columns to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
-- Add phone column to students table if it doesn't exist
ALTER TABLE students
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
-- Add phone column to employees table if it doesn't exist
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teachers_full_name ON teachers(full_name);
CREATE INDEX IF NOT EXISTS idx_teachers_phone ON teachers(phone);
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_employees_phone ON employees(phone);
-- Display success message
SELECT 'Migration completed: fullName and phone columns added to all profile tables' AS status;