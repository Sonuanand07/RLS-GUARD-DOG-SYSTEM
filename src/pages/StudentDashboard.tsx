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
  class_name: string;
  grade?: string;
  student_id: string;
}

interface Progress {
  id: string;
  topic: string;
  status: string;
  updated_at?: string;
  student_id: string;
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

      // Fetch student's classrooms
      const { data: classroomData, error: classroomError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('student_id', user.id);

      if (classroomError) throw classroomError;

      // Fetch student's progress
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('student_id', user.id)
        .order('updated_at', { ascending: false });

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const updateProgress = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('progress')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Refresh data
      fetchData();
      toast({
        title: "Success",
        description: "Progress updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to update progress",
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
                Completed Tasks
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress.filter(p => p.status === 'completed').length}
              </div>
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
              <div className="text-2xl font-bold">{classrooms.length}</div>
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
                  No progress records found. Start tracking your learning progress!
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
                        <h3 className="font-semibold">{record.topic}</h3>
                        <Badge 
                          className={`text-white ${getStatusColor(record.status)}`}
                        >
                          {record.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {record.updated_at && (
                          <p>Updated: {new Date(record.updated_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateProgress(record.id, 'in_progress')}
                        disabled={record.status === 'in_progress'}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateProgress(record.id, 'completed')}
                        disabled={record.status === 'completed'}
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Classrooms */}
        <Card>
          <CardHeader>
            <CardTitle>My Classrooms</CardTitle>
            <CardDescription>
              Classes you are enrolled in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classrooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No classrooms enrolled yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classrooms.map((classroom) => (
                  <div 
                    key={classroom.id}
                    className="p-4 border rounded-lg"
                  >
                    <h3 className="font-semibold mb-2">{classroom.class_name}</h3>
                    {classroom.grade && (
                      <div className="text-sm text-muted-foreground">
                        <p>Grade: {classroom.grade}</p>
                      </div>
                    )}
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