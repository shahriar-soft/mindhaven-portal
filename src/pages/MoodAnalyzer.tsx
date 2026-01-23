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
  History,
  TrendingUp,
  Quote,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  XCircle,
  Copy,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const moodOptions = [
  { emoji: "😊", label: "Happy", color: "bg-green-50 text-green-700 border-green-200", prompts: ["What's making you feel good today?", "How can you share this joy?"] },
  { emoji: "😔", label: "Sad", color: "bg-blue-50 text-blue-700 border-blue-200", prompts: ["What's on your mind?", "What do you need right now?"] },
  { emoji: "😰", label: "Anxious", color: "bg-purple-50 text-purple-700 border-purple-200", prompts: ["What's causing you worry?", "What's within your control?"] },
  { emoji: "😫", label: "Stressed", color: "bg-orange-50 text-orange-700 border-orange-200", prompts: ["What's feeling heavy right now?", "What can you let go of?"] },
  { emoji: "😌", label: "Calm", color: "bg-teal-50 text-teal-700 border-teal-200", prompts: ["What's helping you stay grounded?", "How does this peace feel?"] },
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

const emotionEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😔",
  anxious: "😰",
  stressed: "😫",
  overwhelmed: "🤯",
  calm: "😌",
  excited: "🤩",
  angry: "😠",
  frustrated: "😤",
  lonely: "👤",
  hopeful: "✨",
  tired: "😴",
  grateful: "🙏",
  thoughtful: "🤔",
};

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
  const [visiblePrompts, setVisiblePrompts] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [activeFocus, setActiveFocus] = useState<number | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
    shufflePrompts();
  }, [user]);

  const shufflePrompts = (moodPrompts?: string[]) => {
    const basePrompts = moodPrompts || journalingPrompts;
    const shuffled = [...basePrompts].sort(() => 0.5 - Math.random());
    setVisiblePrompts(shuffled.slice(0, 2));
  };

  const handleMoodSelect = (mood: typeof moodOptions[0]) => {
    setSelectedMood(mood.label);
    shufflePrompts(mood.prompts);
    setMoodText(""); // Optional: clear or keep? Let's clear to focus on the new mood prompts
  };

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Insight copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
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
    if (score <= 3) return { label: "Needs Support", color: "bg-destructive/10 text-destructive border-destructive/20" };
    if (score <= 5) return { label: "Struggling", color: "bg-warning/10 text-warning border-warning/20" };
    if (score <= 7) return { label: "Neutral", color: "bg-muted text-muted-foreground border-muted-foreground/20" };
    return { label: "Thriving", color: "bg-success/10 text-success border-success/20" };
  };

  const chartData = [...history].reverse().map(log => ({
    date: format(new Date(log.created_at), "MMM d"),
    score: log.mood_score
  }));

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        {/* Header Gradient */}
        <div className="absolute top-16 left-0 right-0 h-64 gradient-calm opacity-30 -z-10" />

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
                    {/* Mood Selector */}
                    <div className="space-y-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">How are you feeling?</span>
                      <div className="flex flex-wrap gap-3">
                        {moodOptions.map((mood) => (
                          <button
                            key={mood.label}
                            onClick={() => handleMoodSelect(mood)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:shadow-sm ${
                              selectedMood === mood.label
                                ? `${mood.color} ring-2 ring-primary/20 scale-105`
                                : "bg-background border-muted-foreground/20 hover:border-primary/50"
                            }`}
                          >
                            <span className="text-xl">{mood.emoji}</span>
                            <span className="text-sm font-medium">{mood.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Journaling Prompts */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suggested Prompts</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={shufflePrompts}
                          className="h-7 text-xs text-primary hover:text-primary/80"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Refresh
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {visiblePrompts.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => setMoodText(prompt)}
                            className="text-left p-3 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-primary group animate-in fade-in duration-500"
                          >
                            <div className="flex items-center gap-3">
                              <MessageSquare className="w-4 h-4 text-primary/50 group-hover:text-primary" />
                              <span className="leading-tight">{prompt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative group">
                      <Textarea
                        placeholder="I've been feeling a bit overwhelmed because..."
                        value={moodText}
                        onChange={(e) => {
                          setMoodText(e.target.value);
                          if (!isAnalyzing && currentStep !== 0) {
                            setCurrentStep(0);
                          }
                        }}
                        className="min-h-[200px] resize-none text-base transition-all focus:shadow-md"
                        maxLength={2000}
                        disabled={isAnalyzing}
                      />
                      <div className="absolute bottom-3 right-3 flex items-center gap-3">
                        {moodText && !isAnalyzing && (
                          <button
                            onClick={() => setMoodText("")}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Clear text"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <span className={`text-xs font-medium ${
                          moodText.length > 1800 ? "text-destructive" :
                          moodText.length > 1500 ? "text-warning" :
                          "text-muted-foreground"
                        }`}>
                          {moodText.length}/2000
                        </span>
                      </div>
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
                            <Sparkles className="mr-2 h-4 w-4 animate-float" />
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
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 font-display">
                            <Sparkles className="w-5 h-5 text-primary" />
                            AI Insights
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAiResponse(null);
                                setMoodText("");
                                setSelectedMood(null);
                                setActiveFocus(null);
                                setCurrentStep(0);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="h-8 text-xs text-muted-foreground hover:text-primary"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              New Entry
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(aiResponse.insight)}
                              className="h-8 w-8 p-0"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            </Button>
                            <Badge className={getMoodLabel(aiResponse.moodScore).color}>
                              {getMoodLabel(aiResponse.moodScore).label}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-muted-foreground">Mood Score</span>
                            <span className="text-primary">{aiResponse.moodScore}/10</span>
                          </div>
                          <Progress
                            value={aiResponse.moodScore * 10}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {aiResponse.emotions.map((emotion) => (
                            <Badge key={emotion} variant="secondary" className="bg-primary/10 text-primary border-0 capitalize flex items-center gap-1">
                              <span>{emotionEmojis[emotion.toLowerCase()] || "✨"}</span>
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                        <div className="relative bg-muted/30 p-4 rounded-xl border border-muted-foreground/10">
                          <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/10" />
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap italic">
                            {aiResponse.insight}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-warning" />
                            Actionable Strategies
                          </h4>
                          {activeFocus !== null && (
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              Focused on tip #{activeFocus + 1}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {aiResponse.tips.map((tip, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setActiveFocus(i === activeFocus ? null : i);
                                if (i !== activeFocus) {
                                  toast({
                                    title: "Focus Set",
                                    description: "Great! Try focusing on this one thing today.",
                                  });
                                }
                              }}
                              className={`p-4 rounded-xl text-left text-sm border transition-all relative group ${
                                activeFocus === i
                                  ? "border-primary bg-primary/5 shadow-sm scale-[1.02]"
                                  : "bg-muted/50 hover:border-primary/30"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold ${activeFocus === i ? "text-primary" : "text-muted-foreground"}`}>
                                  {i + 1}.
                                </span>
                                {activeFocus === i ? (
                                  <CheckCircle className="w-4 h-4 text-primary" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />
                                )}
                              </div>
                              {tip}
                            </button>
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
                  <Card className="shadow-soft bg-muted/30 border-primary/10 overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                    <CardHeader>
                      <CardTitle className="text-xl font-display text-primary">Track Your Journey</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Sign in to save your mood logs, track your emotional trends over time, and see your personal growth.
                      </p>
                      <Button asChild variant="outline" className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                        <Link to="/login">
                          Join MindHaven
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Analysis Status - Only show when analyzing */}
                {isAnalyzing && (
                  <Card className="shadow-soft border-primary/20 animate-in fade-in zoom-in-95">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-display text-primary flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysisSteps.map((step, index) => (
                          <div key={step.label} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              index < currentStep ? "bg-success text-success-foreground" :
                              index === currentStep ? "bg-primary text-primary-foreground animate-pulse-soft" :
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
                )}

                {/* My Journey - Consolidated History and Trend */}
                {user && (
                  <Card className="shadow-soft">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-display text-primary">My Journey</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {history.length > 0 ? (
                        <Tabs defaultValue="history" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                            <TabsTrigger value="trend" className="text-xs" disabled={history.length < 2}>Trend</TabsTrigger>
                          </TabsList>

                          <TabsContent value="history" className="space-y-4 mt-0 animate-in fade-in duration-300">
                            <div className="space-y-3">
                              {history.slice(0, 3).map((log) => (
                                <div key={log.id} className="text-sm p-3 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                      {format(new Date(log.created_at), "MMM d, h:mm a")}
                                    </span>
                                    <Badge variant="outline" className={`text-[10px] h-4 px-1 ${getMoodLabel(log.mood_score).color} border`}>
                                      {log.mood_score}/10
                                    </Badge>
                                  </div>
                                  <p className="line-clamp-2 text-xs text-muted-foreground italic">
                                    "{log.mood_text}"
                                  </p>
                                </div>
                              ))}
                            </div>
                            <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80 hover:bg-primary/5 text-xs">
                              <Link to="/dashboard">
                                View Full Journey
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Link>
                            </Button>
                          </TabsContent>

                          <TabsContent value="trend" className="mt-0 animate-in fade-in duration-300">
                            <div className="h-[180px] w-full mt-2">
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
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <History className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm text-muted-foreground">Your journey begins here.</p>
                          <p className="text-xs text-muted-foreground/70">Analyze your first mood to see trends.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Mindfulness Quote */}
                <Card className="shadow-soft bg-gradient-to-br from-primary/5 to-primary/10 border-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Quote className="w-12 h-12" />
                  </div>
                  <CardContent className="p-6 relative">
                    <p className="text-sm font-medium text-primary/80 leading-relaxed italic">
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
