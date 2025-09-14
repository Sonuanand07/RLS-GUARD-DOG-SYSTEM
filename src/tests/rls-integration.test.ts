import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Integration tests for RLS policies
describe('RLS Guard Dog Integration Tests', () => {
  const supabaseUrl = 'https://qitjnuytjdchfwyegdlh.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdGpudXl0amRjaGZ3eWVnZGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzMzMDksImV4cCI6MjA3MzEwOTMwOX0.idJcjoIdWXowGWsYWbwNX_2M8a2NxfSiLSQmE0Vi4IE';

  let studentClient: ReturnType<typeof createClient<Database>>;
  let teacherClient: ReturnType<typeof createClient<Database>>;
  let student1Id: string;
  let student2Id: string;
  let teacherId: string;

  beforeAll(async () => {
    // Create separate clients for different user roles
    studentClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
    teacherClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // Create test users
    const studentEmail1 = `student1-${Date.now()}@test.com`;
    const studentEmail2 = `student2-${Date.now()}@test.com`;
    const teacherEmail = `teacher-${Date.now()}@test.com`;
    const password = 'testpassword123';

    // Sign up student 1
    const { data: student1Auth, error: student1Error } = await studentClient.auth.signUp({
      email: studentEmail1,
      password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Student1',
          role: 'student'
        }
      }
    });

    if (student1Error) throw student1Error;
    student1Id = student1Auth.user!.id;

    // Sign up student 2 (for testing isolation)
    const student2Client = createClient<Database>(supabaseUrl, supabaseAnonKey);
    const { data: student2Auth, error: student2Error } = await student2Client.auth.signUp({
      email: studentEmail2,
      password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Student2',
          role: 'student'
        }
      }
    });

    if (student2Error) throw student2Error;
    student2Id = student2Auth.user!.id;

    // Sign up teacher
    const { data: teacherAuth, error: teacherError } = await teacherClient.auth.signUp({
      email: teacherEmail,
      password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'Teacher',
          role: 'teacher'
        }
      }
    });

    if (teacherError) throw teacherError;
    teacherId = teacherAuth.user!.id;

    // Wait for profile creation (handled by trigger)
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    // Clean up test data
    await teacherClient.auth.signOut();
    await studentClient.auth.signOut();
  });

  describe('Student RLS Policies', () => {
    test('Students can only view their own progress records', async () => {
      // Sign in as student 1
      await studentClient.auth.signInWithPassword({
        email: `student1-${Date.now()}@test.com`,
        password: 'testpassword123'
      });

      // Create progress record for student 1
      const { data: insertData, error: insertError } = await studentClient
        .from('progress')
        .insert({
          topic: 'Math Basics',
          status: 'pending',
          student_id: student1Id
        });

      expect(insertError).toBeNull();

      // Student 1 should be able to view their own progress
      const { data: ownProgress, error: ownError } = await studentClient
        .from('progress')
        .select('*')
        .eq('student_id', student1Id);

      expect(ownError).toBeNull();
      expect(ownProgress).toHaveLength(1);
      expect(ownProgress![0].topic).toBe('Math Basics');

      // Student 1 should NOT be able to view other students' progress
      const { data: otherProgress, error: otherError } = await studentClient
        .from('progress')
        .select('*')
        .eq('student_id', student2Id);

      expect(otherProgress).toHaveLength(0); // RLS blocks access
    });

    test('Students can only update their own progress records', async () => {
      // Create a progress record for student 2 using teacher account
      await teacherClient.auth.signInWithPassword({
        email: `teacher-${Date.now()}@test.com`,
        password: 'testpassword123'
      });

      const { data: teacherInsert } = await teacherClient
        .from('progress')
        .insert({
          topic: 'Science Basics',
          status: 'pending',
          student_id: student2Id
        })
        .select('id')
        .single();

      const progressId = teacherInsert!.id;

      // Sign in as student 1
      await studentClient.auth.signInWithPassword({
        email: `student1-${Date.now()}@test.com`,
        password: 'testpassword123'
      });

      // Student 1 should NOT be able to update student 2's progress
      const { error: updateError } = await studentClient
        .from('progress')
        .update({ status: 'completed' })
        .eq('id', progressId);

      expect(updateError).not.toBeNull(); // Should fail due to RLS
    });

    test('Students can manage their own classroom enrollments', async () => {
      // Student should be able to create their own classroom enrollment
      const { data: classroomData, error: classroomError } = await studentClient
        .from('classrooms')
        .insert({
          class_name: 'History 101',
          grade: 'A',
          student_id: student1Id
        });

      expect(classroomError).toBeNull();

      // Student should be able to view their own classrooms
      const { data: ownClassrooms, error: viewError } = await studentClient
        .from('classrooms')
        .select('*')
        .eq('student_id', student1Id);

      expect(viewError).toBeNull();
      expect(ownClassrooms).toHaveLength(1);
      expect(ownClassrooms![0].class_name).toBe('History 101');
    });
  });

  describe('Teacher RLS Policies', () => {
    test('Teachers can view all students progress records', async () => {
      // Sign in as teacher
      await teacherClient.auth.signInWithPassword({
        email: `teacher-${Date.now()}@test.com`,
        password: 'testpassword123'
      });

      // Teacher should be able to view all progress records
      const { data: allProgress, error: viewError } = await teacherClient
        .from('progress')
        .select('*');

      expect(viewError).toBeNull();
      expect(allProgress!.length).toBeGreaterThanOrEqual(1);
    });

    test('Teachers can create and update any progress record', async () => {
      // Teacher creates progress for any student
      const { data: newProgress, error: createError } = await teacherClient
        .from('progress')
        .insert({
          topic: 'Advanced Physics',
          status: 'in_progress',
          student_id: student1Id
        })
        .select('id')
        .single();

      expect(createError).toBeNull();
      expect(newProgress).toBeTruthy();

      // Teacher updates any progress record
      const { error: updateError } = await teacherClient
        .from('progress')
        .update({ status: 'completed' })
        .eq('id', newProgress!.id);

      expect(updateError).toBeNull();
    });

    test('Teachers can manage all classroom enrollments', async () => {
      // Teacher creates classroom enrollment for any student
      const { data: newClassroom, error: createError } = await teacherClient
        .from('classrooms')
        .insert({
          class_name: 'Advanced Chemistry',
          grade: 'B+',
          student_id: student2Id
        })
        .select('id')
        .single();

      expect(createError).toBeNull();
      expect(newClassroom).toBeTruthy();

      // Teacher can view all classrooms
      const { data: allClassrooms, error: viewError } = await teacherClient
        .from('classrooms')
        .select('*');

      expect(viewError).toBeNull();
      expect(allClassrooms!.length).toBeGreaterThanOrEqual(1);

      // Teacher can delete any classroom
      const { error: deleteError } = await teacherClient
        .from('classrooms')
        .delete()
        .eq('id', newClassroom!.id);

      expect(deleteError).toBeNull();
    });

    test('Teachers can view all student profiles', async () => {
      // Teacher should be able to view all student profiles
      const { data: allProfiles, error: viewError } = await teacherClient
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      expect(viewError).toBeNull();
      expect(allProfiles!.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Data Isolation Tests', () => {
    test('Student cannot access another students data', async () => {
      // Create test data for both students using teacher account
      await teacherClient.auth.signInWithPassword({
        email: `teacher-${Date.now()}@test.com`,
        password: 'testpassword123'
      });

      // Create progress for student 1
      await teacherClient.from('progress').insert({
        topic: 'Student 1 Topic',
        status: 'pending',
        student_id: student1Id
      });

      // Create progress for student 2
      await teacherClient.from('progress').insert({
        topic: 'Student 2 Topic',
        status: 'pending',
        student_id: student2Id
      });

      // Sign in as student 1
      await studentClient.auth.signInWithPassword({
        email: `student1-${Date.now()}@test.com`,
        password: 'testpassword123'
      });

      // Student 1 should only see their own data
      const { data: student1Data } = await studentClient
        .from('progress')
        .select('*');

      const student1Topics = student1Data?.map(p => p.topic) || [];
      expect(student1Topics).toContain('Student 1 Topic');
      expect(student1Topics).not.toContain('Student 2 Topic');
    });
  });
});