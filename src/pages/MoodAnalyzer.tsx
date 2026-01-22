import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Loader2,
  Lock,
  Pencil,
  Cpu,
  Lightbulb,
  CheckCircle,
  Calendar,
  MessageSquare,
  ArrowRight,
  Brain,
  Heart,
  Wind,
  History
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const analysisSteps = [
  { icon: Pencil, label: "Input Thoughts", description: "Waiting for you to type..." },
  { icon: Cpu, label: "AI Processing", description: "Natural Language Analysis" },
  { icon: Lightbulb, label: "Personalized Insights", description: "Strategies & Support" },
];

const loadingMessages = [
  "Listening to your thoughts...",
  "Analyzing emotional patterns...",
  "Crafting personalized support...",
  "Finalizing your insights..."
];

interface MoodLog {
  id: string;
  mood_text: string;
  ai_response: string | null;
  mood_score: number;
  created_at: string;
}

export default function MoodAnalyzer() {
  const [moodText, setMoodText] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMoodHistory();
    }
  }, [user]);

  const fetchMoodHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setMoodHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use the mood analyzer.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: { pathname: "/mood-analyzer" } } });
      return;
    }

    if (!moodText.trim()) {
      toast({
        title: "Please share your thoughts",
        description: "Write how you're feeling before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setCurrentStep(1);
    setAiResponse(null);
    setMoodScore(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-mood", {
        body: { moodText: moodText.trim() },
      });

      if (error) {
        throw error;
      }

      setCurrentStep(2);
      setAiResponse(data.aiResponse);
      setMoodScore(data.moodScore);

      // Save to mood_logs
      const { error: saveError } = await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood_text: moodText.trim(),
        ai_response: data.aiResponse,
        mood_score: data.moodScore,
      });

      if (saveError) {
        console.error("Error saving mood log:", saveError);
      } else {
        toast({
          title: "Mood logged!",
          description: "Your entry has been saved to your journey.",
        });
        fetchMoodHistory();
      }
    } catch (error) {
      console.error("Error analyzing mood:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
      setCurrentStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodLabel = (score: number) => {
    if (score <= 3) return {
      label: "Needs Support",
      color: "bg-destructive text-destructive-foreground",
      barColor: "bg-destructive",
      icon: Heart,
      recommendation: "Consider reaching out to a professional or someone you trust."
    };
    if (score <= 5) return {
      label: "Struggling",
      color: "bg-warning text-warning-foreground",
      barColor: "bg-warning",
      icon: Brain,
      recommendation: "Take a few minutes for a guided breathing exercise."
    };
    if (score <= 7) return {
      label: "Neutral",
      color: "bg-muted text-muted-foreground",
      barColor: "bg-primary",
      icon: MessageSquare,
      recommendation: "Continue practicing mindfulness and self-care."
    };
    return {
      label: "Thriving",
      color: "bg-success text-success-foreground",
      barColor: "bg-success",
      icon: Sparkles,
      recommendation: "Excellent! Keep up the great habits that support your well-being."
    };
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        {/* Header Gradient */}
        <div className="absolute top-16 left-0 right-0 h-32 gradient-calm opacity-50 -z-10" />

        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Main Column */}
              <div className="lg:col-span-3 space-y-8">
                {/* Main Input Area */}
                <Card className="shadow-card border-none bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2 bg-primary/10 text-primary border-none">
                      AI MOOD CHECK-IN
                    </Badge>
                    <CardTitle className="text-2xl lg:text-3xl font-display text-primary">
                      How are you feeling today?
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Share your thoughts, worries, or joys. Our AI is here to listen, analyze your mood, and suggest personalized coping strategies.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="I've been feeling a bit overwhelmed because..."
                        value={moodText}
                        onChange={(e) => {
                          setMoodText(e.target.value);
                          if (!isAnalyzing && currentStep === 0) {
                            setCurrentStep(e.target.value.length > 0 ? 0 : 0);
                          }
                        }}
                        className="min-h-[200px] resize-none text-base bg-white/50 border-muted focus:border-primary/50 transition-colors"
                        maxLength={2000}
                        disabled={isAnalyzing}
                      />
                      <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {moodText.length}/2000
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
                        <Lock className="w-3.5 h-3.5" />
                        Private & Anonymous
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !moodText.trim()}
                        className="gradient-primary border-0 shadow-lg shadow-primary/20"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Analyze My Mood
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Reflections */}
                {user && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <History className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-display font-semibold">Recent Reflections</h3>
                      </div>
                      {moodHistory.length > 0 && (
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Last 5 entries
                        </span>
                      )}
                    </div>

                    {isLoadingHistory ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                      </div>
                    ) : moodHistory.length > 0 ? (
                      <div className="grid gap-4">
                        {moodHistory.map((entry) => {
                          const mood = getMoodLabel(entry.mood_score);
                          return (
                            <Card key={entry.id} className="bg-white/40 backdrop-blur-sm border-muted/50 hover:border-primary/30 transition-all hover:shadow-soft group">
                              <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                  <Badge className={`${mood.color} border-none shadow-sm`} variant="secondary">
                                    {mood.label}
                                  </Badge>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(entry.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              <p className="text-sm text-foreground line-clamp-2 italic mb-3 text-muted-foreground group-hover:text-foreground transition-colors">
                                "{entry.mood_text}"
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t border-muted/30">
                                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  AI Insight saved
                                </div>
                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                              </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-muted/10 rounded-2xl border-2 border-dashed border-muted/50">
                        <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Pencil className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-muted-foreground">No recent reflections yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Start by sharing how you feel above.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Analysis Status */}
                <Card className="shadow-soft border-none bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-display">Analysis Status</CardTitle>
                      <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${aiResponse ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : isAnalyzing ? "bg-primary animate-pulse" : "bg-muted"}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisSteps.map((step, index) => (
                        <div key={step.label} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                            index < currentStep ? "bg-success text-success-foreground shadow-sm shadow-success/20" :
                            index === currentStep && isAnalyzing ? "bg-primary text-primary-foreground animate-pulse-soft shadow-lg shadow-primary/20" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {index < currentStep ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <step.icon className="w-4 h-4" />
                            )}
                          </div>
                          <div className={`transition-all duration-500 ${index === currentStep && isAnalyzing ? "border-l-2 border-primary pl-3 -ml-3" : ""}`}>
                            <p className={`font-medium text-sm transition-colors ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {index === currentStep && isAnalyzing ? loadingMessages[loadingMessageIndex] : step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Results Card */}
                <Card className="shadow-soft overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display">Your Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiResponse && moodScore ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {(() => {
                          const mood = getMoodLabel(moodScore);
                          const MoodIcon = mood.icon;
                          return (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <div className="flex items-center gap-2">
                                    <MoodIcon className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{mood.label}</span>
                                  </div>
                                  <span className="text-muted-foreground">{moodScore}/10</span>
                                </div>
                                <Progress value={moodScore * 10} className={`h-2 ${mood.barColor}`} />
                              </div>

                              <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-primary/5">
                                <div className="flex items-start gap-3">
                                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                  <p className="text-sm text-foreground leading-relaxed italic whitespace-pre-wrap">
                                    {aiResponse}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Recommended Actions
                                </p>
                                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-2">
                                  <p className="text-xs text-primary font-medium">{mood.recommendation}</p>
                                </div>
                                <div className="grid gap-2">
                                  {moodScore <= 5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="justify-start gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                                      onClick={() => navigate("/breathing")}
                                    >
                                      <Wind className="w-4 h-4" />
                                      Try Breathing Exercise
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                                    onClick={() => navigate("/wellness-tips")}
                                  >
                                    <Lightbulb className="w-4 h-4" />
                                    View Wellness Tips
                                  </Button>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (

                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm">Insights Await</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Once you share your feelings, your personalized AI insights and coping strategies will appear here.
                        </p>
                      </div>
                    )}
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
