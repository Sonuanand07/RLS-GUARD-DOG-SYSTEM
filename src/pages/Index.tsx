import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, TrendingUp, Lock, BookOpen, UserCheck } from 'lucide-react';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  React.useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.role === 'student' ? '/student' : '/teacher');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-5xl font-bold">RLS Guard Dog</h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A secure classroom management system demonstrating Row Level Security (RLS) policies. 
            Students see only their own progress while teachers have full access to manage all data.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Lock className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Secure RLS Policies</CardTitle>
                <CardDescription>
                  Advanced Row Level Security ensures students can only access their own data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• User-specific data access</li>
                  <li>• Role-based permissions</li>
                  <li>• Automatic security enforcement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Separate interfaces and permissions for students and teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Student dashboard</li>
                  <li>• Teacher management panel</li>
                  <li>• Protected routes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Comprehensive academic progress monitoring and reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Score tracking</li>
                  <li>• Subject management</li>
                  <li>• Performance analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sign Up as Student or Teacher</h3>
                <p className="text-muted-foreground">
                  Create an account and choose your role. Teachers can create classrooms and manage progress, 
                  while students can view only their own academic records.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">Teachers Create Classrooms</h3>
                <p className="text-muted-foreground">
                  Teachers set up classrooms and add progress records for students. 
                  All data is automatically secured with RLS policies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Students View Their Progress</h3>
                <p className="text-muted-foreground">
                  Students can see their own academic progress, scores, and classroom information. 
                  They cannot access other students' data due to RLS protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-2xl text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Secure Data Management?</h2>
          <p className="text-lg mb-8 opacity-90">
            See how Row Level Security protects student data while providing teachers with the tools they need.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 mx-auto"
          >
            <UserCheck className="w-5 h-5" />
            Start Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
