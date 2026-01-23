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
import { Heart, Users, TrendingUp, Shield, Plus, Loader2, CheckCircle, Circle, Share2, Trash2, Trophy, PartyPopper } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface Pledge {
  id: string;
  user_id: string;
  pledge_title: string;
  status: string;
  created_at: string;
  support_count?: number;
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
  const [togglingPledgeId, setTogglingPledgeId] = useState<string | null>(null);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [filter, setFilter] = useState<"all" | "active" | "completed" | "mine">("all");
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
        support_count: 0,
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

    setTogglingPledgeId(pledge.id);
    const newStatus = pledge.status === "active" ? "completed" : "active";

    // Check for first completion
    const isFirstCompletion =
      newStatus === "completed" &&
      pledges.filter(p => p.user_id === user?.id && p.status === "completed").length === 0;

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
    } else {
      // Optimistic update
      setPledges((prev) =>
        prev.map((p) => (p.id === pledge.id ? { ...p, status: newStatus } : p))
      );

      toast({
        title: newStatus === "completed" ? "Pledge Completed! 🎉" : "Pledge Re-activated",
        description: newStatus === "completed"
          ? "Amazing job on fulfilling your commitment!"
          : "Your pledge is now active again.",
      });

      if (isFirstCompletion) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0EA5E9', '#22C55E', '#F59E0B']
        });
        setTimeout(() => setShowRewardDialog(true), 500);
      }
    }
    setTogglingPledgeId(null);
  };

  const handleDeletePledge = async (pledgeId: string) => {
    const { error } = await supabase
      .from("pledges")
      .delete()
      .eq("id", pledgeId);

    if (error) {
      toast({
        title: "Failed to delete",
        description: "Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pledge deleted",
        description: "Your pledge has been removed.",
      });
    }
  };

  const handleSendSupport = (pledgeId: string) => {
    setPledges(prev => prev.map(p =>
      p.id === pledgeId ? { ...p, support_count: (p.support_count || 0) + 1 } : p
    ));
    toast({
      title: "Support Sent! ❤️",
      description: "You've sent encouragement to this community member.",
    });
  };

  const handleShare = (pledge: Pledge) => {
    navigator.clipboard.writeText(`Check out this pledge on MindHaven: "${pledge.pledge_title}"`);
    toast({
      title: "Link copied!",
      description: "Pledge shared to your clipboard.",
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
    let matchesFilter = true;
    if (filter === "active") matchesFilter = pledge.status === "active";
    else if (filter === "completed") matchesFilter = pledge.status === "completed";
    else if (filter === "mine") matchesFilter = pledge.user_id === user?.id;

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
                      variant={filter === "mine" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter("mine")}
                    >
                      My Pledges
                    </Button>
                  )}
                </div>

                {/* Pledges List */}
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="shadow-soft border-l-4 border-l-muted/20">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-20 w-full mb-6" />
                          <div className="flex justify-between items-center pt-2 border-t border-muted/10">
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredPledges.length === 0 ? (
                  <Card className="shadow-soft border-dashed border-2 bg-muted/5">
                    <CardContent className="p-16 text-center">
                      <div className="w-20 h-20 rounded-full bg-primary/5 mx-auto mb-6 flex items-center justify-center animate-pulse">
                        <Heart className="w-10 h-10 text-primary/40" />
                      </div>
                      <h3 className="font-display font-bold text-2xl mb-3 text-foreground">
                        {searchQuery ? "No matches found" : "Start the Movement"}
                      </h3>
                      <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
                        {searchQuery
                          ? `We couldn't find any pledges matching "${searchQuery}". Try broadening your search or clearing filters.`
                          : "This space is waiting for your first commitment. Every journey begins with a single step."}
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        {searchQuery ? (
                          <Button variant="outline" onClick={() => {setSearchQuery(""); setFilter("all");}}>
                            Clear All Filters
                          </Button>
                        ) : (
                          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Make the First Pledge
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredPledges.map((pledge) => (
                      <Card
                        key={pledge.id}
                        className={cn(
                          "shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in border-l-4",
                          pledge.status === "completed"
                            ? "border-l-success bg-success/5"
                            : "border-l-transparent hover:border-l-primary/40"
                        )}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-primary/10">
                                <AvatarImage src={pledge.profiles?.avatar_url || ""} alt={pledge.profiles?.username || "User"} />
                                <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                                  {pledge.profiles?.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-sm text-foreground">
                                  {pledge.profiles?.username || "Anonymous"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(pledge.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(pledge.status)}
                          </div>

                          <div className="pl-1">
                            <p className="text-foreground leading-relaxed mb-6 italic text-lg font-medium opacity-90">
                              "{pledge.pledge_title}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-muted/30">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendSupport(pledge.id)}
                                className="h-8 gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
                              >
                                <Heart className={cn(
                                  "w-4 h-4 group-hover:scale-110 transition-transform",
                                  (pledge.support_count || 0) > 0 && "fill-primary text-primary"
                                )} />
                                <span className="text-xs font-medium">
                                  {(pledge.support_count || 0) > 0 ? pledge.support_count : "Support"}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(pledge)}
                                className="h-8 px-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {pledge.user_id === user?.id && (
                              <div className="flex items-center gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Pledge?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently remove your pledge from the community.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeletePledge(pledge.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={togglingPledgeId === pledge.id}
                                  onClick={() => handleToggleStatus(pledge)}
                                  className={cn(
                                    "h-8 gap-2 font-medium transition-all",
                                    pledge.status === "completed"
                                      ? "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                      : "text-primary hover:bg-primary/5"
                                  )}
                                >
                                  {togglingPledgeId === pledge.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : pledge.status === "completed" ? (
                                    <>
                                      <Circle className="w-4 h-4" />
                                      Re-activate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Complete
                                    </>
                                  )}
                                </Button>
                              </div>
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
                {/* Community Impact Card */}
                <Card className="shadow-soft overflow-hidden border-none bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-display">Community Impact</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-primary tracking-tight">
                          {isLoading ? "..." : pledges.length}
                        </p>
                        <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                          Pledges
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-success tracking-tight">
                          {isLoading ? "..." : pledges.filter(p => p.status === 'completed').length}
                        </p>
                        <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                          Goals
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-bold text-accent-foreground tracking-tight">
                          {isLoading ? "..." : pledges.reduce((acc, p) => acc + (p.support_count || 0), 0)}
                        </p>
                        <p className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                          Support
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((topic) => (
                        <button
                          key={topic.tag}
                          onClick={() => {
                            setSearchQuery(topic.tag);
                            if (filter === "mine") setFilter("all");
                          }}
                          className="px-3 py-1.5 rounded-full bg-secondary/10 hover:bg-primary/10 border border-primary/5 transition-colors flex items-center gap-2 group"
                        >
                          <span className="text-primary font-medium text-xs group-hover:underline">{topic.tag}</span>
                          <span className="text-[10px] text-muted-foreground/60">{topic.count}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Guidelines */}
                <Card className="shadow-soft border-none bg-success/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-success" />
                      <CardTitle className="text-lg font-display">Community Guidelines</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {guidelines.slice(0, 2).map((guideline) => (
                        <div key={guideline.title}>
                          <p className="font-semibold text-xs text-foreground">{guideline.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{guideline.description}</p>
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

      {/* First Completion Reward Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-center text-2xl">First Milestone Reached!</DialogTitle>
            <DialogDescription className="text-center text-lg pt-2">
              Congratulations! You've completed your first community pledge.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-background p-3 rounded-lg shadow-sm border border-primary/20">
                <PartyPopper className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h4 className="font-bold text-foreground">Community Contributor Badge</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You've taken a significant step in your journey. This badge recognizes your commitment to positive change.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowRewardDialog(false)}
              className="w-full sm:w-auto px-12"
            >
              Continue Journey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
