
export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Admin extends User {
  role: 'admin';
}

export interface Student extends User {
  role: 'student';
  batches: string[];
  studentId: string;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  subBatches: SubBatch[];
  students: string[];
  createdAt: Date;
}

export interface SubBatch {
  id: string;
  name: string;
  description?: string;
  students: string[];
}

export interface AttendanceRecord {
  id: string;
  batchId: string;
  subBatchId: string;
  date: Date;
  records: {
    studentId: string;
    status: 'present' | 'absent';
  }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
