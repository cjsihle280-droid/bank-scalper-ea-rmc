import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Terminal, Shield, KeyRound, Zap, TrendingUp } from "lucide-react";

interface LicenseEntryProps {
  onLicensed: () => void;
  onAdminClick: () => void;
}

const MatrixRain = () => {
  const columns = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
      {columns.map((col) => (
        <div
          key={col}
          className="absolute text-primary text-xs font-mono"
          style={{
            left: `${col * 5}%`,
            animation: `matrix-rain ${3 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        >
          {Array.from({ length: 15 }, () =>
            String.fromCharCode(0x30A0 + Math.random() * 96)
          ).join("\n")}
        </div>
      ))}
    </div>
  );
};

const LicenseEntry = ({ onLicensed, onAdminClick }: LicenseEntryProps) => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Check for stored license on mount
  useEffect(() => {
    const stored = localStorage.getItem("bse_license");
    if (stored) {
      onLicensed();
    }
  }, [onLicensed]);

  // Floating particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        const next = [...prev, { id: Date.now(), x: Math.random() * 100, y: 100 + Math.random() * 10 }];
        return next.slice(-12);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!key.trim()) {
      setError("License key required");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      if (key.length >= 8) {
        localStorage.setItem("bse_license", key);
        onLicensed();
      } else {
        setError("Invalid license key");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <MatrixRain />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, opacity: 0, scale: 0 }}
          animate={{ y: "-10vh", opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: 4, ease: "easeOut" }}
          className="absolute w-1 h-1 rounded-full bg-primary"
        />
      ))}

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-px bg-primary/10 animate-scanline" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Logo area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ boxShadow: ["0 0 10px hsl(142 70% 45% / 0.2)", "0 0 30px hsl(142 70% 45% / 0.5)", "0 0 10px hsl(142 70% 45% / 0.2)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-lg border border-border bg-card"
          >
            <Zap className="w-10 h-10 text-primary" />
          </motion.div>

          <div>
            <h1 className="text-3xl font-bold tracking-wider text-glow">
              <span className="text-foreground">BANK</span>{" "}
              <span className="text-primary">SCALPER</span>{" "}
              <span className="text-foreground">EA</span>
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3"
            />
            <p className="text-muted-foreground text-sm mt-3 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Professional Trading System
            </p>
          </div>
        </motion.div>

        {/* License Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="border border-border bg-card/80 backdrop-blur-sm p-6 rounded-lg space-y-5 glow-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border pb-3">
              <KeyRound className="w-3 h-3 text-primary" />
              <span className="tracking-widest">LICENSE_AUTHENTICATION</span>
              <div className="ml-auto flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-primary/50" />
                <span className="w-2 h-2 rounded-full bg-primary/20" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">License Key</label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="bg-background border-border text-foreground font-mono text-center text-lg tracking-[0.3em] placeholder:text-muted-foreground/30 placeholder:tracking-[0.3em] focus:ring-primary focus:border-primary h-12"
                maxLength={50}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-destructive text-xs flex items-center gap-1"
                >
                  <span>▸</span> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-mono uppercase tracking-widest text-sm h-11 relative overflow-hidden group"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              {loading ? (
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  VALIDATING...
                </motion.span>
              ) : (
                "ACTIVATE LICENSE"
              )}
            </Button>
          </div>
        </motion.form>

        {/* Admin Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <button
            onClick={onAdminClick}
            className="text-muted-foreground hover:text-primary text-xs inline-flex items-center gap-1.5 transition-all duration-300 hover:gap-2"
          >
            <Shield className="w-3 h-3" />
            Admin Access
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-muted-foreground/40 text-[10px] tracking-[0.3em]"
        >
          v3.1.0 • ENCRYPTED • AES-256
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LicenseEntry;
