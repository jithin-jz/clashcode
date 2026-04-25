import { TableCell, TableRow } from "../components/ui/table";

export const AdminTableLoadingRow = ({ colSpan = 1 }) => (
  <TableRow className="border-white/10 hover:bg-transparent">
    <TableCell colSpan={colSpan} className="px-6 py-4">
      <div className="h-8 w-full animate-pulse rounded-md bg-white/[0.04]" />
    </TableCell>
  </TableRow>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="admin-panel h-32 bg-white/[0.02]" />
      ))}
    </div>
    <div className="admin-panel h-72 bg-white/[0.02]" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="admin-panel h-80 bg-white/[0.02]" />
      <div className="admin-panel h-80 bg-white/[0.02]" />
    </div>
    <div className="admin-panel h-40 bg-white/[0.02]" />
  </div>
);
