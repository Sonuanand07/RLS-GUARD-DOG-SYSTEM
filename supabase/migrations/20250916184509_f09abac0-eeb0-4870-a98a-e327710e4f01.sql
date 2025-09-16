-- Add demo users with credentials and sample data
-- First, insert demo auth users (this will trigger profile creation via trigger)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'authenticated',
        'authenticated',
        'teacher@demo.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"role": "teacher", "first_name": "Jane", "last_name": "Smith"}',
        false,
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        'authenticated',
        'authenticated',
        'student1@demo.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"role": "student", "first_name": "John", "last_name": "Doe"}',
        false,
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        'authenticated',
        'authenticated',
        'student2@demo.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"role": "student", "first_name": "Alice", "last_name": "Johnson"}',
        false,
        '',
        '',
        '',
        ''
    );

-- Insert demo profiles (these should be created by trigger, but let's ensure they exist)
INSERT INTO public.profiles (id, email, first_name, last_name, role) 
VALUES 
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'teacher@demo.com', 'Jane', 'Smith', 'teacher'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'student1@demo.com', 'John', 'Doe', 'student'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'student2@demo.com', 'Alice', 'Johnson', 'student')
ON CONFLICT (id) DO NOTHING;

-- Insert demo classrooms
INSERT INTO public.classrooms (id, class_name, grade, student_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Mathematics 101', 'Grade 10', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Science Advanced', 'Grade 10', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'),
    ('550e8400-e29b-41d4-a716-446655440003', 'English Literature', 'Grade 11', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Physics Lab', 'Grade 11', 'f47ac10b-58cc-4372-a567-0e02b2c3d481');

-- Insert demo progress records
INSERT INTO public.progress (id, student_id, topic, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Algebra Fundamentals', 'completed'),
    ('660e8400-e29b-41d4-a716-446655440002', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Geometry Basics', 'in_progress'),
    ('660e8400-e29b-41d4-a716-446655440003', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Chemistry Lab Report', 'pending'),
    ('660e8400-e29b-41d4-a716-446655440004', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Shakespeare Analysis', 'completed'),
    ('660e8400-e29b-41d4-a716-446655440005', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Newton Laws Practice', 'in_progress'),
    ('660e8400-e29b-41d4-a716-446655440006', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Poetry Writing', 'pending');