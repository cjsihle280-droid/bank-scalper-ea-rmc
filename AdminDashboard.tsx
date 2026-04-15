import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Users, Key, Trash2, Plus, Activity,
  Ban, CheckCircle2, RotateCcw, Search
} from "lucide-react";

interface AdminDashboardProps {
  onBack: () => void;
}

interface License {
  id: string;
  key: string;
  user: string;
  status: "active" | "inactive" | "revoked";
  created: string;
}

const initialLicenses: License[] = [
  { id: "1", key: "BSEA-7F3K-QM9X-W2LP", user: "trader_01", status: "active", created: "2025-01-15" },
  { id: "2", key: "BSEA-4R8N-HJ6T-Y5VC", user: "trader_02", status: "active", created: "2025-02-20" },
  { id: "3", key: "BSEA-1D5G-ZA3B-K8MF", user: "trader_03", status: "inactive", created: "2024-11-05" },
  { id: "4", key: "BSEA-9P2E-XC7S-N4UW", user: "trader_04", status: "revoked", created: "2024-09-12" },
];

const generateKey = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `BSEA-${segment()}-${segment()}-${segment()}`;
};

const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [licenses, setLicenses] = useState<License[]>(initialLicenses);
  const [search, setSearch] = useState("");

  const addLicense = () => {
    const license: License = {
      id: Date.now().toString(),
      key: generateKey(),
      user: "unassigned",
      status: "active",
      created: new Date().toISOString().split("T")[0],
    };
    setLicenses([license, ...licenses]);
  };

  const toggleStatus = (id: string) => {
    setLicenses(licenses.map(l => {
      if (l.id !== id) return l;
      if (l.status === "active") return { ...l, status: "inactive" as const };
      if (l.status === "inactive") return { ...l, status: "active" as const };
      return l;
    }));
  };

  const revokeLicense = (id: string) => {
    setLicenses(licenses.map(l => l.id === id ? { ...l, status: "revoked" as const } : l));
  };

  const reactivateLicense = (id: string) => {
    setLicenses(licenses.map(l => l.id === id ? { ...l, status: "active" as const } : l));
  };

  const deleteLicense = (id: string) => {
    setLicenses(licenses.filter(l => l.id !== id));
  };

  const filtered = licenses.filter(l =>
    l.key.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "TOTAL", value: licenses.length, icon: Key, color: "text-foreground" },
    { label: "ACTIVE", value: licenses.filter(l => l.status === "active").length, icon: CheckCircle2, color: "text-primary" },
    { label: "INACTIVE", value: licenses.filter(l => l.status === "inactive").length, icon: Ban, color: "text-yellow-500" },
    { label: "REVOKED", value: licenses.filter(l => l.status === "revoked").length, icon: Trash2, color: "text-destructive" },
  ];

  const statusConfig = {
    active: { color: "text-primary", bg: "bg-primary/10 border-primary/30", icon: CheckCircle2 },
    inactive: { color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30", icon: Ban },
    revoked: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: Trash2 },
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(142 70% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(142 70% 45%) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={onBack}
            className="text-muted-foreground hover:text-primary text-xs flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> EXIT
          </motion.button>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            <span className="tracking-widest">BANK SCALPER EA</span>
            <span className="text-primary">• ADMIN</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border border-border bg-card/80 backdrop-blur-sm p-4 rounded-lg text-center hover:glow-border transition-all duration-300"
            >
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                className={`text-3xl font-bold ${color}`}
              >
                {value}
              </motion.div>
              <div className="text-[10px] text-muted-foreground tracking-widest mt-1">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Add License + Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex gap-2 flex-1">
            <Button onClick={addLicense} className="bg-primary text-primary-foreground hover:bg-primary/80 font-mono text-xs gap-1 flex-1 sm:flex-none">
              <Plus className="w-3 h-3" /> GENERATE NEW KEY
            </Button>
          </div>
          <div className="relative">
            <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-card border-border text-foreground font-mono pl-8 w-full sm:w-48"
            />
          </div>
        </motion.div>

        {/* License Cards */}
        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {filtered.map((l, i) => {
              const cfg = statusConfig[l.status];
              return (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`border ${cfg.bg} bg-card/60 backdrop-blur-sm rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 group hover:bg-card transition-all duration-300`}
                >
                  {/* Key info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium tracking-wider truncate">{l.key}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> {l.user}
                      </span>
                      <span>{l.created}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${cfg.color}`}>
                    <cfg.icon className="w-3 h-3" />
                    {l.status}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {l.status !== "revoked" && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleStatus(l.id)}
                        className={`p-2 rounded border text-xs transition-colors ${
                          l.status === "active"
                            ? "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                            : "border-primary/30 text-primary hover:bg-primary/10"
                        }`}
                        title={l.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {l.status === "active" ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </motion.button>
                    )}

                    {l.status === "revoked" ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => reactivateLicense(l.id)}
                        className="p-2 rounded border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                        title="Reactivate"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => revokeLicense(l.id)}
                        className="p-2 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        title="Revoke"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteLicense(l.id)}
                      className="p-2 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-12">No licenses found</div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
