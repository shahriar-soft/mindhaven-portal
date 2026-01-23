import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Users, TrendingUp, Shield, Plus, Loader2, CheckCircle, Circle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Pledge {
  id: string;
  user_id: string;
  pledge_title: string;
  status: string;
  created_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const trendingTopics = [
  { tag: "#AnxietySupport", count: "2.4k" },
  { tag: "#ExamSeason", count: "1.8k" },
  { tag: "#MorningRoutine", count: "940" },
  { tag: "#SelfCareSunday", count: "856" },
];

const guidelines = [
  { title: "Be Kind & Respectful", description: "This is a judgment-free zone. Treat everyone with empathy." },
  { title: "Respect Privacy", description: "Do not share personal identifiable information of yourself or others." },
  { title: "Support, Don't Diagnose", description: "Offer support and experiences, but leave medical advice to professionals." },
];

export default function Community() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPledge, setNewPledge] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPledges();
    
    // Set up realtime subscription
    const channel = supabase
      .channel("pledges-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pledges",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the full pledge with profile info
            fetchSinglePledge(payload.new.id);
          } else if (payload.eventType === "UPDATE") {
            setPledges((prev) =>
              prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
            );
          } else if (payload.eventType === "DELETE") {
            setPledges((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPledges = async () => {
    setIsLoading(true);
    const { data: pledgesData, error: pledgesError } = await supabase
      .from("pledges")
      .select("*")
      .order("created_at", { ascending: false });

    if (pledgesError) {
      console.error("Error fetching pledges:", pledgesError);
      toast({
        title: "Error loading pledges",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } else {
      const userIds = [...new Set((pledgesData || []).map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      const pledgesWithProfiles = (pledgesData || []).map(p => ({
        ...p,
        profiles: profilesMap[p.user_id] || null
      }));

      setPledges(pledgesWithProfiles as Pledge[]);
    }
    setIsLoading(false);
  };

  const fetchSinglePledge = async (id: string) => {
    const { data: pledgeData, error: pledgeError } = await supabase
      .from("pledges")
      .select("*")
      .eq("id", id)
      .single();

    if (pledgeData) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", pledgeData.user_id)
        .single();

      const fullPledge = {
        ...pledgeData,
        profiles: profileData
      };

      setPledges((prev) => [fullPledge as Pledge, ...prev.filter((p) => p.id !== id)]);
    }
  };

  const handleCreatePledge = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a pledge.",
        variant: "destructive",
      });
      return;
    }

    if (!newPledge.trim()) {
      toast({
        title: "Please enter a pledge",
        description: "Write what you're committing to.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("pledges").insert({
      user_id: user.id,
      pledge_title: newPledge.trim(),
      status: "active",
    });

    if (error) {
      console.error("Error creating pledge:", error);
      toast({
        title: "Failed to create pledge",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pledge created!",
        description: "Your commitment is now visible to the community.",
      });
      setNewPledge("");
      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (pledge: Pledge) => {
    if (pledge.user_id !== user?.id) return;

    const newStatus = pledge.status === "active" ? "completed" : "active";
    const { error } = await supabase
      .from("pledges")
      .update({ status: newStatus })
      .eq("id", pledge.id);

    if (error) {
      toast({
        title: "Failed to update",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendSupport = (pledgeId: string) => {
    toast({
      title: "Support Sent! ❤️",
      description: "You've sent encouragement to this community member.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>;
    }
  };

  const filteredPledges = pledges.filter((pledge) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && pledge.status === "active") ||
      (filter === "completed" && pledge.status === "completed");

    const matchesSearch =
      pledge.pledge_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pledge.profiles?.username || "Anonymous").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                  Community Pledges
                </h1>
                <p className="text-muted-foreground">
                  Connect, share, and grow with others on a similar journey. A safe space for every mind.
                </p>
              </div>
              <div className="w-full md:w-64">
                <Input
                  placeholder="Search pledges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap items-center">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All Pledges
                  </Button>
                  <Button
                    variant={filter === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </Button>
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilter("all");
                        setSearchQuery(profile?.username || "Anonymous");
                      }}
                      className="text-xs text-muted-foreground ml-auto"
                    >
                      My Pledges
                    </Button>
                  )}
                </div>

                {/* Pledges List */}
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="shadow-soft">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-16 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredPledges.length === 0 ? (
                  <Card className="shadow-soft">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {searchQuery ? "No matching pledges" : "No pledges yet"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery
                          ? "Try adjusting your search or filters."
                          : "Be the first to make a mental health commitment!"}
                      </p>
                      {searchQuery && (
                        <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredPledges.map((pledge) => (
                      <Card key={pledge.id} className="shadow-soft hover:shadow-card transition-shadow animate-fade-in">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-semibold text-primary">
                                  {pledge.profiles?.username?.[0]?.toUpperCase() || "U"}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {pledge.profiles?.username || "Anonymous"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(pledge.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(pledge.status)}
                          </div>
                          <p className="text-foreground mb-4">{pledge.pledge_title}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendSupport(pledge.id)}
                              className="gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              Send Support
                            </Button>
                            {pledge.user_id === user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(pledge)}
                                className="gap-2 ml-auto"
                              >
                                {pledge.status === "completed" ? (
                                  <>
                                    <Circle className="w-4 h-4" />
                                    Mark as Active
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Complete
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Create Pledge Card */}
                <Card className="shadow-card gradient-primary text-primary-foreground overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="font-display font-bold text-lg mb-2">Start a New Pledge</h3>
                    <p className="text-primary-foreground/80 text-sm mb-4">
                      Create a commitment to share your thoughts or ask for advice.
                    </p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full">
                          Create Pledge
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make Your Pledge</DialogTitle>
                          <DialogDescription>
                            Share a mental health commitment with the community.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Input
                            placeholder="I pledge to walk 30 minutes every day..."
                            value={newPledge}
                            onChange={(e) => setNewPledge(e.target.value)}
                            disabled={isSubmitting}
                            maxLength={140}
                          />
                          <div className="flex justify-end">
                            <span className={`text-xs ${newPledge.length > 130 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {newPledge.length}/140
                            </span>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreatePledge} disabled={isSubmitting || !newPledge.trim()}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Pledge
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <CardTitle className="text-lg font-display">Trending Topics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trendingTopics.map((topic) => (
                        <button
                          key={topic.tag}
                          onClick={() => setSearchQuery(topic.tag)}
                          className="w-full flex items-center justify-between hover:bg-muted/50 p-1 rounded-md transition-colors"
                        >
                          <span className="text-primary font-medium text-sm">{topic.tag}</span>
                          <span className="text-xs text-muted-foreground">{topic.count}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Guidelines */}
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success" />
                      <CardTitle className="text-lg font-display">Guidelines</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {guidelines.map((guideline) => (
                        <div key={guideline.title}>
                          <p className="font-medium text-sm text-foreground">{guideline.title}</p>
                          <p className="text-xs text-muted-foreground">{guideline.description}</p>
                        </div>
                      ))}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 mt-4 text-primary text-sm">
                          Read Full Guidelines →
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Community Guidelines</DialogTitle>
                          <DialogDescription>
                            Help us keep MindHaven a safe and supportive space for everyone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm text-foreground">
                          <div>
                            <h4 className="font-semibold mb-1">1. Respectful Communication</h4>
                            <p className="text-muted-foreground">Always use kind and empathetic language. Disagreements are okay, but personal attacks are not.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">2. No Medical Advice</h4>
                            <p className="text-muted-foreground">While sharing experiences is encouraged, do not provide medical diagnoses or prescribe treatments.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">3. Privacy is Priority</h4>
                            <p className="text-muted-foreground">Keep your personal details safe. Do not post phone numbers, addresses, or private identifiers.</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">4. Crisis Resources</h4>
                            <p className="text-muted-foreground">If you are in immediate danger, please use our Emergency Support resources or call your local emergency services.</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
