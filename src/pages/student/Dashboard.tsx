
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckSquare, Clock, XCircle } from "lucide-react";
import { Student } from "@/types";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { batches, getStudentAttendance } = useData();
  
  const studentUser = user as Student;
  const studentAttendance = getStudentAttendance(studentUser.id);
  
  // Calculate attendance statistics
  const totalAttendance = studentAttendance.reduce(
    (acc, record) => {
      const studentRecord = record.records.find(
        r => r.studentId === studentUser.id
      );
      
      if (studentRecord) {
        if (studentRecord.status === 'present') {
          return { ...acc, present: acc.present + 1, total: acc.total + 1 };
        } else {
          return { ...acc, absent: acc.absent + 1, total: acc.total + 1 };
        }
      }
      
      return acc;
    },
    { present: 0, absent: 0, total: 0 }
  );
  
  const attendancePercentage = totalAttendance.total > 0
    ? Math.round((totalAttendance.present / totalAttendance.total) * 100)
    : 0;
  
  // Get student's batches
  const studentBatches = batches.filter(batch => 
    studentUser.batches.includes(batch.id)
  );

  return (
    <Layout requireAuth requireStudent>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome, {studentUser.name}!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Attendance Days
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendance.total}</div>
              <p className="text-xs text-muted-foreground">
                Days tracked in the system
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Present Days
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendance.present}</div>
              <p className="text-xs text-muted-foreground">
                Days you were present
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Absent Days
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendance.absent}</div>
              <p className="text-xs text-muted-foreground">
                Days you were absent
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}%</div>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${attendancePercentage >= 75 ? 'bg-attendance-present' : attendancePercentage >= 50 ? 'bg-attendance-pending' : 'bg-attendance-absent'}`}
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Batches</CardTitle>
            </CardHeader>
            <CardContent>
              {studentBatches.length > 0 ? (
                <div className="space-y-4">
                  {studentBatches.map(batch => {
                    const studentSubBatches = batch.subBatches.filter(subBatch =>
                      subBatch.students.includes(studentUser.id)
                    );
                    
                    return (
                      <div key={batch.id}>
                        <h3 className="font-medium">{batch.name}</h3>
                        {studentSubBatches.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-muted-foreground">Sub-batches:</p>
                            <ul className="text-sm space-y-1">
                              {studentSubBatches.map(subBatch => (
                                <li key={subBatch.id}>• {subBatch.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You are not assigned to any batches yet.
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {studentAttendance.length > 0 ? (
                <div className="space-y-4">
                  {studentAttendance.slice(0, 5).map(record => {
                    const batch = batches.find(b => b.id === record.batchId);
                    const subBatch = batch?.subBatches.find(
                      sb => sb.id === record.subBatchId
                    );
                    
                    const studentRecord = record.records.find(
                      r => r.studentId === studentUser.id
                    );
                    
                    if (!studentRecord) return null;
                    
                    return (
                      <div key={record.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {batch?.name} - {subBatch?.name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            studentRecord.status === 'present'
                              ? 'bg-attendance-present/10 text-attendance-present'
                              : 'bg-attendance-absent/10 text-attendance-absent'
                          }`}
                        >
                          {studentRecord.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No attendance records found.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
