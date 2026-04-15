import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

const AdminLogin = ({ onBack, onSuccess }: AdminLoginProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Password required");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (password === "admin123") {
        onSuccess();
      } else {
        setError("Access denied");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(142 70% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(142 70% 45%) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-6 relative z-10"
      >
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          className="text-muted-foreground hover:text-primary text-xs flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> BACK
        </motion.button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-border bg-card/80 backdrop-blur-sm p-8 rounded-lg space-y-6 glow-border"
        >
          <div className="text-center space-y-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
            </motion.div>
            <div className="text-xs text-muted-foreground tracking-widest flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              ADMIN AUTHENTICATION
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background border-border text-foreground font-mono text-center text-lg tracking-widest h-12"
                maxLength={100}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-xs text-center"
                >
                  ▸ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-destructive/90 text-destructive-foreground hover:bg-destructive font-mono uppercase tracking-widest text-sm h-11"
            >
              {loading ? (
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.6, repeat: Infinity }}>
                  AUTHENTICATING...
                </motion.span>
              ) : (
                "ADMIN LOGIN"
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
