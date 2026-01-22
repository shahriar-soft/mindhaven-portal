import { Layout } from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is MindHaven?",
    answer: "MindHaven is an AI-powered mental health platform designed to provide accessible wellness tools, mood tracking, and personalized resources to help individuals maintain their mental well-being."
  },
  {
    question: "How does the AI Mood Analyzer work?",
    answer: "The AI Mood Analyzer uses advanced natural language processing to understand the emotional context of your thoughts. It then provides personalized insights and suggests coping strategies based on your current emotional state."
  },
  {
    question: "Is my data private and secure?",
    answer: "Yes, your privacy is our top priority. All personal reflections and mood logs are encrypted and stored securely. We do not sell your data to third parties."
  },
  {
    question: "Is MindHaven a replacement for therapy?",
    answer: "No, MindHaven is a supportive tool for daily wellness and is not a replacement for professional clinical therapy or medical advice. If you are experiencing a mental health crisis, please reach out to professional emergency services."
  },
  {
    question: "How can I join the community?",
    answer: "You can join our community by creating an account. Once registered, you'll be able to access shared stories and connect with others on similar wellness journeys."
  },
  {
    question: "What should I do in an emergency?",
    answer: "If you are in immediate danger or need urgent help, please call 999 (in the UK) or your local emergency number. You can also find crisis support resources on our Emergency Support section."
  }
];

export default function FAQ() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <HelpCircle className="w-4 h-4" />
                SUPPORT
              </div>
              <h1 className="text-4xl font-display font-bold text-foreground">Frequently Asked Questions</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about MindHaven and how we can help you on your wellness journey.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card rounded-2xl p-6 shadow-soft border border-border">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0">
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="bg-muted/30 rounded-2xl p-8 text-center space-y-4">
              <h3 className="text-xl font-display font-semibold text-foreground">Still have questions?</h3>
              <p className="text-muted-foreground">
                We're here to help. Reach out to our support team for more information.
              </p>
              <Button asChild className="gradient-primary border-0">
                <a href="mailto:support@mindhaven.com">Contact Support</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
