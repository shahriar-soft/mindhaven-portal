import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Pencil, Trash2, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface MoodLog {
  id: string;
  mood_text: string;
  ai_response: string | null;
  mood_score: number | null;
  created_at: string;
  updated_at: string;
}

function DashboardContent() {
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLog, setEditingLog] = useState<MoodLog | null>(null);
  const [editText, setEditText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMoodLogs();
    }
  }, [user]);

  const fetchMoodLogs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching mood logs:", error);
      toast({
        title: "Error loading your journey",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } else {
      setMoodLogs(data || []);
    }
    setIsLoading(false);
  };

  const handleEdit = (log: MoodLog) => {
    setEditingLog(log);
    setEditText(log.mood_text);
  };

  const handleSaveEdit = async () => {
    if (!editingLog || !editText.trim()) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("mood_logs")
      .update({ mood_text: editText.trim() })
      .eq("id", editingLog.id);

    if (error) {
      toast({
        title: "Failed to update",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entry updated",
        description: "Your mood log has been updated.",
      });
      setMoodLogs(moodLogs.map(log => 
        log.id === editingLog.id ? { ...log, mood_text: editText.trim() } : log
      ));
      setEditingLog(null);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase
      .from("mood_logs")
      .delete()
      .eq("id", deletingId);

    if (error) {
      toast({
        title: "Failed to delete",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Entry deleted",
        description: "Your mood log has been removed.",
      });
      setMoodLogs(moodLogs.filter(log => log.id !== deletingId));
    }
    setDeletingId(null);
  };

  const getMoodLabel = (score: number | null) => {
    if (!score) return { label: "Unknown", color: "bg-muted text-muted-foreground" };
    if (score <= 3) return { label: "Needs Support", color: "bg-destructive/10 text-destructive" };
    if (score <= 5) return { label: "Struggling", color: "bg-warning/10 text-warning" };
    if (score <= 7) return { label: "Neutral", color: "bg-muted text-muted-foreground" };
    return { label: "Thriving", color: "bg-success/10 text-success" };
  };

  const averageScore = moodLogs.length > 0
    ? Math.round(moodLogs.reduce((acc, log) => acc + (log.mood_score || 0), 0) / moodLogs.filter(l => l.mood_score).length)
    : null;

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                My Journey
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.username || "friend"}! Here's your mental wellness journey.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{moodLogs.length}</p>
                      <p className="text-sm text-muted-foreground">Total Check-ins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{averageScore || "–"}</p>
                      <p className="text-sm text-muted-foreground">Avg Mood Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {moodLogs[0] ? format(new Date(moodLogs[0].created_at), "MMM d") : "–"}
                      </p>
                      <p className="text-sm text-muted-foreground">Last Check-in</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Logs List */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Your Mood Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </div>
                ) : moodLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">No entries yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your wellness journey by checking in with our AI Mood Analyzer.
                    </p>
                    <Button asChild className="gradient-primary border-0">
                      <a href="/mood-analyzer">Start First Check-in</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moodLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 space-y-3 hover:shadow-soft transition-shadow">
                        <div className="flex items-center justify-between">
                          <Badge className={getMoodLabel(log.mood_score).color}>
                            {getMoodLabel(log.mood_score).label} ({log.mood_score}/10)
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(log.created_at), "MMM d, yyyy • h:mm a")}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(log)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeletingId(log.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">Your thoughts:</p>
                          <p className="text-sm text-muted-foreground">{log.mood_text}</p>
                        </div>
                        {log.ai_response && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-foreground mb-1">AI Insights:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.ai_response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Entry</DialogTitle>
            <DialogDescription>
              Update your mood log entry. Note: AI insights won't be regenerated.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[150px]"
            disabled={isSaving}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLog(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || !editText.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your mood log entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
