import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Key, Plus, Trash2, ToggleLeft, ToggleRight, LogOut, Copy, RefreshCw, Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MatrixRain from "@/components/MatrixRain";

interface LicenseKey {
  id: string;
  license_key: string;
  status: string;
  activated_by: string | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiresIn, setExpiresIn] = useState("30");
  const navigate = useNavigate();

  const adminPassword = sessionStorage.getItem("admin_authenticated");

  useEffect(() => {
    if (!adminPassword) {
      navigate("/admin");
      return;
    }
    fetchKeys();
  }, [adminPassword, navigate]);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin", {
        body: { action: "list_keys", password: adminPassword },
      });
      if (error) throw error;
      setKeys(data?.keys || []);
    } catch {
      toast.error("Failed to fetch keys");
    } finally {
      setIsLoading(false);
    }
  }, [adminPassword]);

  const generateKey = async () => {
    setIsGenerating(true);
    try {
      const expiresAt = expiresIn
        ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase.functions.invoke("admin", {
        body: { action: "generate_key", password: adminPassword, expiresAt },
      });
      if (error) throw error;
      toast.success(`Key generated: ${data.key.license_key}`);
      fetchKeys();
    } catch {
      toast.error("Failed to generate key");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleKey = async (id: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "deactivate_key" : "reactivate_key";
    try {
      const { error } = await supabase.functions.invoke("admin", {
        body: { action, password: adminPassword, keyId: id },
      });
      if (error) throw error;
      toast.success(`Key ${action === "deactivate_key" ? "deactivated" : "reactivated"}`);
      fetchKeys();
    } catch {
      toast.error("Failed to update key");
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this key?")) return;
    try {
      const { error } = await supabase.functions.invoke("admin", {
        body: { action: "delete_key", password: adminPassword, keyId: id },
      });
      if (error) throw error;
      toast.success("Key deleted");
      fetchKeys();
    } catch {
      toast.error("Failed to delete key");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Key copied to clipboard");
  };

  const logout = () => {
    sessionStorage.removeItem("admin_authenticated");
    navigate("/admin");
  };

  const statusColor = (status: string) => {
    if (status === "active") return "text-primary";
    if (status === "inactive") return "text-yellow-500";
    return "text-destructive";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <MatrixRain />
      <div className="relative z-10 min-h-screen p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="font-display text-xl font-bold tracking-widest text-foreground">
              ADMIN <span className="text-primary">DASHBOARD</span>
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            LOGOUT
          </button>
        </div>

        {/* Generate Key */}
        <div className="mb-6 rounded-lg border border-border bg-card/80 p-4 backdrop-blur-sm">
          <h2 className="mb-3 flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
            GENERATE_NEW_KEY
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[10px] tracking-widest text-muted-foreground">
                EXPIRES IN (DAYS)
              </label>
              <input
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-28 rounded-md border border-border bg-input px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                min="1"
              />
            </div>
            <button
              onClick={generateKey}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-xs font-bold tracking-widest text-primary-foreground transition-all hover:brightness-110 disabled:opacity-70"
            >
              <Key className="h-3.5 w-3.5" />
              {isGenerating ? "GENERATING..." : "GENERATE KEY"}
            </button>
            <button
              onClick={fetchKeys}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              REFRESH
            </button>
          </div>
        </div>

        {/* Keys Table */}
        <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm">
          <div className="border-b border-border p-4">
            <h2 className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted-foreground">
              <Key className="h-3.5 w-3.5" />
              LICENSE_KEYS ({keys.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No license keys generated yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 tracking-widest">KEY</th>
                    <th className="p-3 tracking-widest">STATUS</th>
                    <th className="p-3 tracking-widest">CREATED</th>
                    <th className="p-3 tracking-widest">EXPIRES</th>
                    <th className="p-3 tracking-widest">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b border-border/50 transition-colors hover:bg-muted/20">
                      <td className="p-3 font-mono tracking-wider text-foreground">
                        <span className="flex items-center gap-2">
                          {key.license_key}
                          <button onClick={() => copyKey(key.license_key)} className="text-muted-foreground hover:text-primary">
                            <Copy className="h-3 w-3" />
                          </button>
                        </span>
                      </td>
                      <td className={`p-3 font-bold uppercase tracking-widest ${statusColor(key.status)}`}>
                        {key.status}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(key.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {key.expires_at ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(key.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          "Never"
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleKey(key.id, key.status)}
                            className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                            title={key.status === "active" ? "Deactivate" : "Reactivate"}
                          >
                            {key.status === "active" ? (
                              <ToggleRight className="h-4 w-4 text-primary" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteKey(key.id)}
                            className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
