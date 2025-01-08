/*
  # Initial Schema for Employee Portal

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `role` (text)
      - `department` (text)
      - `created_at` (timestamp)
    
    - `leave_requests`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `start_date` (date)
      - `end_date` (date)
      - `type` (text)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `forum_posts`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `forum_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references forum_posts)
      - `employee_id` (uuid, references employees)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Employees table
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own employee record"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Leave requests table
CREATE TABLE leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- Forum posts table
CREATE TABLE forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all forum posts"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create forum posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));

-- Forum comments table
CREATE TABLE forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts NOT NULL,
  employee_id uuid REFERENCES employees NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all forum comments"
  ON forum_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create forum comments"
  ON forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));