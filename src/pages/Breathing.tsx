import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wind, ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

type BreathingPhase = "Inhale" | "Hold" | "Exhale" | "Reset";

export default function Breathing() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>("Inhale");
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let timer: any;

    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === "Inhale") {
              setPhase("Hold");
              return 4;
            } else if (phase === "Hold") {
              setPhase("Exhale");
              return 4;
            } else if (phase === "Exhale") {
              setPhase("Reset");
              return 4;
            } else {
              setPhase("Inhale");
              setCycleCount((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setPhase("Inhale");
    setTimeLeft(4);
    setCycleCount(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "Inhale": return "Breathe In";
      case "Hold": return "Hold";
      case "Exhale": return "Breathe Out";
      case "Reset": return "Hold";
      default: return "";
    }
  };

  const getCircleScale = () => {
    if (!isActive) return "scale-100";
    switch (phase) {
      case "Inhale": return "scale-150";
      case "Hold": return "scale-150";
      case "Exhale": return "scale-100";
      case "Reset": return "scale-100";
      default: return "scale-100";
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-start">
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Wind className="w-4 h-4" />
                BOX BREATHING
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground">Guided Breathing</h1>
              <p className="text-muted-foreground">
                Follow the circle to regulate your breath and calm your mind.
              </p>
            </div>

            <Card className="shadow-elevated overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-primary/10">
              <CardContent className="p-12 flex flex-col items-center space-y-12">
                {/* Breathing Circle */}
                <div className="relative flex items-center justify-center w-64 h-64">
                  <div
                    className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`}
                  />
                  <div
                    className={`absolute inset-4 rounded-full bg-primary/40 transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`}
                  />
                  <div className="relative z-10 text-center">
                    <p className="text-2xl font-display font-bold text-primary mb-2">
                      {isActive ? getPhaseText() : "Ready?"}
                    </p>
                    <p className="text-5xl font-bold text-foreground tabular-nums">
                      {timeLeft}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 w-full">
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={toggleTimer}
                      size="lg"
                      className="w-32 gradient-primary border-0"
                    >
                      {isActive ? (
                        <>
                          <Pause className="mr-2 w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 w-4 h-4" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetTimer}
                      variant="outline"
                      size="lg"
                      className="w-32"
                    >
                      <RotateCcw className="mr-2 w-4 h-4" />
                      Reset
                    </Button>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-6">
                    <p>Cycles Completed: <span className="font-bold text-foreground">{cycleCount}</span></p>
                    <p>Technique: 4-4-4-4</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 text-left">
                <p className="font-bold text-sm">Reduce Anxiety</p>
                <p className="text-xs text-muted-foreground mt-1">Slows down the nervous system and lowers cortisol.</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-left">
                <p className="font-bold text-sm">Improve Focus</p>
                <p className="text-xs text-muted-foreground mt-1">Oxygenates the brain for better mental clarity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
