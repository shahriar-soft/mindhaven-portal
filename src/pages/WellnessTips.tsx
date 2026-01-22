import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Coffee, Heart, Brain, Smile, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tips = [
  {
    category: "Sleep",
    icon: Moon,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    items: [
      "Keep a consistent sleep schedule, even on weekends.",
      "Create a relaxing bedtime routine (no screens 30 mins before).",
      "Keep your bedroom cool, dark, and quiet.",
    ]
  },
  {
    category: "Mindfulness",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    items: [
      "Practice 5 minutes of mindful breathing daily.",
      "Try the 5-4-3-2-1 grounding technique when stressed.",
      "Be present in your current activity without judgment.",
    ]
  },
  {
    category: "Daily Habits",
    icon: Coffee,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    items: [
      "Drink at least 8 glasses of water a day.",
      "Take short breaks every hour if you're working at a desk.",
      "Spend at least 15 minutes outdoors in natural light.",
    ]
  },
  {
    category: "Emotional Well-being",
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    items: [
      "Practice gratitude: write down 3 things you're thankful for.",
      "Be kind to yourself—talk to yourself like you would a friend.",
      "Reach out to a friend or loved one for a quick chat.",
    ]
  }
];

export default function WellnessTips() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium">
                <Sun className="w-4 h-4" />
                DAILY WELLNESS
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground">Wellness Tips</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Small changes can make a big difference. Explore these curated tips to help you maintain a balanced and healthy mind.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tips.map((category) => (
                <Card key={category.category} className="border-none shadow-soft overflow-hidden group">
                  <CardHeader className={`${category.bgColor} flex flex-row items-center gap-4 py-4`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                    <CardTitle className="text-lg font-display">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ul className="space-y-4">
                      {category.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className={`w-1.5 h-1.5 rounded-full ${category.color.replace('text-', 'bg-')} mt-1.5 shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="gradient-primary text-primary-foreground border-none">
              <CardContent className="p-8 text-center space-y-4">
                <Smile className="w-12 h-12 mx-auto" />
                <h3 className="text-xl font-display font-bold">Remember, you're doing great.</h3>
                <p className="opacity-90 max-w-lg mx-auto">
                  Wellness is a journey, not a destination. Take one step at a time and be patient with yourself.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
