-- Sample Data Seeding for AI Insights Testing
-- Run this script in your Supabase SQL editor to test the insights API

-- Insert sample clients
INSERT INTO clients (id, user_id, name, email, retainer_hours, created_at) VALUES
('client-1', 'user-123', 'Acme Corp', 'contact@acme.com', 40, NOW()),
('client-2', 'user-123', 'TechStart Inc', 'hello@techstart.com', 20, NOW()),
('client-3', 'user-123', 'Global Marketing', 'info@globalmarketing.com', 60, NOW());

-- Insert sample projects
INSERT INTO projects (id, user_id, client_id, name, deadline, estimated_hours, created_at) VALUES
('project-1', 'user-123', 'client-1', 'PPC Campaign Q1', NOW() + INTERVAL '5 days', 15, NOW()),
('project-2', 'user-123', 'client-2', 'SEO Optimization', NOW() + INTERVAL '12 days', 25, NOW()),
('project-3', 'user-123', 'client-3', 'Social Media Strategy', NOW() + INTERVAL '2 days', 10, NOW());

-- Insert sample time entries for productivity pattern testing
INSERT INTO time_entries (id, user_id, client_id, project_id, description, start_time, duration, hourly_rate, billable, channel, created_at) VALUES
-- Most productive hour: 9 AM
('te-1', 'user-123', 'client-1', 'project-1', 'PPC keyword research', '2024-01-15 09:00:00', 120, 150, true, 'PPC', NOW()),
('te-2', 'user-123', 'client-1', 'project-1', 'Ad copy creation', '2024-01-15 09:30:00', 90, 150, true, 'PPC', NOW()),
('te-3', 'user-123', 'client-2', 'project-2', 'SEO audit', '2024-01-16 09:00:00', 180, 150, true, 'SEO', NOW()),
('te-4', 'user-123', 'client-3', 'project-3', 'Content planning', '2024-01-17 09:00:00', 60, 150, true, 'Content', NOW()),

-- Other hours for comparison
('te-5', 'user-123', 'client-1', 'project-1', 'Performance review', '2024-01-15 14:00:00', 60, 150, true, 'PPC', NOW()),
('te-6', 'user-123', 'client-2', 'project-2', 'Link building', '2024-01-16 14:00:00', 90, 150, true, 'SEO', NOW()),
('te-7', 'user-123', 'client-3', 'project-3', 'Analytics review', '2024-01-17 14:00:00', 45, 150, true, 'Analytics', NOW()),

-- Channel efficiency testing (PPC should be most profitable)
('te-8', 'user-123', 'client-1', 'project-1', 'Campaign setup', '2024-01-18 10:00:00', 120, 200, true, 'PPC', NOW()),
('te-9', 'user-123', 'client-2', 'project-2', 'Technical SEO', '2024-01-18 11:00:00', 90, 150, true, 'SEO', NOW()),
('te-10', 'user-123', 'client-3', 'project-3', 'Social posting', '2024-01-18 12:00:00', 30, 100, true, 'Social', NOW()),

-- Retainer usage testing (Acme Corp should hit 75%+ threshold)
('te-11', 'user-123', 'client-1', 'project-1', 'A/B testing', '2024-01-19 09:00:00', 180, 150, true, 'PPC', NOW()),
('te-12', 'user-123', 'client-1', 'project-1', 'Reporting', '2024-01-19 10:00:00', 60, 150, true, 'PPC', NOW()),
('te-13', 'user-123', 'client-1', 'project-1', 'Optimization', '2024-01-19 11:00:00', 120, 150, true, 'PPC', NOW()),

-- Weekly summary testing
('te-14', 'user-123', 'client-2', 'project-2', 'Content creation', '2024-01-20 09:00:00', 120, 150, true, 'Content', NOW()),
('te-15', 'user-123', 'client-3', 'project-3', 'Strategy meeting', '2024-01-20 10:00:00', 60, 150, false, 'Admin', NOW()),
('te-16', 'user-123', 'client-1', 'project-1', 'Client call', '2024-01-20 11:00:00', 30, 150, true, 'PPC', NOW());

-- Update the clients table to include the user_id column if it doesn't exist
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update the projects table to include the user_id column if it doesn't exist  
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update the time_entries table to include the user_id column if it doesn't exist
-- ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Note: Replace 'user-123' with an actual user ID from your auth.users table
-- You can get this by running: SELECT id FROM auth.users LIMIT 1;
