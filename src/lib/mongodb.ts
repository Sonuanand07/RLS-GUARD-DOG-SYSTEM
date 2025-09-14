// Optional MongoDB integration for audit logs and analytics
// This is a supplementary service that works alongside Supabase

import { MongoClient, Db, Collection } from 'mongodb';

interface AuditLog {
  userId: string;
  userRole: 'student' | 'teacher';
  action: string;
  table: string;
  recordId: string;
  oldData?: any;
  newData?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface TeacherPreferences {
  userId: string;
  dashboardLayout: 'grid' | 'list';
  defaultStudentView: 'progress' | 'classrooms';
  notificationSettings: {
    emailUpdates: boolean;
    progressAlerts: boolean;
    newStudentRegistrations: boolean;
  };
  customCategories: string[];
  gradeTemplates: {
    name: string;
    criteria: { [key: string]: number };
  }[];
}

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private auditCollection: Collection<AuditLog> | null = null;
  private preferencesCollection: Collection<TeacherPreferences> | null = null;

  constructor(private connectionString: string) {}

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db('rls_guard_dog');
      this.auditCollection = this.db.collection<AuditLog>('audit_logs');
      this.preferencesCollection = this.db.collection<TeacherPreferences>('teacher_preferences');
      
      // Create indexes for better performance
      await this.auditCollection.createIndex({ userId: 1, timestamp: -1 });
      await this.auditCollection.createIndex({ table: 1, recordId: 1 });
      await this.preferencesCollection.createIndex({ userId: 1 }, { unique: true });
      
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.auditCollection = null;
      this.preferencesCollection = null;
    }
  }

  // Audit logging methods
  async logAction(auditData: Omit<AuditLog, 'timestamp'>): Promise<void> {
    if (!this.auditCollection) {
      throw new Error('MongoDB not connected');
    }

    const logEntry: AuditLog = {
      ...auditData,
      timestamp: new Date()
    };

    await this.auditCollection.insertOne(logEntry);
  }

  async getAuditLogs(
    userId?: string,
    table?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    if (!this.auditCollection) {
      throw new Error('MongoDB not connected');
    }

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (table) filter.table = table;

    return await this.auditCollection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  async getStudentActivitySummary(studentId: string, days: number = 30): Promise<any> {
    if (!this.auditCollection) {
      throw new Error('MongoDB not connected');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      {
        $match: {
          userId: studentId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          totalActions: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.auditCollection.aggregate(pipeline).toArray();
  }

  // Teacher preferences methods
  async saveTeacherPreferences(preferences: TeacherPreferences): Promise<void> {
    if (!this.preferencesCollection) {
      throw new Error('MongoDB not connected');
    }

    await this.preferencesCollection.replaceOne(
      { userId: preferences.userId },
      preferences,
      { upsert: true }
    );
  }

  async getTeacherPreferences(userId: string): Promise<TeacherPreferences | null> {
    if (!this.preferencesCollection) {
      throw new Error('MongoDB not connected');
    }

    return await this.preferencesCollection.findOne({ userId });
  }

  async getDefaultTeacherPreferences(userId: string): Promise<TeacherPreferences> {
    return {
      userId,
      dashboardLayout: 'grid',
      defaultStudentView: 'progress',
      notificationSettings: {
        emailUpdates: true,
        progressAlerts: true,
        newStudentRegistrations: true
      },
      customCategories: ['Math', 'Science', 'English', 'History'],
      gradeTemplates: [
        {
          name: 'Standard',
          criteria: {
            'Excellent': 90,
            'Good': 80,
            'Satisfactory': 70,
            'Needs Improvement': 60
          }
        }
      ]
    };
  }

  // Analytics methods
  async getProgressAnalytics(teacherId: string): Promise<any> {
    if (!this.auditCollection) {
      throw new Error('MongoDB not connected');
    }

    const pipeline = [
      {
        $match: {
          userRole: 'teacher',
          action: { $in: ['create', 'update'] },
          table: 'progress'
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$timestamp' },
            year: { $year: '$timestamp' }
          },
          totalUpdates: { $sum: 1 },
          uniqueStudents: { $addToSet: '$recordId' }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          totalUpdates: 1,
          uniqueStudentCount: { $size: '$uniqueStudents' }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ];

    return await this.auditCollection.aggregate(pipeline).toArray();
  }
}

// Singleton instance
let mongoService: MongoDBService | null = null;

export const getMongoService = (connectionString?: string): MongoDBService => {
  if (!mongoService && connectionString) {
    mongoService = new MongoDBService(connectionString);
  }
  
  if (!mongoService) {
    throw new Error('MongoDB service not initialized. Provide connection string first.');
  }
  
  return mongoService;
};

// Helper function to log actions automatically
export const logSupabaseAction = async (
  userId: string,
  userRole: 'student' | 'teacher',
  action: 'create' | 'update' | 'delete' | 'select',
  table: string,
  recordId: string,
  oldData?: any,
  newData?: any
) => {
  try {
    const mongo = getMongoService();
    await mongo.logAction({
      userId,
      userRole,
      action,
      table,
      recordId,
      oldData,
      newData
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main flow
    console.warn('Failed to log action to MongoDB:', error);
  }
};

export type { AuditLog, TeacherPreferences };