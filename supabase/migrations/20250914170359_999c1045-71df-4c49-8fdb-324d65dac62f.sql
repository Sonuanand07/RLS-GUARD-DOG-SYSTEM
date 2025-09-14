-- Fix database schema by properly handling dependencies

-- Step 1: Drop dependent policies first
DROP POLICY IF EXISTS "Students can view classrooms they are enrolled in" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can manage their own classrooms" ON public.classrooms;

-- Step 2: Drop the classrooms table completely
DROP TABLE IF EXISTS public.classrooms CASCADE;

-- Step 3: Update progress table structure
ALTER TABLE public.progress 
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Copy subject to topic if needed
UPDATE public.progress SET topic = COALESCE(subject, 'General') WHERE topic IS NULL;

-- Make topic NOT NULL
ALTER TABLE public.progress ALTER COLUMN topic SET NOT NULL;

-- Drop columns we don't need (cascade to handle dependencies)
ALTER TABLE public.progress 
DROP COLUMN IF EXISTS subject CASCADE,
DROP COLUMN IF EXISTS score CASCADE,
DROP COLUMN IF EXISTS completion_date CASCADE,
DROP COLUMN IF EXISTS notes CASCADE,
DROP COLUMN IF EXISTS classroom_id CASCADE,
DROP COLUMN IF EXISTS created_at CASCADE;

-- Step 4: Add full_name to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update existing profiles to have full_name
UPDATE public.profiles 
SET full_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE full_name IS NULL OR full_name = '';

-- Step 5: Create new classrooms table with correct structure
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on classrooms
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for classrooms
CREATE POLICY "Students can view own classrooms" 
ON public.classrooms 
FOR SELECT 
USING (student_id = auth.uid() OR get_current_user_role() = 'teacher');

CREATE POLICY "Students can insert own classrooms" 
ON public.classrooms 
FOR INSERT 
WITH CHECK (student_id = auth.uid() OR get_current_user_role() = 'teacher');

CREATE POLICY "Students can update own classrooms" 
ON public.classrooms 
FOR UPDATE 
USING (student_id = auth.uid() OR get_current_user_role() = 'teacher');

CREATE POLICY "Teachers can delete classrooms" 
ON public.classrooms 
FOR DELETE 
USING (get_current_user_role() = 'teacher');

-- Update RLS policies for progress table
DROP POLICY IF EXISTS "Students can view only their own progress" ON public.progress;
DROP POLICY IF EXISTS "Students cannot modify progress records" ON public.progress;
DROP POLICY IF EXISTS "Students cannot update progress records" ON public.progress;
DROP POLICY IF EXISTS "Teachers can manage all progress records" ON public.progress;

CREATE POLICY "Students can view own progress" 
ON public.progress 
FOR SELECT 
USING (student_id = auth.uid() OR get_current_user_role() = 'teacher');

CREATE POLICY "Students can insert own progress" 
ON public.progress 
FOR INSERT 
WITH CHECK (student_id = auth.uid() OR get_current_user_role() = 'teacher');

CREATE POLICY "Students can update own progress" 
ON public.progress 
FOR UPDATE 
USING (student_id = auth.uid() OR get_current_user_role() = 'teacher');

CREATE POLICY "Teachers can delete progress" 
ON public.progress 
FOR DELETE 
USING (get_current_user_role() = 'teacher');

-- Add updated_at trigger for classrooms
CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();