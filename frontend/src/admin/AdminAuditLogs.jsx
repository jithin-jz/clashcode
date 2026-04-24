import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { RefreshCw, User as UserIcon } from "lucide-react";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";
import { formatDistanceToNow } from "date-fns";
import { AdminTableLoadingRow } from "./AdminSkeletons";

const sortLogs = (rows, ordering) => {
  const items = [...rows];
  const byTimestamp = (a, b) =>
    new Date(a?.timestamp || 0).getTime() -
    new Date(b?.timestamp || 0).getTime();
  const byAction = (a, b) =>
    String(a?.action || "").localeCompare(String(b?.action || ""));

  if (ordering === "timestamp") {
    items.sort((a, b) => byTimestamp(a, b) || byAction(a, b));
  } else if (ordering === "-timestamp") {
    items.sort((a, b) => byTimestamp(b, a) || byAction(a, b));
  } else if (ordering === "action") {
    items.sort((a, b) => byAction(a, b) || byTimestamp(b, a));
  } else if (ordering === "-action") {
    items.sort((a, b) => byAction(b, a) || byTimestamp(b, a));
  }
  return items;
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({
    page: 1,
    page_size: 25,
    search: "",
    action: "",
    admin: "",
    target: "",
    date_from: "",
    date_to: "",
    ordering: "-timestamp",
  });
  const [searchValue, setSearchValue] = useState("");
  const [adminValue, setAdminValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    page_size: 25,
    total_pages: 1,
  });
  const requestRef = useRef(0);
  const queryRef = useRef(query);

  const fetchLogs = useCallback(async (overrides = {}) => {
    const nextQuery = { ...queryRef.current, ...overrides };
    queryRef.current = nextQuery;
    setQuery(nextQuery);
    setLoading(true);
    const requestId = ++requestRef.current;
    try {
      const response = await authAPI.getAuditLogs(nextQuery);
      if (requestId !== requestRef.current) return;
      const payload = response.data;
      if (Array.isArray(payload)) {
        setLogs(sortLogs(payload, nextQuery.ordering));
        setPagination({
          count: payload.length,
          page: 1,
          page_size: payload.length || nextQuery.page_size,
          total_pages: 1,
        });
      } else {
        const results = payload?.results || [];
        setLogs(sortLogs(results, nextQuery.ordering));
        setPagination({
          count: payload?.count ?? results.length,
          page: payload?.page ?? nextQuery.page,
          page_size: payload?.page_size ?? nextQuery.page_size,
          total_pages: payload?.total_pages ?? 1,
        });
      }
    } catch {
      notify.error("Failed to fetch audit logs");
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== query.search) {
        fetchLogs({ search: searchValue, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchValue, query.search, fetchLogs]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (adminValue !== query.admin || targetValue !== query.target) {
        fetchLogs({ admin: adminValue, target: targetValue, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [adminValue, targetValue, query.admin, query.target, fetchLogs]);

  const handleExport = async () => {
    try {
      const response = await authAPI.exportAuditLogs(query);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "admin-audit-logs.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify.error("Failed to export audit logs");
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "TOGGLE_USER_BLOCK":
        return (
          <Badge
            variant="outline"
            className="admin-muted-badge text-[9px] uppercase tracking-wider"
          >
            Moderation
          </Badge>
        );
      case "DELETE_USER":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 border-red-500/20 text-red-400 text-[9px] uppercase tracking-wider"
          >
            Deletion
          </Badge>
        );
      case "SEND_GLOBAL_NOTIFICATION":
        return (
          <Badge
            variant="outline"
            className="admin-muted-badge text-[9px] uppercase tracking-wider"
          >
            Broadcast
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="admin-muted-badge text-[9px] uppercase tracking-wider text-neutral-400"
          >
            System
          </Badge>
        );
    }
  };

  const renderDetails = (details) => {
    if (!details) return "-";
    if (typeof details === "string") return details;

    if (details.before !== undefined || details.after !== undefined) {
      const beforeState = details.before?.is_active ?? details.before;
      const afterState = details.after?.is_active ?? details.after;
      if (beforeState !== undefined && afterState !== undefined) {
        return `Changed: ${JSON.stringify(beforeState)} -> ${JSON.stringify(afterState)}`;
      }
    }

    if (details.message) return details.message;
    if (details.reason) return details.reason;

    const entries = Object.entries(details);
    if (entries.length > 0) {
      return entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
    }

    return JSON.stringify(details);
  };

  const page = pagination.page || 1;
  const pageSize = pagination.page_size || 25;
  const totalPages = pagination.total_pages || 1;
  const count = pagination.count || 0;
  const start = count > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = count > 0 ? Math.min(page * pageSize, count) : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold text-neutral-100 tracking-tight">
            Audit Logs
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-9 w-full rounded-md border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white sm:w-auto"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(query)}
              disabled={loading}
              className="h-9 w-full gap-2 rounded-md border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white sm:w-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {loading ? "Refreshing..." : "Refresh"}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search action/admin/target/request id..."
            className="admin-control h-9 w-full sm:w-80 text-neutral-200"
          />
          <Input
            value={adminValue}
            onChange={(e) => setAdminValue(e.target.value)}
            placeholder="Admin username"
            className="admin-control h-9 w-full sm:w-44 text-neutral-200"
          />
          <Input
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Target username"
            className="admin-control h-9 w-full sm:w-44 text-neutral-200"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              fetchLogs({ date_from: e.target.value, page: 1 });
            }}
            className="admin-control h-9 w-full rounded-md px-3 text-xs sm:w-auto"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              fetchLogs({ date_to: e.target.value, page: 1 });
            }}
            className="admin-control h-9 w-full rounded-md px-3 text-xs sm:w-auto"
          />
          <select
            value={query.action || ""}
            onChange={(e) => fetchLogs({ action: e.target.value, page: 1 })}
            className="admin-control h-9 w-full sm:w-auto rounded-md text-xs px-3"
          >
            <option value="">All Actions</option>
            <option value="TOGGLE_USER_BLOCK">Toggle User Block</option>
            <option value="DELETE_USER">Delete User</option>
            <option value="SEND_GLOBAL_NOTIFICATION">Broadcast</option>
          </select>
          <select
            value={query.ordering || "-timestamp"}
            onChange={(e) => fetchLogs({ ordering: e.target.value, page: 1 })}
            className="admin-control h-9 w-full sm:w-auto rounded-md text-xs px-3"
          >
            <option value="-timestamp">Newest</option>
            <option value="timestamp">Oldest</option>
            <option value="action">Action A-Z</option>
            <option value="-action">Action Z-A</option>
          </select>
          <select
            value={String(query.page_size || 25)}
            onChange={(e) =>
              fetchLogs({ page_size: Number(e.target.value), page: 1 })
            }
            className="admin-control h-9 w-full sm:w-auto rounded-md text-xs px-3"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="admin-panel h-36 animate-pulse bg-white/[0.02]"
            />
          ))
        ) : logs.length === 0 ? (
          <div className="admin-panel px-4 py-10 text-center text-sm italic text-neutral-500">
            No logs recorded.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={
                log.request_id ||
                `${log.timestamp}-${log.admin}-${log.action}-${log.target}-${idx}`
              }
              className="admin-panel p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-bold text-neutral-500">
                      {log.admin ? log.admin[0].toUpperCase() : "S"}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-neutral-100">
                        {log.admin || "System"}
                      </div>
                      <div className="truncate text-[11px] text-neutral-500">
                        {log.target}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">{getActionBadge(log.action)}</div>
              </div>
              <div className="mt-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2 text-[10px] font-mono text-neutral-400">
                {renderDetails(log.details)}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <UserIcon size={12} className="text-neutral-500" />
                  <span className="truncate">{log.target}</span>
                </div>
                <div className="text-right">
                  <div className="text-neutral-300">
                    {log.timestamp
                      ? formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                        })
                      : "Unknown"}
                  </div>
                  <div className="text-[9px] uppercase text-neutral-600">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden md:block admin-panel">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent bg-white/[0.02]">
              <TableHead className="px-6 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Admin
              </TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Action
              </TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Subject
              </TableHead>
              <TableHead className="w-1/3 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Details
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <AdminTableLoadingRow key={i} colSpan={5} />
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-neutral-500 text-xs italic"
                >
                  No logs recorded.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, idx) => (
                <TableRow
                  key={
                    log.request_id ||
                    `${log.timestamp}-${log.admin}-${log.action}-${log.target}-${idx}`
                  }
                  className="border-white/10 hover:bg-white/5 transition-colors group"
                >
                  <TableCell className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-bold text-neutral-500">
                        {log.admin ? log.admin[0].toUpperCase() : "S"}
                      </div>
                      <span className="text-sm font-medium text-neutral-100 tracking-tight">
                        {log.admin || "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="py-3 text-neutral-300">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      <UserIcon size={12} className="text-neutral-500" />
                      {log.target}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 transition-all">
                    <div
                      className="max-w-xs truncate"
                      title={JSON.stringify(log.details)}
                    >
                      {renderDetails(log.details)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3 px-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-medium text-neutral-300">
                        {log.timestamp
                          ? formatDistanceToNow(new Date(log.timestamp), {
                              addSuffix: true,
                            })
                          : "Unknown"}
                      </span>
                      <span className="text-[9px] text-neutral-600 font-mono uppercase">
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {start}-{end} of {count}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 px-3 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white sm:flex-none"
            disabled={page <= 1 || loading}
            onClick={() => fetchLogs({ page: page - 1 })}
          >
            Prev
          </Button>
          <span className="min-w-0 text-center text-neutral-400">
            Page {page} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex-1 px-3 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white sm:flex-none"
            disabled={page >= totalPages || loading}
            onClick={() => fetchLogs({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <div className="h-1 w-1 rounded-full bg-white/30" />
        <p className="text-[9px] text-neutral-600 font-medium uppercase tracking-wider">
          Audit records are immutable.
        </p>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
