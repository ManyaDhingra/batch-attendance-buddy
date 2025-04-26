
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { BarChart, Calendar, Users } from "lucide-react";

const AdminDashboard = () => {
  const { batches, students, attendanceRecords } = useData();

  // Calculate statistics
  const totalStudents = students.length;
  const totalBatches = batches.length;
  const totalSubBatches = batches.reduce(
    (acc, batch) => acc + batch.subBatches.length,
    0
  );
  
  // Calculate attendance percentage
  const totalAttendanceRecords = attendanceRecords.reduce(
    (acc, record) => acc + record.records.length,
    0
  );
  
  const presentAttendance = attendanceRecords.reduce(
    (acc, record) => acc + record.records.filter(r => r.status === 'present').length,
    0
  );
  
  const attendancePercentage = totalAttendanceRecords > 0
    ? Math.round((presentAttendance / totalAttendanceRecords) * 100)
    : 0;

  return (
    <Layout requireAuth requireAdmin>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to the Attendance Buddy admin dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Batches
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBatches}</div>
              <p className="text-xs text-muted-foreground">
                {totalSubBatches} sub-batches
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Attendance
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}%</div>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceRecords.length}
              </div>
              <p className="text-xs text-muted-foreground">
                attendance records
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Batches</CardTitle>
            </CardHeader>
            <CardContent>
              {batches.length > 0 ? (
                <div className="space-y-4">
                  {batches.slice(0, 5).map((batch) => (
                    <div key={batch.id} className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {batch.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {batch.students.length} students, {batch.subBatches.length} sub-batches
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No batches created yet.</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4">
                  {students.slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID: {student.studentId} - {student.batches.length} batches
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No students added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
