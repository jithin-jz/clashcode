import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Send } from "lucide-react";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";

const AdminBroadcast = () => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [includeStaff, setIncludeStaff] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);

  const fetchHistory = async ({ silent = false } = {}) => {
    setLoadingHistory(true);
    try {
      const response = await authAPI.getBroadcastHistory();
      setHistory(response.data?.results || []);
      setHistoryUnavailable(false);
    } catch (error) {
      const unavailable = error?.response?.status === 404;
      setHistoryUnavailable(unavailable);
      if (!silent) {
        notify.error(
          unavailable
            ? "Broadcast history will appear after the backend restarts"
            : "Failed to load broadcast history",
        );
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  React.useEffect(() => {
    fetchHistory({ silent: true });
  }, []);

  const handleSendBroadcast = () => {
    if (!message.trim()) {
      notify.error("Please enter a message");
      return;
    }

    notify.warning("System Announcement", {
      description:
        "Are you sure you want to send this announcement to ALL users?",
      action: {
        label: "Send",
        onClick: () => confirmSendBroadcast(),
      },
    });
  };

  const confirmSendBroadcast = async () => {
    setSending(true);
    try {
      await authAPI.sendBroadcast(message, { include_staff: includeStaff });
      notify.success("Announcement sent successfully");
      setMessage("");
      setIncludeStaff(false);
      fetchHistory();
    } catch {
      notify.error("Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (requestId) => {
    try {
      await authAPI.resendBroadcast(requestId);
      notify.success("Announcement resent");
      fetchHistory();
    } catch {
      notify.error("Failed to resend announcement");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-neutral-100 tracking-tight">
            System Announcements
          </h2>
        </div>

        <div className="admin-panel space-y-4 p-4 sm:p-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              Message Content
            </label>
            <Textarea
              placeholder="Type your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="admin-control h-32 rounded-lg p-4 leading-relaxed text-white transition-colors resize-none sm:h-40"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-neutral-400">
            <input
              type="checkbox"
              checked={includeStaff}
              onChange={(e) => setIncludeStaff(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent"
            />
            Include staff and superusers in this announcement
          </label>

          <Button
            onClick={handleSendBroadcast}
            className="w-full h-10 bg-white text-black hover:bg-zinc-200 font-medium gap-2 rounded-md transition-colors"
            disabled={sending}
          >
            {!sending ? <Send size={16} /> : null}
            <span className="text-sm">
              {sending ? "Sending..." : "Send Announcement"}
            </span>
          </Button>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center text-[10px] font-medium leading-relaxed text-neutral-500">
            <span className="text-neutral-300 font-bold uppercase tracking-tighter mr-1">
              Note:
            </span>
            This announcement will be delivered immediately to all active user
            sessions.
          </div>
        </div>

        <div className="admin-panel space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-100">
              Broadcast History
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHistory}
              className="h-8 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white"
            >
              Refresh
            </Button>
          </div>
          {loadingHistory ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="admin-subpanel h-20 animate-pulse bg-white/[0.02]"
                />
              ))}
            </div>
          ) : historyUnavailable ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
              Broadcast history is not available from the current backend
              process yet. Restart the `core` service once and this panel will
              start loading normally.
            </div>
          ) : history.length === 0 ? (
            <div className="text-sm text-neutral-500">
              No announcements sent yet.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.request_id}
                  className="admin-subpanel flex flex-col gap-3 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <div className="text-sm text-neutral-200">
                      {item.message}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">
                      {item.recipient_count} recipients • {item.admin} •{" "}
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResend(item.request_id)}
                    className="h-8 gap-2 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    Resend
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;
