-- Update database schema to match exact specifications

-- Step 1: Add full_name to profiles and modify structure
ALTER TABLE public.profiles 
ADD COLUMN full_name TEXT;

-- Update existing profiles to have full_name based on first_name + last_name
UPDATE public.profiles 
SET full_name = CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))
WHERE full_name IS NULL;

-- Step 2: Update progress table structure
ALTER TABLE public.progress 
ADD COLUMN topic TEXT,
ADD COLUMN status TEXT DEFAULT 'pending';

-- Copy subject to topic
UPDATE public.progress SET topic = subject WHERE topic IS NULL;

-- Make topic NOT NULL after copying data
ALTER TABLE public.progress ALTER COLUMN topic SET NOT NULL;

-- Drop unnecessary columns
ALTER TABLE public.progress 
DROP COLUMN IF EXISTS subject,
DROP COLUMN IF EXISTS score,
DROP COLUMN IF EXISTS completion_date,
DROP COLUMN IF EXISTS notes,
DROP COLUMN IF EXISTS classroom_id,
DROP COLUMN IF EXISTS created_at;

-- Step 3: Recreate classrooms table with correct structure
DROP TABLE IF EXISTS public.classrooms CASCADE;

CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new classrooms table
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for classrooms
CREATE POLICY "Students can view their own classrooms" 
ON public.classrooms 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own classrooms" 
ON public.classrooms 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own classrooms" 
ON public.classrooms 
FOR UPDATE 
USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage all classrooms" 
ON public.classrooms 
FOR ALL 
USING (get_current_user_role() = 'teacher');

-- Update RLS policies for progress table
DROP POLICY IF EXISTS "Students can view only their own progress" ON public.progress;
DROP POLICY IF EXISTS "Students cannot modify progress records" ON public.progress;
DROP POLICY IF EXISTS "Students cannot update progress records" ON public.progress;
DROP POLICY IF EXISTS "Teachers can manage all progress records" ON public.progress;

CREATE POLICY "Students can view their own progress" 
ON public.progress 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own progress" 
ON public.progress 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own progress" 
ON public.progress 
FOR UPDATE 
USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage all progress" 
ON public.progress 
FOR ALL 
USING (get_current_user_role() = 'teacher');

-- Add trigger for updated_at on classrooms
CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add proper foreign key constraint for profiles.id -> auth.users.id
-- This ensures referential integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;