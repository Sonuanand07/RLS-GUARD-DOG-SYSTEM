import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface StudentProgressCardProps {
  progress: {
    id: string;
    topic: string;
    status: string;
    updated_at?: string;
  };
  onUpdateProgress: (id: string, status: string) => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({ progress, onUpdateProgress }) => {
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { color: 'bg-green-500 text-white', icon: CheckCircle, progress: 100 };
      case 'in_progress':
        return { color: 'bg-blue-500 text-white', icon: Clock, progress: 60 };
      case 'pending':
        return { color: 'bg-yellow-500 text-white', icon: TrendingUp, progress: 20 };
      default:
        return { color: 'bg-gray-500 text-white', icon: TrendingUp, progress: 0 };
    }
  };

  const statusInfo = getStatusInfo(progress.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{progress.topic}</CardTitle>
            <CardDescription>
              Last updated: {progress.updated_at ? new Date(progress.updated_at).toLocaleDateString() : 'Never'}
            </CardDescription>
          </div>
          <Badge className={statusInfo.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {progress.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{statusInfo.progress}%</span>
          </div>
          <Progress value={statusInfo.progress} className="h-2" />
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateProgress(progress.id, 'in_progress')}
            disabled={progress.status === 'in_progress'}
            className="flex-1"
          >
            <Clock className="w-3 h-3 mr-1" />
            Start
          </Button>
          <Button
            size="sm"
            onClick={() => onUpdateProgress(progress.id, 'completed')}
            disabled={progress.status === 'completed'}
            className="flex-1"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};