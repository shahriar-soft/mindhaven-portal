import { Link } from "react-router-dom";
import { Brain, Twitter, Github } from "lucide-react";

const productLinks = [
  { to: "/mood-analyzer", label: "Mood Analyzer" },
  { to: "/community", label: "Community" },
  { to: "/dashboard", label: "Dashboard" },
];

const supportLinks = [
  { to: "#", label: "Crisis Line" },
  { to: "#", label: "FAQ" },
  { to: "#", label: "Privacy Policy" },
  { to: "#", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                MindHaven
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              MindHaven provides accessible mental health tools powered by AI to help students and individuals thrive in their daily lives.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 mt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2024 MindHaven. All rights reserved.
          </p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
