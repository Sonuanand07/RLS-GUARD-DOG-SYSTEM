import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, Users, BookOpen, TrendingUp, Plus, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name?: string;
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

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.first_name}</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classrooms.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress Records</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress.filter(p => p.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <Badge>{student.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.slice(0, 5).map(record => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{record.topic}</p>
                      <p className="text-sm text-muted-foreground">{record.student?.full_name}</p>
                    </div>
                    <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;