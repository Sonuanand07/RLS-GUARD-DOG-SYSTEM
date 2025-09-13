import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Plus, Users, BookOpen, Edit, Trash } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface Student {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface Progress {
  id: string;
  subject: string;
  score: number;
  completion_date?: string;
  notes?: string;
  student: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  classroom: {
    name: string;
  };
}

const TeacherDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showClassroomForm, setShowClassroomForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [classroomForm, setClassroomForm] = useState({ name: '', description: '' });
  const [progressForm, setProgressForm] = useState({
    student_id: '',
    classroom_id: '',
    subject: '',
    score: '',
    completion_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch classrooms created by this teacher
      const { data: classroomData, error: classroomError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (classroomError) throw classroomError;

      // Fetch all students
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'student');

      if (studentError) throw studentError;

      // Fetch all progress records (teachers can see all)
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select(`
          id,
          subject,
          score,
          completion_date,
          notes,
          student:student_id (
            first_name,
            last_name,
            email
          ),
          classroom:classroom_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (progressError) throw progressError;

      setClassrooms(classroomData || []);
      setStudents(studentData || []);
      setProgress(progressData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('classrooms')
        .insert({
          name: classroomForm.name,
          description: classroomForm.description,
          teacher_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Classroom created successfully!"
      });

      setClassroomForm({ name: '', description: '' });
      setShowClassroomForm(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create classroom",
        variant: "destructive"
      });
    }
  };

  const handleCreateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('progress')
        .insert({
          student_id: progressForm.student_id,
          classroom_id: progressForm.classroom_id,
          subject: progressForm.subject,
          score: parseFloat(progressForm.score),
          completion_date: progressForm.completion_date || null,
          notes: progressForm.notes || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Progress record created successfully!"
      });

      setProgressForm({
        student_id: '',
        classroom_id: '',
        subject: '',
        score: '',
        completion_date: '',
        notes: ''
      });
      setShowProgressForm(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create progress record",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProgress = async (progressId: string) => {
    try {
      const { error } = await supabase
        .from('progress')
        .delete()
        .eq('id', progressId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Progress record deleted successfully!"
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete progress record",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.first_name} {profile?.last_name}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Classrooms
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classrooms.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Progress Records
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress.length > 0 
                  ? Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={showClassroomForm} onOpenChange={setShowClassroomForm}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Classroom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
                <DialogDescription>
                  Add a new classroom to manage students and their progress.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div>
                  <Label htmlFor="classroom-name">Classroom Name</Label>
                  <Input
                    id="classroom-name"
                    value={classroomForm.name}
                    onChange={(e) => setClassroomForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter classroom name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="classroom-description">Description</Label>
                  <Textarea
                    id="classroom-description"
                    value={classroomForm.description}
                    onChange={(e) => setClassroomForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter classroom description (optional)"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowClassroomForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Classroom</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showProgressForm} onOpenChange={setShowProgressForm}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Progress Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Progress Record</DialogTitle>
                <DialogDescription>
                  Record a student's progress in a subject.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProgress} className="space-y-4">
                <div>
                  <Label htmlFor="student-select">Student</Label>
                  <Select 
                    value={progressForm.student_id} 
                    onValueChange={(value) => setProgressForm(prev => ({ ...prev, student_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="classroom-select">Classroom</Label>
                  <Select 
                    value={progressForm.classroom_id} 
                    onValueChange={(value) => setProgressForm(prev => ({ ...prev, classroom_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a classroom" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={progressForm.subject}
                    onChange={(e) => setProgressForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="score">Score (%)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={progressForm.score}
                    onChange={(e) => setProgressForm(prev => ({ ...prev, score: e.target.value }))}
                    placeholder="Enter score (0-100)"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="completion-date">Completion Date</Label>
                  <Input
                    id="completion-date"
                    type="date"
                    value={progressForm.completion_date}
                    onChange={(e) => setProgressForm(prev => ({ ...prev, completion_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={progressForm.notes}
                    onChange={(e) => setProgressForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes (optional)"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowProgressForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Progress Record</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Classrooms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Classrooms</CardTitle>
            <CardDescription>
              Classrooms you have created and manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classrooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No classrooms created yet. Create your first classroom to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classrooms.map((classroom) => (
                  <div key={classroom.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{classroom.name}</h3>
                    {classroom.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {classroom.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(classroom.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Records */}
        <Card>
          <CardHeader>
            <CardTitle>All Progress Records</CardTitle>
            <CardDescription>
              Academic progress for all students across all classrooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progress.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No progress records found. Start by adding progress records for your students.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.map((record) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{record.subject}</h3>
                        <Badge 
                          className={`text-white ${
                            record.score >= 90 ? 'bg-green-500' :
                            record.score >= 80 ? 'bg-blue-500' :
                            record.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        >
                          {record.score}%
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Student: {record.student?.first_name} {record.student?.last_name}</p>
                        <p>Classroom: {record.classroom?.name}</p>
                        {record.completion_date && (
                          <p>Completed: {new Date(record.completion_date).toLocaleDateString()}</p>
                        )}
                        {record.notes && (
                          <p>Notes: {record.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteProgress(record.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TeacherDashboard;