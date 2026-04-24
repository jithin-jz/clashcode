import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";

const AdminUserDetailsDrawer = ({
  username,
  open,
  onOpenChange,
  onRefreshUsers,
}) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [savingReport, setSavingReport] = useState(false);

  const fetchDetails = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const response = await authAPI.getUserDetails(username);
      setDetails(response.data);
    } catch (error) {
      notify.error(
        error.response?.data?.error || "Failed to load user details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && username) {
      fetchDetails();
    }
  }, [open, username]);

  const roleValue = useMemo(() => details?.role || "user", [details?.role]);

  const handleRoleChange = async (event) => {
    const nextRole = event.target.value;
    if (!username || !nextRole || nextRole === roleValue) return;
    setSavingRole(true);
    try {
      await authAPI.updateUserRole(username, nextRole);
      notify.success(`Updated role to ${nextRole}`);
      await fetchDetails();
      onRefreshUsers?.();
    } catch (error) {
      notify.error(error.response?.data?.error || "Failed to update role");
    } finally {
      setSavingRole(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteBody.trim() || !username) return;
    setSavingNote(true);
    try {
      await authAPI.createUserNote(username, { body: noteBody.trim() });
      setNoteBody("");
      notify.success("Admin note added");
      await fetchDetails();
    } catch (error) {
      notify.error(error.response?.data?.error || "Failed to add note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateReport = async () => {
    if (!reportTitle.trim() || !reportSummary.trim() || !username) return;
    setSavingReport(true);
    try {
      await authAPI.createReport({
        target: username,
        title: reportTitle.trim(),
        summary: reportSummary.trim(),
      });
      setReportTitle("");
      setReportSummary("");
      notify.success("Report added to queue");
      await fetchDetails();
    } catch (error) {
      notify.error(error.response?.data?.error || "Failed to create report");
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-white/10 bg-[#050505] text-white">
        <DialogHeader>
          <DialogTitle>User Workspace</DialogTitle>
        </DialogHeader>

        {loading || !details ? (
          <div className="space-y-3">
            <div className="admin-panel h-24 animate-pulse bg-white/[0.02]" />
            <div className="admin-panel h-44 animate-pulse bg-white/[0.02]" />
            <div className="admin-panel h-44 animate-pulse bg-white/[0.02]" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="admin-panel p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                    {details.user?.profile?.avatar_url ? (
                      <img
                        src={details.user.profile.avatar_url}
                        alt={details.user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-neutral-500">
                        {details.user?.username?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-semibold text-neutral-100">
                      {details.user?.username}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {details.user?.email}
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="admin-subpanel p-3">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                          Joined
                        </div>
                        <div className="mt-1 text-sm text-neutral-200">
                          {details.summary?.joined_at
                            ? new Date(
                                details.summary.joined_at,
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                      <div className="admin-subpanel p-3">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                          Last Login
                        </div>
                        <div className="mt-1 text-sm text-neutral-200">
                          {details.summary?.last_login
                            ? new Date(
                                details.summary.last_login,
                              ).toLocaleString()
                            : "Never"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-panel p-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  Role Management
                </div>
                <select
                  value={roleValue}
                  onChange={handleRoleChange}
                  disabled={savingRole}
                  className="admin-control mt-3 h-10 w-full rounded-md px-3 text-sm"
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="superuser">Superuser</option>
                </select>
                <div className="mt-4 text-[11px] text-neutral-500">
                  Use this to promote or demote access without leaving the user
                  panel.
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Completed"
                value={details.summary?.completed_challenges || 0}
              />
              <MetricCard
                label="Unlocked"
                value={details.summary?.unlocked_challenges || 0}
              />
              <MetricCard
                label="Purchases"
                value={details.summary?.purchase_count || 0}
              />
              <MetricCard
                label="Open Reports"
                value={details.summary?.open_reports || 0}
              />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className="admin-panel p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Admin Notes
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                    Internal
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={noteBody}
                    onChange={(e) => setNoteBody(e.target.value)}
                    placeholder="Leave context for other admins..."
                    className="admin-control min-h-[100px] resize-none"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={savingNote || !noteBody.trim()}
                    className="h-9 bg-white text-black hover:bg-zinc-200"
                  >
                    {savingNote ? "Saving..." : "Add Note"}
                  </Button>
                  <div className="space-y-2">
                    {(details.notes || []).length === 0 ? (
                      <div className="text-sm text-neutral-500">
                        No notes yet.
                      </div>
                    ) : (
                      details.notes.map((note) => (
                        <div
                          key={note.id}
                          className="admin-subpanel space-y-1 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-neutral-200">
                              {note.admin}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {new Date(note.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400">
                            {note.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-panel p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Reports Queue
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                    Moderation
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <InputRow
                    value={reportTitle}
                    onChange={setReportTitle}
                    placeholder="Report title"
                  />
                  <Textarea
                    value={reportSummary}
                    onChange={(e) => setReportSummary(e.target.value)}
                    placeholder="Describe the issue or context..."
                    className="admin-control min-h-[100px] resize-none"
                  />
                  <Button
                    onClick={handleCreateReport}
                    disabled={
                      savingReport ||
                      !reportTitle.trim() ||
                      !reportSummary.trim()
                    }
                    className="h-9 bg-white text-black hover:bg-zinc-200"
                  >
                    {savingReport ? "Saving..." : "Create Report"}
                  </Button>
                  <div className="space-y-2">
                    {(details.reports || []).length === 0 ? (
                      <div className="text-sm text-neutral-500">
                        No reports for this user.
                      </div>
                    ) : (
                      details.reports.map((report) => (
                        <div
                          key={report.id}
                          className="admin-subpanel space-y-1 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-neutral-200">
                              {report.title}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-400">
                            {report.summary}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <HistoryCard
                title="Recent Completions"
                rows={details.recent_completions || []}
                renderRow={(row) => (
                  <>
                    <span className="truncate">{row.challenge}</span>
                    <span className="shrink-0 text-neutral-500">
                      {row.stars} stars
                    </span>
                  </>
                )}
              />
              <HistoryCard
                title="Recent Purchases"
                rows={details.recent_purchases || []}
                renderRow={(row) => (
                  <>
                    <span className="truncate">{row.name}</span>
                    <span className="shrink-0 text-neutral-500">
                      {row.cost} XP
                    </span>
                  </>
                )}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="admin-subpanel p-3">
    <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
      {label}
    </div>
    <div className="mt-1 text-xl font-semibold text-neutral-100">{value}</div>
  </div>
);

const HistoryCard = ({ title, rows, renderRow }) => (
  <div className="admin-panel p-4">
    <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
    <div className="mt-4 space-y-2">
      {rows.length === 0 ? (
        <div className="text-sm text-neutral-500">No records yet.</div>
      ) : (
        rows.map((row, index) => (
          <div
            key={`${title}-${index}`}
            className="admin-subpanel flex items-center justify-between gap-3 p-3 text-sm text-neutral-300"
          >
            {renderRow(row)}
          </div>
        ))
      )}
    </div>
  </div>
);

const InputRow = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="admin-control h-10 w-full rounded-md px-3 text-sm text-white outline-none"
  />
);

export default AdminUserDetailsDrawer;
