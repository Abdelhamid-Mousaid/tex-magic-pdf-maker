import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <div className="text-center bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page introuvable</p>
        <a href="/" className="text-primary hover:text-primary/80 underline transition-colors">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
