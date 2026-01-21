import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Lock, Pencil, Cpu, Lightbulb, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const analysisSteps = [
  { icon: Pencil, label: "Input Thoughts", description: "Waiting for you to type..." },
  { icon: Cpu, label: "AI Processing", description: "Natural Language Analysis" },
  { icon: Lightbulb, label: "Personalized Insights", description: "Strategies & Support" },
];

export default function MoodAnalyzer() {
  const [moodText, setMoodText] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        {/* Header Gradient */}
        <div className="absolute top-16 left-0 right-0 h-32 gradient-calm opacity-50 -z-10" />

        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Main Input Area */}
              <div className="lg:col-span-3">
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
                        className="min-h-[200px] resize-none text-base"
                        maxLength={2000}
                        disabled={isAnalyzing}
                      />
                      <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {moodText.length}/2000
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        Your entries are private & anonymous
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !moodText.trim()}
                        className="gradient-primary border-0"
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
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                {/* Analysis Status */}
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-display">Analysis Status</CardTitle>
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
                          <div className={index === currentStep && isAnalyzing ? "border-l-2 border-primary pl-3 -ml-3" : ""}>
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

                {/* Results Card */}
                <Card className="shadow-soft">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display">Preview Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiResponse && moodScore ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getMoodLabel(moodScore).color}>
                            {getMoodLabel(moodScore).label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Score: {moodScore}/10</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {aiResponse}
                        </p>
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
