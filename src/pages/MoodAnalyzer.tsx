import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  Lock,
  Pencil,
  Cpu,
  Lightbulb,
  CheckCircle,
  History,
  TrendingUp,
  Quote,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const analysisSteps = [
  { icon: Pencil, label: "Input Thoughts", description: "Waiting for you to type..." },
  { icon: Cpu, label: "AI Processing", description: "Natural Language Analysis" },
  { icon: Lightbulb, label: "Personalized Insights", description: "Strategies & Support" },
];

const journalingPrompts = [
  "How has your energy level been today?",
  "What's one thing that made you smile recently?",
  "Is there anything specific weighing on your mind?",
  "What are you looking forward to this week?",
];

const quotes = [
  "Your feelings are valid, and you are not alone.",
  "Taking time for yourself is not selfish, it's necessary.",
  "Every small step forward is progress.",
  "Be patient with yourself. Growth takes time.",
  "You've survived 100% of your hardest days so far."
];

interface AIStructuredResponse {
  insight: string;
  moodScore: number;
  emotions: string[];
  tips: string[];
  closing: string;
}

export default function MoodAnalyzer() {
  const [moodText, setMoodText] = useState("");
  const [aiResponse, setAiResponse] = useState<AIStructuredResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setHistory(data);
    }
  };

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

    try {
      const { data, error } = await supabase.functions.invoke("analyze-mood", {
        body: { moodText: moodText.trim() },
      });

      if (error) {
        throw error;
      }

      setCurrentStep(2);
      setAiResponse(data);

      // Save to mood_logs
      const { error: saveError } = await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood_text: moodText.trim(),
        ai_response: data.insight,
        mood_score: data.moodScore,
        emotions: data.emotions,
        tips: data.tips,
      });

      if (saveError) {
        console.error("Error saving mood log:", saveError);
      } else {
        toast({
          title: "Mood logged!",
          description: "Your entry has been saved to your journey.",
        });
        fetchHistory();
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
    if (score <= 3) return { label: "Needs Support", color: "bg-destructive text-destructive-foreground" };
    if (score <= 5) return { label: "Struggling", color: "bg-warning text-warning-foreground" };
    if (score <= 7) return { label: "Neutral", color: "bg-muted text-muted-foreground" };
    return { label: "Thriving", color: "bg-success text-success-foreground" };
  };

  const chartData = [...history].reverse().map(log => ({
    date: format(new Date(log.created_at), "MMM d"),
    score: log.mood_score
  }));

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        {/* Header Gradient */}
        <div className="absolute top-16 left-0 right-0 h-32 gradient-calm opacity-50 -z-10" />

        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Input Area */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      AI MOOD CHECK-IN
                    </Badge>
                    <CardTitle className="text-2xl lg:text-3xl font-display">
                      How are you feeling today?
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Share your thoughts, worries, or joys. Our AI is here to listen, analyze your mood, and suggest personalized coping strategies.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Journaling Prompts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {journalingPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setMoodText(prompt)}
                          className="text-left p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary group"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>{prompt}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Textarea
                        placeholder="I've been feeling a bit overwhelmed because..."
                        value={moodText}
                        onChange={(e) => {
                          setMoodText(e.target.value);
                          if (!isAnalyzing && currentStep !== 0) {
                            setCurrentStep(0);
                          }
                        }}
                        className="min-h-[200px] resize-none text-base"
                        maxLength={2000}
                        disabled={isAnalyzing}
                      />
                      <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {moodText.length}/2000
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        Your entries are private & anonymous
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !moodText.trim()}
                        className="gradient-primary border-0 w-full sm:w-auto"
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

                {/* Results Display */}
                {aiResponse && (
                  <Card className="shadow-card border-primary/20 animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="bg-primary/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 font-display">
                          <Sparkles className="w-5 h-5 text-primary" />
                          AI Insights
                        </CardTitle>
                        <Badge className={getMoodLabel(aiResponse.moodScore).color}>
                          {getMoodLabel(aiResponse.moodScore).label} ({aiResponse.moodScore}/10)
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {aiResponse.emotions.map((emotion) => (
                            <Badge key={emotion} variant="secondary" className="bg-primary/10 text-primary border-0 capitalize">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {aiResponse.insight}
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-warning" />
                          Actionable Strategies
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {aiResponse.tips.map((tip, i) => (
                            <div key={i} className="p-4 rounded-xl bg-muted/50 text-sm border hover:border-primary/30 transition-colors">
                              <span className="font-bold text-primary mr-2">{i + 1}.</span>
                              {tip}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-start gap-3 bg-success/5 p-4 rounded-xl italic text-success">
                          <Quote className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm">{aiResponse.closing}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {!user && (
                  <Card className="shadow-soft bg-primary text-primary-foreground overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <CardHeader>
                      <CardTitle className="text-xl font-display">Track Your Journey</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-primary-foreground/90 leading-relaxed">
                        Sign in to save your mood logs, track your emotional trends over time, and see your personal growth.
                      </p>
                      <Button asChild variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                        <Link to="/login">
                          Join MindHaven
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Analysis Status */}
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-display text-primary">Analysis Status</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${aiResponse ? "bg-success" : "bg-muted"}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisSteps.map((step, index) => (
                        <div key={step.label} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            index < currentStep ? "bg-success text-success-foreground" :
                            index === currentStep && isAnalyzing ? "bg-primary text-primary-foreground animate-pulse-soft" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {index < currentStep ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <step.icon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className={`font-medium text-sm ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Mood Trend Chart */}
                {user && history.length > 1 && (
                  <Card className="shadow-soft">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-display flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Your Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                              dataKey="date"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: '#888' }}
                            />
                            <YAxis
                              domain={[0, 10]}
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: '#888' }}
                              width={20}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#0EA5E9"
                              strokeWidth={3}
                              dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent History */}
                {user && history.length > 0 && (
                  <Card className="shadow-soft">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-display flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Recent Logs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {history.slice(0, 3).map((log) => (
                          <div key={log.id} className="text-sm p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {format(new Date(log.created_at), "MMM d, h:mm a")}
                              </span>
                              <Badge variant="outline" className={`text-[10px] h-4 px-1 ${getMoodLabel(log.mood_score).color} border-0 text-white`}>
                                {log.mood_score}/10
                              </Badge>
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground italic">
                              "{log.mood_text}"
                            </p>
                          </div>
                        ))}
                        <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80 hover:bg-primary/5">
                          <Link to="/dashboard">
                            View Full Journey
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mindfulness Quote */}
                <Card className="shadow-soft bg-calm/10 border-none">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-primary/20 mb-2" />
                    <p className="text-sm font-medium text-primary-foreground/80 leading-relaxed italic">
                      "{randomQuote}"
                    </p>
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
