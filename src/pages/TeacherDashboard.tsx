import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickActions } from '@/components/QuickActions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Users, BookOpen, TrendingUp, Plus, Trash2, Edit, GraduationCap, UserPlus, ClipboardList } from 'lucide-react';

interface Profile {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: 'student' | 'teacher';
  email?: string;
}

interface Classroom {
  id: string;
  class_name: string;
  grade?: string;
  student_id: string;
  student?: Profile;
}

interface Progress {
  id: string;
  topic: string;
  status: string;
  updated_at?: string;
  student_id: string;
  student?: Profile;
}

const TeacherDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Profile[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newStudent, setNewStudent] = useState({ email: '', password: '', firstName: '', lastName: '', fullName: '' });
  const [newClassroom, setNewClassroom] = useState({ className: '', grade: '', studentId: '' });
  const [newProgress, setNewProgress] = useState({ studentId: '', topic: '', status: 'pending' });
  const [dialogOpen, setDialogOpen] = useState({ student: false, classroom: false, progress: false });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: studentsData } = await supabase.from('profiles').select('*').eq('role', 'student');
      const { data: classroomsData } = await supabase.from('classrooms').select('*, student:student_id(*)');
      const { data: progressData } = await supabase.from('progress').select('*, student:student_id(*)');
      
      setStudents(studentsData || []);
      setClassrooms(classroomsData || []);
      setProgress(progressData || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newStudent.email,
        password: newStudent.password,
        options: {
          data: {
            first_name: newStudent.firstName,
            last_name: newStudent.lastName,
            role: 'student'
          }
        }
      });

      if (authError) throw authError;

      toast({ title: "Success", description: "Student created successfully" });
      setNewStudent({ email: '', password: '', firstName: '', lastName: '', fullName: '' });
      setDialogOpen(prev => ({ ...prev, student: false }));
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create student", variant: "destructive" });
    }
  };

  const createClassroom = async () => {
    try {
      const { error } = await supabase.from('classrooms').insert({
        class_name: newClassroom.className,
        grade: newClassroom.grade,
        student_id: newClassroom.studentId
      });

      if (error) throw error;

      toast({ title: "Success", description: "Classroom created successfully" });
      setNewClassroom({ className: '', grade: '', studentId: '' });
      setDialogOpen(prev => ({ ...prev, classroom: false }));
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create classroom", variant: "destructive" });
    }
  };

  const createProgress = async () => {
    try {
      const { error } = await supabase.from('progress').insert({
        student_id: newProgress.studentId,
        topic: newProgress.topic,
        status: newProgress.status
      });

      if (error) throw error;

      toast({ title: "Success", description: "Progress record created successfully" });
      setNewProgress({ studentId: '', topic: '', status: 'pending' });
      setDialogOpen(prev => ({ ...prev, progress: false }));
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create progress", variant: "destructive" });
    }
  };

  const updateProgress = async (id: string, updates: Partial<Progress>) => {
    try {
      const { error } = await supabase
        .from('progress')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ title: "Success", description: "Progress updated successfully" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update progress", variant: "destructive" });
    }
  };

  const deleteProgress = async (id: string) => {
    try {
      const { error } = await supabase.from('progress').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Progress record deleted" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete progress", variant: "destructive" });
    }
  };

  const deleteClassroom = async (id: string) => {
    try {
      const { error } = await supabase.from('classrooms').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Classroom deleted" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to delete classroom", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-primary/5 to-purple-50 dark:from-primary/10 dark:to-purple-950/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Teacher Control Center</h1>
                <p className="text-muted-foreground">Welcome back, {profile?.first_name} {profile?.last_name}</p>
                <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                  Administrator Access
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <QuickActions
          onAddStudent={() => setDialogOpen(prev => ({ ...prev, student: true }))}
          onAddClassroom={() => setDialogOpen(prev => ({ ...prev, classroom: true }))}
          onAddProgress={() => setDialogOpen(prev => ({ ...prev, progress: true }))}
          stats={{
            students: students.length,
            classrooms: classrooms.length,
            progress: progress.length,
            completed: progress.filter(p => p.status === 'completed').length
          }}
        />

        {/* Dialog Components */}
        <Dialog open={dialogOpen.student} onOpenChange={(open) => setDialogOpen(prev => ({ ...prev, student: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Student</DialogTitle>
              <DialogDescription>Add a new student to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input 
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input 
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <Label>Temporary Password</Label>
                <Input 
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter temporary password"
                />
              </div>
              <Button onClick={createStudent} className="w-full">Create Student</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen.classroom} onOpenChange={(open) => setDialogOpen(prev => ({ ...prev, classroom: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Classroom</DialogTitle>
              <DialogDescription>Assign a student to a new classroom</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Class Name</Label>
                <Input 
                  value={newClassroom.className}
                  onChange={(e) => setNewClassroom(prev => ({ ...prev, className: e.target.value }))}
                  placeholder="e.g., Mathematics 101"
                />
              </div>
              <div>
                <Label>Grade</Label>
                <Input 
                  value={newClassroom.grade}
                  onChange={(e) => setNewClassroom(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="e.g., Grade 10"
                />
              </div>
              <div>
                <Label>Student</Label>
                <Select value={newClassroom.studentId} onValueChange={(value) => setNewClassroom(prev => ({ ...prev, studentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name || `${student.first_name} ${student.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createClassroom} className="w-full">Create Classroom</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen.progress} onOpenChange={(open) => setDialogOpen(prev => ({ ...prev, progress: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Progress Record</DialogTitle>
              <DialogDescription>Track a student's progress on a topic</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Student</Label>
                <Select value={newProgress.studentId} onValueChange={(value) => setNewProgress(prev => ({ ...prev, studentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name || `${student.first_name} ${student.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Topic</Label>
                <Input 
                  value={newProgress.topic}
                  onChange={(e) => setNewProgress(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Algebra Basics"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={newProgress.status} onValueChange={(value) => setNewProgress(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createProgress} className="w-full">Create Progress Record</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Management Tabs */}
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Students Management</TabsTrigger>
            <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Students ({students.length})</CardTitle>
                <CardDescription>Manage student accounts and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.full_name || `${student.first_name} ${student.last_name}`}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{student.role}</Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No students found. Create your first student account.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classrooms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Classrooms ({classrooms.length})</CardTitle>
                <CardDescription>Manage classroom assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classrooms.map(classroom => (
                    <div key={classroom.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{classroom.class_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {classroom.grade} • Student: {classroom.student?.full_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteClassroom(classroom.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {classrooms.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No classrooms found. Create your first classroom.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Progress Records ({progress.length})</CardTitle>
                <CardDescription>Track and manage student progress with inline editing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{record.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          Student: {record.student?.full_name} • Updated: {new Date(record.updated_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={record.status} onValueChange={(value) => updateProgress(record.id, { status: value })}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="destructive" onClick={() => deleteProgress(record.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {progress.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No progress records found. Create your first progress entry.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;