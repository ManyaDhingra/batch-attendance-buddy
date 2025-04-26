
import React, { createContext, useState, useContext, useCallback } from 'react';
import { Batch, Student, SubBatch, AttendanceRecord } from '../types';
import { useToast } from "@/components/ui/use-toast";

// Mock data
const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-1',
    name: 'Web Development Bootcamp',
    description: 'Intensive web development training',
    subBatches: [
      {
        id: 'sub-batch-1',
        name: 'Frontend Group',
        description: 'Focus on React, HTML, CSS',
        students: ['student-1', 'student-2'],
      },
      {
        id: 'sub-batch-2',
        name: 'Backend Group',
        description: 'Focus on Node.js, Express, MongoDB',
        students: ['student-1'],
      },
    ],
    students: ['student-1', 'student-2'],
    createdAt: new Date('2023-01-01'),
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    batches: ['batch-1'],
    studentId: 'S10001',
  },
  {
    id: 'student-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'student',
    batches: ['batch-1'],
    studentId: 'S10002',
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    batchId: 'batch-1',
    subBatchId: 'sub-batch-1',
    date: new Date('2023-01-15'),
    records: [
      { studentId: 'student-1', status: 'online' },
      { studentId: 'student-2', status: 'absent' },
    ],
  },
  {
    id: 'att-2',
    batchId: 'batch-1',
    subBatchId: 'sub-batch-2',
    date: new Date('2023-01-15'),
    records: [
      { studentId: 'student-1', status: 'online' },
    ],
  },
];

interface DataContextType {
  batches: Batch[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  addBatch: (batch: Omit<Batch, 'id' | 'createdAt'>) => void;
  updateBatch: (batch: Batch) => void;
  deleteBatch: (batchId: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addStudentToBatch: (studentId: string, batchId: string) => void;
  removeStudentFromBatch: (studentId: string, batchId: string) => void;
  addStudentToSubBatch: (studentId: string, batchId: string, subBatchId: string) => void;
  removeStudentFromSubBatch: (studentId: string, batchId: string, subBatchId: string) => void;
  recordAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendance: (record: AttendanceRecord) => void;
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  getBatchAttendance: (batchId: string) => AttendanceRecord[];
  getSubBatchAttendance: (batchId: string, subBatchId: string) => AttendanceRecord[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const { toast } = useToast();

  const addBatch = useCallback((batchData: Omit<Batch, 'id' | 'createdAt'>) => {
    console.log("Adding batch:", batchData); // Debug log
    
    const newBatch: Batch = {
      ...batchData,
      id: `batch-${Date.now()}`,
      createdAt: new Date(),
    };
    
    setBatches(prev => {
      const updatedBatches = [...prev, newBatch];
      console.log("Updated batches:", updatedBatches); // Debug log
      return updatedBatches;
    });
    
    toast({
      title: "Success",
      description: `Batch "${newBatch.name}" has been created`,
    });
  }, [toast]);

  const updateBatch = useCallback((updatedBatch: Batch) => {
    setBatches(prev =>
      prev.map(batch => (batch.id === updatedBatch.id ? updatedBatch : batch))
    );
    toast({
      title: "Success",
      description: `Batch "${updatedBatch.name}" has been updated`,
    });
  }, [toast]);

  const deleteBatch = useCallback((batchId: string) => {
    const batchToDelete = batches.find(b => b.id === batchId);
    
    if (batchToDelete) {
      // Remove batch
      setBatches(prev => prev.filter(batch => batch.id !== batchId));
      
      // Remove batch from students
      setStudents(prev =>
        prev.map(student => ({
          ...student,
          batches: student.batches.filter(b => b !== batchId),
        }))
      );
      
      // Remove attendance records for batch
      setAttendanceRecords(prev =>
        prev.filter(record => record.batchId !== batchId)
      );

      toast({
        title: "Success",
        description: `Batch "${batchToDelete.name}" has been deleted`,
      });
    }
  }, [batches, toast]);

  const addStudent = useCallback((studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
    };
    
    setStudents(prev => [...prev, newStudent]);
    toast({
      title: "Success",
      description: `Student "${newStudent.name}" has been added`,
    });
  }, [toast]);

  const updateStudent = useCallback((updatedStudent: Student) => {
    setStudents(prev =>
      prev.map(student => (student.id === updatedStudent.id ? updatedStudent : student))
    );
    toast({
      title: "Success",
      description: `Student "${updatedStudent.name}" has been updated`,
    });
  }, [toast]);

  const deleteStudent = useCallback((studentId: string) => {
    const studentToDelete = students.find(s => s.id === studentId);
    
    if (studentToDelete) {
      // Remove student
      setStudents(prev => prev.filter(student => student.id !== studentId));
      
      // Remove student from batches
      setBatches(prev =>
        prev.map(batch => ({
          ...batch,
          students: batch.students.filter(s => s !== studentId),
          subBatches: batch.subBatches.map(subBatch => ({
            ...subBatch,
            students: subBatch.students.filter(s => s !== studentId),
          })),
        }))
      );
      
      // Update attendance records
      setAttendanceRecords(prev =>
        prev.map(record => ({
          ...record,
          records: record.records.filter(r => r.studentId !== studentId),
        }))
      );

      toast({
        title: "Success",
        description: `Student "${studentToDelete.name}" has been deleted`,
      });
    }
  }, [students, toast]);

  const addStudentToBatch = useCallback((studentId: string, batchId: string) => {
    const student = students.find(s => s.id === studentId);
    const batch = batches.find(b => b.id === batchId);
    
    if (student && batch) {
      // Add batch to student
      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? { ...s, batches: [...new Set([...s.batches, batchId])] }
            : s
        )
      );
      
      // Add student to batch
      setBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? { ...b, students: [...new Set([...b.students, studentId])] }
            : b
        )
      );

      toast({
        title: "Success",
        description: `${student.name} added to ${batch.name}`,
      });
    }
  }, [students, batches, toast]);

  const removeStudentFromBatch = useCallback((studentId: string, batchId: string) => {
    const student = students.find(s => s.id === studentId);
    const batch = batches.find(b => b.id === batchId);
    
    if (student && batch) {
      // Remove batch from student
      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? { ...s, batches: s.batches.filter(b => b !== batchId) }
            : s
        )
      );
      
      // Remove student from batch
      setBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                students: b.students.filter(s => s !== studentId),
                subBatches: b.subBatches.map(subBatch => ({
                  ...subBatch,
                  students: subBatch.students.filter(s => s !== studentId),
                })),
              }
            : b
        )
      );

      toast({
        title: "Success",
        description: `${student.name} removed from ${batch.name}`,
      });
    }
  }, [students, batches, toast]);

  const addStudentToSubBatch = useCallback((studentId: string, batchId: string, subBatchId: string) => {
    const student = students.find(s => s.id === studentId);
    const batch = batches.find(b => b.id === batchId);
    const subBatch = batch?.subBatches.find(sb => sb.id === subBatchId);
    
    if (student && batch && subBatch) {
      // Ensure student is in the main batch first
      if (!batch.students.includes(studentId)) {
        addStudentToBatch(studentId, batchId);
      }
      
      // Add student to sub-batch
      setBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                subBatches: b.subBatches.map(sb =>
                  sb.id === subBatchId
                    ? { ...sb, students: [...new Set([...sb.students, studentId])] }
                    : sb
                ),
              }
            : b
        )
      );

      toast({
        title: "Success",
        description: `${student.name} added to ${subBatch.name}`,
      });
    }
  }, [students, batches, addStudentToBatch, toast]);

  const removeStudentFromSubBatch = useCallback((studentId: string, batchId: string, subBatchId: string) => {
    const student = students.find(s => s.id === studentId);
    const batch = batches.find(b => b.id === batchId);
    const subBatch = batch?.subBatches.find(sb => sb.id === subBatchId);
    
    if (student && batch && subBatch) {
      // Remove student from sub-batch
      setBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                subBatches: b.subBatches.map(sb =>
                  sb.id === subBatchId
                    ? { ...sb, students: sb.students.filter(s => s !== studentId) }
                    : sb
                ),
              }
            : b
        )
      );

      toast({
        title: "Success",
        description: `${student.name} removed from ${subBatch.name}`,
      });
    }
  }, [students, batches, toast]);

  const recordAttendance = useCallback((record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
    };
    
    setAttendanceRecords(prev => [...prev, newRecord]);
    toast({
      title: "Success",
      description: `Attendance recorded for ${new Date(record.date).toLocaleDateString()}`,
    });
  }, [toast]);

  const updateAttendance = useCallback((updatedRecord: AttendanceRecord) => {
    setAttendanceRecords(prev =>
      prev.map(record => (record.id === updatedRecord.id ? updatedRecord : record))
    );
    toast({
      title: "Success",
      description: `Attendance updated for ${new Date(updatedRecord.date).toLocaleDateString()}`,
    });
  }, [toast]);

  const getStudentAttendance = useCallback((studentId: string) => {
    return attendanceRecords.filter(record =>
      record.records.some(r => r.studentId === studentId)
    );
  }, [attendanceRecords]);

  const getBatchAttendance = useCallback((batchId: string) => {
    return attendanceRecords.filter(record => record.batchId === batchId);
  }, [attendanceRecords]);

  const getSubBatchAttendance = useCallback((batchId: string, subBatchId: string) => {
    return attendanceRecords.filter(
      record => record.batchId === batchId && record.subBatchId === subBatchId
    );
  }, [attendanceRecords]);

  return (
    <DataContext.Provider
      value={{
        batches,
        students,
        attendanceRecords,
        addBatch,
        updateBatch,
        deleteBatch,
        addStudent,
        updateStudent,
        deleteStudent,
        addStudentToBatch,
        removeStudentFromBatch,
        addStudentToSubBatch,
        removeStudentFromSubBatch,
        recordAttendance,
        updateAttendance,
        getStudentAttendance,
        getBatchAttendance,
        getSubBatchAttendance,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
