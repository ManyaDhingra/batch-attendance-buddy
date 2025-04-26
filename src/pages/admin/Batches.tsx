
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash } from "lucide-react";

const BatchesPage = () => {
  const { batches, addBatch, deleteBatch } = useData();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subBatches, setSubBatches] = useState([
    { id: `sub-${Date.now()}`, name: "", description: "" }
  ]);

  const handleAddSubBatch = () => {
    setSubBatches([...subBatches, { id: `sub-${Date.now()}`, name: "", description: "" }]);
  };

  const handleRemoveSubBatch = (id: string) => {
    setSubBatches(subBatches.filter(subBatch => subBatch.id !== id));
  };

  const handleSubBatchChange = (id: string, field: 'name' | 'description', value: string) => {
    setSubBatches(
      subBatches.map(subBatch => 
        subBatch.id === id ? { ...subBatch, [field]: value } : subBatch
      )
    );
  };

  const handleSubmit = () => {
    addBatch({
      name,
      description,
      subBatches: subBatches.map(sb => ({
        ...sb,
        students: []
      })),
      students: []
    });
    
    // Reset form and close dialog
    setName("");
    setDescription("");
    setSubBatches([{ id: `sub-${Date.now()}`, name: "", description: "" }]);
    setOpen(false);
  };

  return (
    <Layout requireAuth requireAdmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Batches</h2>
            <p className="text-muted-foreground">
              Manage your student batches and sub-batches.
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Add a new batch with sub-batches for organizing students.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Batch Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter batch name" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Enter batch description" 
                  />
                </div>
                
                <Separator className="my-2" />
                
                <div>
                  <Label>Sub-batches</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create at least one sub-batch for attendance tracking.
                  </p>
                  
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-4">
                      {subBatches.map((subBatch, index) => (
                        <div key={subBatch.id} className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Sub-batch {index + 1}</h4>
                            {subBatches.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSubBatch(subBatch.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`subBatchName${index}`}>Name</Label>
                            <Input 
                              id={`subBatchName${index}`} 
                              value={subBatch.name} 
                              onChange={e => handleSubBatchChange(subBatch.id, 'name', e.target.value)} 
                              placeholder="Enter sub-batch name" 
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor={`subBatchDesc${index}`}>Description (Optional)</Label>
                            <Input 
                              id={`subBatchDesc${index}`} 
                              value={subBatch.description} 
                              onChange={e => handleSubBatchChange(subBatch.id, 'description', e.target.value)} 
                              placeholder="Enter sub-batch description" 
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddSubBatch}
                        className="w-full mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Another Sub-batch
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!name || subBatches.some(sb => !sb.name)}
                >
                  Create Batch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.length > 0 ? (
            batches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{batch.name}</CardTitle>
                      <CardDescription>
                        {batch.students.length} Students · {batch.subBatches.length} Sub-batches
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBatch(batch.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Sub-batches:</h4>
                    <ul className="space-y-1">
                      {batch.subBatches.map((subBatch) => (
                        <li key={subBatch.id} className="text-sm">
                          • {subBatch.name}
                          {subBatch.description && (
                            <span className="text-muted-foreground"> - {subBatch.description}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.location.href = `/admin/attendance?batchId=${batch.id}`}
                    >
                      Take Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex justify-center p-12">
              <div className="text-center">
                <h3 className="text-lg font-medium">No batches created</h3>
                <p className="text-muted-foreground">
                  Create your first batch to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BatchesPage;
