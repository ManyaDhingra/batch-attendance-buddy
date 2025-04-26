
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { Student } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentAttendancePage = () => {
  const { user } = useAuth();
  const { batches, getStudentAttendance } = useData();
  
  const studentUser = user as Student;
  const allAttendanceRecords = getStudentAttendance(studentUser.id);
  
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  
  // Filter attendance by selected batch
  const filteredAttendance = selectedBatchId
    ? allAttendanceRecords.filter(record => record.batchId === selectedBatchId)
    : allAttendanceRecords;
  
  // Further filter by selected month if applicable
  const monthFilteredAttendance = selectedMonth
    ? filteredAttendance.filter(record => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() === selectedMonth.getMonth() &&
          recordDate.getFullYear() === selectedMonth.getFullYear()
        );
      })
    : filteredAttendance;
  
  // Get student's batches
  const studentBatches = batches.filter(batch => 
    studentUser.batches.includes(batch.id)
  );
  
  // Calculate attendance statistics
  const attendanceStats = monthFilteredAttendance.reduce(
    (acc, record) => {
      const studentRecord = record.records.find(
        r => r.studentId === studentUser.id
      );
      
      if (studentRecord) {
        if (studentRecord.status === 'present') {
          return { ...acc, present: acc.present + 1 };
        } else {
          return { ...acc, absent: acc.absent + 1 };
        }
      }
      
      return acc;
    },
    { present: 0, absent: 0 }
  );
  
  const totalDays = attendanceStats.present + attendanceStats.absent;
  const attendancePercentage = totalDays > 0
    ? Math.round((attendanceStats.present / totalDays) * 100)
    : 0;

  return (
    <Layout requireAuth requireStudent>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Attendance</h2>
          <p className="text-muted-foreground">
            View and track your attendance records.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filter by Batch</Label>
              <Select
                value={selectedBatchId}
                onValueChange={setSelectedBatchId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All batches</SelectItem>
                  {studentBatches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Month</Label>
              <Card>
                <CardContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={selectedMonth}
                    onSelect={setSelectedMonth}
                    className="rounded-md border"
                    disabled={(date) => date > new Date()}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-attendance-present">
                    {attendanceStats.present}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-attendance-absent">
                    {attendanceStats.absent}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">
                    {attendancePercentage}%
                  </p>
                </div>
              </div>
              
              <div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      attendancePercentage >= 75
                        ? 'bg-attendance-present'
                        : attendancePercentage >= 50
                        ? 'bg-attendance-pending'
                        : 'bg-attendance-absent'
                    }`}
                    style={{ width: `${attendancePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="list">
              <TabsList className="mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Sub-batch</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthFilteredAttendance.length > 0 ? (
                        monthFilteredAttendance
                          .slice()
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(record => {
                            const batch = batches.find(b => b.id === record.batchId);
                            const subBatch = batch?.subBatches.find(
                              sb => sb.id === record.subBatchId
                            );
                            
                            const studentRecord = record.records.find(
                              r => r.studentId === studentUser.id
                            );
                            
                            if (!studentRecord) return null;
                            
                            return (
                              <TableRow key={record.id}>
                                <TableCell>
                                  {format(new Date(record.date), "MMMM d, yyyy")}
                                </TableCell>
                                <TableCell>{batch?.name}</TableCell>
                                <TableCell>{subBatch?.name}</TableCell>
                                <TableCell className="text-right">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      studentRecord.status === 'present'
                                        ? 'bg-attendance-present/10 text-attendance-present'
                                        : 'bg-attendance-absent/10 text-attendance-absent'
                                    }`}
                                  >
                                    {studentRecord.status === 'present' ? (
                                      <>
                                        <Check className="mr-1 h-3 w-3" />
                                        Present
                                      </>
                                    ) : (
                                      <>
                                        <X className="mr-1 h-3 w-3" />
                                        Absent
                                      </>
                                    )}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No attendance records found for the selected filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className="grid grid-cols-7 gap-px bg-muted rounded-md overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center font-medium bg-background">
                      {day}
                    </div>
                  ))}
                  
                  {/* This is a simplified calendar view. In a real application, you would render 
                      the correct days for the selected month with their attendance status. */}
                  {Array.from({ length: 35 }).map((_, index) => {
                    const day = index % 31 + 1;
                    if (day > 28 && selectedMonth?.getMonth() === 1) return null; // Handle February
                    if (day > 30 && [3, 5, 8, 10].includes(selectedMonth?.getMonth() || 0)) return null; // Handle 30-day months
                    
                    // Find attendance for this day if it exists
                    const attendanceForDay = monthFilteredAttendance.find(record => {
                      const recordDate = new Date(record.date);
                      return recordDate.getDate() === day;
                    });
                    
                    const status = attendanceForDay?.records.find(
                      r => r.studentId === studentUser.id
                    )?.status;
                    
                    return (
                      <div 
                        key={index} 
                        className={`p-2 h-20 bg-background border border-muted flex flex-col ${
                          day > 28 ? 'hidden sm:flex' : ''
                        }`}
                      >
                        <div className="text-sm">{day}</div>
                        {status && (
                          <div 
                            className={`mt-auto self-end rounded-full w-3 h-3 ${
                              status === 'present' 
                                ? 'bg-attendance-present' 
                                : 'bg-attendance-absent'
                            }`}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default StudentAttendancePage;
