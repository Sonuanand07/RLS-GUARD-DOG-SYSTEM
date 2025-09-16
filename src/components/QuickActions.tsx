import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, UserPlus, BookOpen, ClipboardList, TrendingUp } from 'lucide-react';

interface QuickActionsProps {
  onAddStudent: () => void;
  onAddClassroom: () => void;
  onAddProgress: () => void;
  stats: {
    students: number;
    classrooms: number;
    progress: number;
    completed: number;
  };
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddStudent,
  onAddClassroom,
  onAddProgress,
  stats
}) => {
  const actions = [
    {
      title: 'Add Student',
      description: 'Create new student account',
      icon: UserPlus,
      onClick: onAddStudent,
      variant: 'default' as const,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      title: 'Add Classroom',
      description: 'Assign student to classroom',
      icon: BookOpen,
      onClick: onAddClassroom,
      variant: 'outline' as const,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Add Progress',
      description: 'Track student progress',
      icon: ClipboardList,
      onClick: onAddProgress,
      variant: 'outline' as const,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Stats Overview */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Students:</span>
            <span className="font-medium">{stats.students}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Classrooms:</span>
            <span className="font-medium">{stats.classrooms}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">{stats.progress}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completed:</span>
            <span className="font-medium text-green-600">{stats.completed}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {actions.map((action) => (
        <Card 
          key={action.title}
          className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] group"
          onClick={action.onClick}
        >
          <CardContent className="p-6 text-center">
            <div className={`w-12 h-12 rounded-full ${action.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-6 h-6 ${action.iconColor}`} />
            </div>
            <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
            <Button 
              size="sm" 
              variant={action.variant}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};