import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Sparkles, ArrowLeft, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const stories = [
  {
    name: "Sarah J.",
    role: "University Student",
    image: "https://i.pravatar.cc/150?u=sarah",
    story: "MindHaven has been a game-changer for my exam anxiety. The AI mood analyzer helped me identify my triggers, and the breathing exercises are now part of my daily routine.",
    benefit: "Reduced stress by 40%",
  },
  {
    name: "David M.",
    role: "Software Engineer",
    image: "https://i.pravatar.cc/150?u=david",
    story: "I used to struggle with burnout and didn't know how to articulate my feelings. Using MindHaven's journal daily has given me so much clarity and peace of mind.",
    benefit: "Improved focus and sleep",
  },
  {
    name: "Elena R.",
    role: "Teacher",
    image: "https://i.pravatar.cc/150?u=elena",
    story: "The community pledges keep me accountable. Knowing that others are also working on their mental health makes me feel less alone in my journey.",
    benefit: "Consistent self-care habits",
  },
];

export default function SuccessStories() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-center justify-start">
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                COMMUNITY STORIES
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground">Success Stories</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Real stories from real people who have found their haven with MindHaven.
              </p>
            </div>

            <div className="space-y-8">
              {stories.map((story, index) => (
                <Card key={index} className="border-none shadow-elevated overflow-hidden group">
                  <CardContent className="p-8 md:p-12">
                    <div className="grid md:grid-cols-4 gap-8 items-start">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="w-24 h-24 border-4 border-primary/10">
                          <AvatarImage src={story.image} alt={story.name} />
                          <AvatarFallback>{story.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg">{story.name}</p>
                          <p className="text-sm text-muted-foreground">{story.role}</p>
                        </div>
                      </div>
                      <div className="md:col-span-3 space-y-6 relative">
                        <Quote className="absolute -top-4 -left-4 w-12 h-12 text-primary/5 -z-10" />
                        <p className="text-xl text-foreground/90 italic leading-relaxed">
                          "{story.story}"
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                            <Heart className="w-4 h-4" />
                            {story.benefit}
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            <MessageSquare className="w-4 h-4" />
                            Verified Haven User
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50 border-2 border-dashed border-muted-foreground/20">
              <CardContent className="p-12 text-center space-y-6">
                <h3 className="text-2xl font-display font-bold">Want to share your story?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Your journey can inspire others. Join our community and share your progress.
                </p>
                <Button asChild size="lg" className="gradient-primary border-0">
                  <Link to="/signup">Join MindHaven Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
