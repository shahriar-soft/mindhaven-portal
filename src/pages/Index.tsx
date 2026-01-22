import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { ArrowRight, Play, Sun, Wind, Phone, Sparkles, Smile, Brain, Heart, Shield } from "lucide-react";
import heroGradient from "@/assets/hero-gradient.jpg";

const features = [
  {
    icon: Sun,
    title: "Wellness Tips",
    description: "Discover daily habits and small changes to boost your mood, improve focus, and build resilience.",
    action: "View Community",
    link: "/community",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Wind,
    title: "Breathing Exercises",
    description: "Guided sessions ranging from 1 to 10 minutes to help you reduce anxiety and regain composure quickly.",
    action: "Start AI Check-in",
    link: "/mood-analyzer",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Phone,
    title: "Emergency Contacts",
    description: "Immediate professional help is available 24/7. You don't have to go through difficult times alone.",
    action: "Emergency Resources",
    link: "#emergency-support",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-POWERED WELLNESS
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-foreground leading-tight text-balance">
                Your journey to{" "}
                <span className="text-primary">wellness</span> starts here.
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                MindHaven uses advanced AI to help you understand your emotions, track your mood, and find personalized resources for a balanced mind.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gradient-primary border-0 h-12 px-6">
                  <Link to="/mood-analyzer">
                    Start AI Check-in
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6">
                  <a href="#how-it-works">
                    <Play className="mr-2 w-4 h-4" />
                    How it works
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <div className="flex -space-x-2">
                  {["#E5DEFF", "#FFDEE2", "#F2FCE2"].map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-[10px] font-bold text-foreground/50">
                        {["JD", "AS", "MK"][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by <span className="font-semibold text-foreground">10,000+</span> students
                </p>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src={heroGradient}
                  alt="Calming gradient illustration"
                  className="w-full aspect-[4/3] object-cover"
                />
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Smile className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Feeling calm & focused</p>
                      <p className="text-xs text-muted-foreground">Today, 9:41 AM</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-success rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              How MindHaven works
            </h2>
            <p className="text-lg text-muted-foreground">
              A simple, three-step process to help you maintain your mental well-being and find peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Share Your Thoughts",
                description: "Type how you're feeling into our AI-powered mood analyzer. It's completely private and secure.",
                icon: Sparkles,
              },
              {
                step: "02",
                title: "Get AI Insights",
                description: "Our advanced AI analyzes your emotional state and provides personalized feedback and coping strategies.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Take Action",
                description: "Use our recommended breathing exercises, wellness tips, or connect with our supportive community.",
                icon: Smile,
              },
            ].map((item, index) => (
              <div key={index} className="relative space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 md:translate-x-4 text-6xl font-display font-bold text-primary/5 -z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Tools for your well-being
            </h2>
            <p className="text-lg text-muted-foreground">
              Access curated resources designed to help you find balance and peace in your daily life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover:shadow-card transition-all duration-300 border-border/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto text-primary font-medium group-hover:gap-2 transition-all">
                    {feature.link?.startsWith('#') ? (
                      <a href={feature.link}>
                        {feature.action}
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <Link to={feature.link || "#"}>
                        {feature.action}
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support Section */}
      <section id="emergency-support" className="py-20 lg:py-28 bg-destructive/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-card border-2 border-destructive/20 rounded-3xl p-8 lg:p-12 shadow-elevated">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-10 h-10 text-destructive" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <h2 className="text-3xl font-display font-bold text-foreground">Emergency Support</h2>
                <p className="text-lg text-muted-foreground">
                  If you are in immediate danger or need urgent help, please contact these services available 24/7.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="font-bold text-lg">Emergency Services</p>
                    <p className="text-primary text-2xl font-bold">911</p>
                    <p className="text-xs text-muted-foreground">Available for immediate emergencies</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="font-bold text-lg">Crisis Text Line</p>
                    <p className="text-primary text-2xl font-bold">741741</p>
                    <p className="text-xs text-muted-foreground">Text HOME to connect with a Counselor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 gradient-calm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Ready to find your haven?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of others who have started their journey towards a balanced mind and a healthier life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="gradient-primary border-0 h-12 px-8">
                <Link to="/signup">Join the Community</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link to="/community">Read Success Stories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
