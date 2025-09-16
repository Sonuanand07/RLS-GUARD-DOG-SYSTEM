import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Users, GraduationCap } from 'lucide-react';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher';
}

export const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Securing your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'student' ? '/student' : '/teacher'} replace />;
  }

  // Add visual role indicator
  const roleIcon = profile.role === 'teacher' ? GraduationCap : Users;
  const roleColor = profile.role === 'teacher' ? 'text-primary' : 'text-blue-500';

  return (
    <div className="min-h-screen bg-background">
      {/* Role indicator overlay */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm ${roleColor}`}>
          {React.createElement(roleIcon, { className: 'w-4 h-4' })}
          <span className="text-sm font-medium capitalize">{profile.role}</span>
        </div>
      </div>
      {children}
    </div>
  );
};