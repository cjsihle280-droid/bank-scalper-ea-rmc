import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Key, Shield, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MatrixRain from "@/components/MatrixRain";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin", {
        body: { action: "login", password },
      });

      if (error) throw error;
      if (data?.success) {
        sessionStorage.setItem("admin_authenticated", password);
        toast.success("Admin access granted");
        navigate("/admin/dashboard");
      } else {
        toast.error("Invalid password");
      }
    } catch {
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <MatrixRain />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-card">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-widest">
            <span className="text-primary">ADMIN</span>
            <span className="text-foreground"> ACCESS</span>
          </h1>
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-lg border border-border bg-card/80 p-6 backdrop-blur-sm"
          style={{ boxShadow: "0 0 30px hsl(145 80% 42% / 0.08)" }}
        >
          <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground">
              <Key className="h-3.5 w-3.5" />
              ADMIN_AUTHENTICATION
            </div>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
            </div>
          </div>

          <label className="mb-2 block text-xs tracking-[0.2em] text-muted-foreground">
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="mb-4 w-full rounded-md border border-border bg-input px-4 py-3 text-center font-mono text-sm tracking-[0.3em] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary py-3 text-xs font-bold tracking-[0.3em] text-primary-foreground transition-all hover:brightness-110 disabled:opacity-70"
          >
            {isLoading ? "VERIFYING..." : "ACCESS ADMIN PANEL"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 text-xs tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
