import React from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Shield } from "lucide-react";

const SystemOverview = ({ integrity, rawStats, setActiveTab }) => {
  return (
    <div className="admin-panel flex flex-col justify-between p-4 sm:p-6">
      <div>
        <div className="mb-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            System Overview
          </h3>
          <Badge
            variant="outline"
            className="admin-muted-badge h-6 px-2.5 text-[9px] font-medium uppercase tracking-[0.18em]"
          >
            Operational
          </Badge>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {[
            { label: "Users", value: integrity?.users },
            { label: "Sessions", value: rawStats.active_sessions },
            { label: "Challenges", value: integrity?.challenges },
            { label: "Inventory", value: integrity?.store_items },
            { label: "Audit Logs", value: integrity?.audit_logs },
            { label: "XP Spent", value: rawStats.total_gems },
          ].map((stat) => (
            <div key={stat.label} className="admin-subpanel p-3 text-center">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
              <p className="text-xl font-bold tracking-tight text-slate-100">
                {stat.value || 0}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-slate-300" size={12} />
          <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
            Real-time synchronization active
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("audit")}
          className="h-8 w-full rounded-md px-3 text-[9px] font-medium uppercase tracking-wider text-slate-400 hover:bg-white/5 hover:text-white sm:h-7 sm:w-auto"
        >
          View Logs
        </Button>
      </div>
    </div>
  );
};

export default SystemOverview;
