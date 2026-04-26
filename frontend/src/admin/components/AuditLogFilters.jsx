import React from "react";
import { Input } from "../../components/ui/input";

/**
 * AuditLogFilters Component
 * 
 * Filter bar for audit logs including search, username filters, date range, and status.
 */
const AuditLogFilters = ({
  searchValue,
  setSearchValue,
  adminValue,
  setAdminValue,
  targetValue,
  setTargetValue,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  query,
  fetchLogs,
}) => {
  return (
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
        style={{ colorScheme: "dark" }}
        className="admin-control h-9 w-full sm:w-auto rounded-md text-xs px-3"
      >
        <option value="" className="bg-[#0A0A0A] text-white">All Actions</option>
        <option value="TOGGLE_USER_BLOCK" className="bg-[#0A0A0A] text-white">Toggle User Block</option>
        <option value="DELETE_USER" className="bg-[#0A0A0A] text-white">Delete User</option>
        <option value="SEND_GLOBAL_NOTIFICATION" className="bg-[#0A0A0A] text-white">Broadcast</option>
      </select>
      <select
        value={query.ordering || "-timestamp"}
        onChange={(e) => fetchLogs({ ordering: e.target.value, page: 1 })}
        style={{ colorScheme: "dark" }}
        className="admin-control h-9 w-full sm:w-auto rounded-md text-xs px-3"
      >
        <option value="-timestamp" className="bg-[#0A0A0A] text-white">Newest</option>
        <option value="timestamp" className="bg-[#0A0A0A] text-white">Oldest</option>
        <option value="action" className="bg-[#0A0A0A] text-white">Action A-Z</option>
        <option value="-action" className="bg-[#0A0A0A] text-white">Action Z-A</option>
      </select>
      <select
        value={String(query.page_size || 25)}
        onChange={(e) =>
          fetchLogs({ page_size: Number(e.target.value), page: 1 })
        }
        style={{ colorScheme: "dark" }}
        className="admin-control h-9 w-full sm:w-auto rounded-md text-xs px-3"
      >
        <option value="10" className="bg-[#0A0A0A] text-white">10 / page</option>
        <option value="25" className="bg-[#0A0A0A] text-white">25 / page</option>
        <option value="50" className="bg-[#0A0A0A] text-white">50 / page</option>
        <option value="100" className="bg-[#0A0A0A] text-white">100 / page</option>
      </select>
    </div>
  );
};

export default AuditLogFilters;
