import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Wifi, WifiOff, Clock, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AttendanceStatus } from "@/types";

const AttendancePage = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const urlBatchId = searchParams.get('batchId');

  const { batches, students, recordAttendance, attendanceRecords } = useData();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBatchId, setSelectedBatchId] = useState<string>(urlBatchId || "");
  const [selectedSubBatchId, setSelectedSubBatchId] = useState<string>("");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  
  const selectedBatch = batches.find(batch => batch.id === selectedBatchId);
  const selectedSubBatch = selectedBatchId && selectedSubBatchId
    ? selectedBatch?.subBatches.find(subBatch => subBatch.id === selectedSubBatchId)
    : null;
  
  const batchStudents = selectedSubBatch
    ? students.filter(student => selectedSubBatch.students.includes(student.id))
    : selectedBatch
    ? students.filter(student => selectedBatch.students.includes(student.id))
    : [];
  
  const existingAttendanceRecord = selectedBatchId && selectedSubBatchId
    ? attendanceRecords.find(
        record => 
          record.batchId === selectedBatchId && 
          record.subBatchId === selectedSubBatchId && 
          new Date(record.date).toDateString() === selectedDate.toDateString()
      )
    : null;
  
  useState(() => {
    if (existingAttendanceRecord) {
      const existingAttendance: Record<string, AttendanceStatus> = {};
      existingAttendanceRecord.records.forEach(record => {
        existingAttendance[record.studentId] = record.status;
      });
      setAttendance(existingAttendance);
    } else {
      setAttendance({});
    }
  });

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-yellow-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!selectedBatchId || !selectedSubBatchId || !selectedDate) {
      toast({
        title: "Error",
        description: "Please select a batch, sub-batch, and date.",
        variant: "destructive",
      });
      return;
    }

    const records = batchStudents.map(student => ({
      studentId: student.id,
      status: attendance[student.id] || 'absent',
    }));

    if (existingAttendanceRecord) {
      toast({
        title: "Info",
        description: "Attendance for this date and batch has already been recorded. Please choose another date or batch.",
      });
      return;
    }

    recordAttendance({
      batchId: selectedBatchId,
      subBatchId: selectedSubBatchId,
      date: selectedDate,
      records,
    });
  };

  return (
    <Layout requireAuth requireAdmin>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-muted-foreground">
            Record and manage student attendance for batches.
          </p>
        </div>

        <Tabs defaultValue="record">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="record">Record Attendance</TabsTrigger>
            <TabsTrigger value="view">View Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="record" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select a Batch</Label>
                  <Select 
                    value={selectedBatchId} 
                    onValueChange={(value) => {
                      setSelectedBatchId(value);
                      setSelectedSubBatchId("");
                      setAttendance({});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedBatchId && (
                  <div className="space-y-2">
                    <Label>Select a Sub-Batch</Label>
                    <Select 
                      value={selectedSubBatchId} 
                      onValueChange={(value) => {
                        setSelectedSubBatchId(value);
                        setAttendance({});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sub-batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBatch?.subBatches.map((subBatch) => (
                          <SelectItem key={subBatch.id} value={subBatch.id}>
                            {subBatch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Card>
                    <CardContent className="p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="rounded-md border"
                        disabled={(date) => date > new Date()}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                        </h3>
                        {selectedBatch && <span className="text-sm text-muted-foreground">{selectedBatch.name}</span>}
                      </div>
                      
                      {selectedSubBatchId ? (
                        batchStudents.length > 0 ? (
                          <div className="space-y-4 mt-4">
                            {batchStudents.map(student => (
                              <div key={student.id} className="space-y-2">
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-sm text-muted-foreground">{student.studentId}</p>
                                </div>
                                <RadioGroup
                                  value={attendance[student.id] || 'absent'}
                                  onValueChange={(value: AttendanceStatus) => 
                                    handleAttendanceChange(student.id, value)
                                  }
                                  className="flex flex-wrap gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="online" id={`online-${student.id}`} />
                                    <Label htmlFor={`online-${student.id}`} className="flex items-center">
                                      <Wifi className="h-4 w-4 mr-1 text-green-500" /> Online
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="offline" id={`offline-${student.id}`} />
                                    <Label htmlFor={`offline-${student.id}`} className="flex items-center">
                                      <WifiOff className="h-4 w-4 mr-1 text-yellow-500" /> Offline
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="late" id={`late-${student.id}`} />
                                    <Label htmlFor={`late-${student.id}`} className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1 text-orange-500" /> Late
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="absent" id={`absent-${student.id}`} />
                                    <Label htmlFor={`absent-${student.id}`} className="flex items-center">
                                      <X className="h-4 w-4 mr-1 text-red-500" /> Absent
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            ))}
                            
                            <Button
                              className="w-full mt-4"
                              onClick={handleSubmit}
                              disabled={batchStudents.length === 0 || !selectedBatchId || !selectedSubBatchId}
                            >
                              Submit Attendance
                            </Button>
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-muted-foreground">No students assigned to this sub-batch.</p>
                          </div>
                        )
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-muted-foreground">Select a batch and sub-batch to record attendance.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="view" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Attendance Records</h3>
                
                {attendanceRecords.length > 0 ? (
                  <div className="space-y-4">
                    {attendanceRecords.slice().reverse().map((record) => {
                      const batch = batches.find(b => b.id === record.batchId);
                      const subBatch = batch?.subBatches.find(sb => sb.id === record.subBatchId);
                      const onlineCount = record.records.filter(r => r.status === 'online').length;
                      const totalCount = record.records.length;
                      
                      return (
                        <div key={record.id} className="border rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{format(new Date(record.date), "MMMM d, yyyy")}</p>
                              <p className="text-sm text-muted-foreground">
                                {batch?.name} - {subBatch?.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {onlineCount}/{totalCount} Online
                              </p>
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: `${(onlineCount / totalCount) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No attendance records found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AttendancePage;
