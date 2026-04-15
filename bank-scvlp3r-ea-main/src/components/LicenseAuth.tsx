import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LicenseAuth = () => {
  const [licenseKey, setLicenseKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const navigate = useNavigate();

  // Check for existing valid session
  useEffect(() => {
    const savedKey = localStorage.getItem("license_key");
    if (savedKey) {
      validateStoredKey(savedKey);
    }
  }, []);

  const validateStoredKey = async (key: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin", {
        body: { action: "validate_key", licenseKey: key },
      });
      if (error) throw error;
      if (data?.valid) {
        navigate("/dashboard");
      } else {
        localStorage.removeItem("license_key");
        localStorage.removeItem("license_data");
      }
    } catch {
      // Keep on login page if validation fails
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setIsActivating(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin", {
        body: { action: "activate_key", licenseKey },
      });

      if (error) throw error;

      if (data?.valid) {
        localStorage.setItem("license_key", licenseKey);
        localStorage.setItem("license_data", JSON.stringify(data.key));
        toast.success("License activated successfully!");
        navigate("/dashboard");
      } else {
        toast.error(data?.error || "Invalid license key");
      }
    } catch {
      toast.error("Failed to validate license key");
    } finally {
      setIsActivating(false);
    }
  };

  const formatLicenseKey = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join("-").slice(0, 19);
  };

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-card">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-widest sm:text-4xl">
          <span className="text-foreground">BANK </span>
          <span className="text-primary">SCALPER </span>
          <span className="text-foreground">EA</span>
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm tracking-[0.3em] text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Professional Trading System
        </p>
      </div>

      {/* License Card */}
      <form
        onSubmit={handleActivate}
        className="w-full max-w-md rounded-lg border border-border bg-card/80 p-6 backdrop-blur-sm"
        style={{ boxShadow: "0 0 30px hsl(145 80% 42% / 0.08), 0 0 60px hsl(145 80% 42% / 0.04)" }}
      >
        {/* Card Header */}
        <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground">
            <Key className="h-3.5 w-3.5" />
            LICENSE_AUTHENTICATION
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
          </div>
        </div>

        {/* Input */}
        <label className="mb-2 block text-xs tracking-[0.2em] text-muted-foreground">
          LICENSE KEY
        </label>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(formatLicenseKey(e.target.value))}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="mb-4 w-full rounded-md border border-border bg-input px-4 py-3 text-center font-mono text-sm tracking-[0.3em] text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {/* Button */}
        <button
          type="submit"
          disabled={isActivating}
          className="w-full rounded-md bg-primary py-3 text-xs font-bold tracking-[0.3em] text-primary-foreground transition-all hover:brightness-110 disabled:opacity-70"
          style={{
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
        >
          {isActivating ? "AUTHENTICATING..." : "ACTIVATE LICENSE"}
        </button>
      </form>

      {/* Admin link */}
      <button
        onClick={() => navigate("/admin")}
        className="mt-6 flex items-center gap-2 text-xs tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="h-1.5 w-1.5 rounded-full border border-muted-foreground" />
        Admin Access
      </button>

      {/* Footer */}
      <p className="mt-6 text-[10px] tracking-[0.3em] text-muted-foreground/50">
        v3.1.0 • ENCRYPTED • AES-256
      </p>
    </div>
  );
};

export default LicenseAuth;
