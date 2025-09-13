import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, BookOpen, TrendingUp } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacher: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface Progress {
  id: string;
  subject: string;
  score: number;
  completion_date?: string;
  notes?: string;
  classroom: {
    name: string;
  };
}

const StudentDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
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

      // Fetch classrooms where student has progress
      const { data: classroomData, error: classroomError } = await supabase
        .from('classrooms')
        .select(`
          id,
          name,
          description,
          teacher:teacher_id (
            first_name,
            last_name,
            email
          )
        `);

      if (classroomError) throw classroomError;

      // Fetch student's progress
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select(`
          id,
          subject,
          score,
          completion_date,
          notes,
          classroom:classroom_id (
            name
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (progressError) throw progressError;

      setClassrooms(classroomData || []);
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateAverageScore = () => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / progress.length);
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
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Progress Records
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverageScore()}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrolled Classrooms
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(progress.map(p => p.classroom?.name)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Records */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Progress Records</CardTitle>
            <CardDescription>
              Your academic progress across all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progress.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No progress records found. Your teachers will add progress as you complete assignments.
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
                          className={`text-white ${getScoreColor(record.score)}`}
                        >
                          {record.score}%
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Classroom: {record.classroom?.name}</p>
                        {record.completion_date && (
                          <p>Completed: {new Date(record.completion_date).toLocaleDateString()}</p>
                        )}
                        {record.notes && (
                          <p>Notes: {record.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Classrooms */}
        <Card>
          <CardHeader>
            <CardTitle>Available Classrooms</CardTitle>
            <CardDescription>
              Classrooms you have access to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classrooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No classrooms available. Contact your teachers to get enrolled.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classrooms
                  .filter(classroom => 
                    progress.some(p => p.classroom?.name === classroom.name)
                  )
                  .map((classroom) => (
                    <div 
                      key={classroom.id}
                      className="p-4 border rounded-lg"
                    >
                      <h3 className="font-semibold mb-2">{classroom.name}</h3>
                      {classroom.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {classroom.description}
                        </p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <p>Teacher: {classroom.teacher?.first_name} {classroom.teacher?.last_name}</p>
                        <p>Email: {classroom.teacher?.email}</p>
                      </div>
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

export default StudentDashboard;