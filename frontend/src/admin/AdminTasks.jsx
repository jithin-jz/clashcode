import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, X, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Editor from "@monaco-editor/react";
import { challengesApi } from "../services/challengesApi";
import { notify } from "../services/notification";
import { AdminTableLoadingRow } from "./AdminSkeletons";

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null); // null = list, {} = new, {id...} = edit
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchTasks();
  }, []);

  const totalCount = tasks.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return tasks.slice(start, start + pageSize);
  }, [tasks, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await challengesApi.getAll();
      setTasks(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      notify.error("Failed to load challenges");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    notify.warning("Delete Challenge", {
      description:
        "Are you sure you want to delete this challenge? This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await challengesApi.delete(slug);
            notify.success("Challenge deleted");
            fetchTasks();
          } catch {
            notify.error("Failed to delete challenge");
          }
        },
      },
    });
  };

  const TaskForm = ({ task, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      task || {
        title: "",
        slug: "",
        description: "",
        order: tasks.length + 1,
        xp_reward: 50,
        initial_code: "# Write your code here\n",
        test_code: "# assert something\n",
        time_limit: 300,
      },
    );

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (task && task.slug) {
          await challengesApi.update(task.slug, formData);
          notify.success("Challenge updated");
        } else {
          await challengesApi.create(formData);
          notify.success("Challenge created");
        }
        onSave();
      } catch (error) {
        console.error("Failed to save challenge:", error);
        notify.error("Failed to save challenge");
      }
    };

    return (
      <div className="admin-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-100">
            {task ? "Edit Challenge" : "New Challenge"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="admin-control w-full rounded-md px-3 py-2 text-sm text-white outline-none"
                placeholder="FizzBuzz"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Slug
              </label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="admin-control w-full rounded-md px-3 py-2 text-sm text-white font-mono outline-none"
                placeholder="fizz-buzz"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500">
              Description (Markdown)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="admin-control h-32 w-full rounded-md px-3 py-2 text-sm text-white font-mono outline-none resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="admin-control w-full rounded-md px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                XP Reward
              </label>
              <input
                type="number"
                name="xp_reward"
                value={formData.xp_reward}
                onChange={handleChange}
                className="admin-control w-full rounded-md px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Time Limit (s)
              </label>
              <input
                type="number"
                name="time_limit"
                value={formData.time_limit}
                onChange={handleChange}
                className="admin-control w-full rounded-md px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[300px]">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Initial Code
              </label>
              <div className="h-56 overflow-hidden rounded-md border border-white/10 bg-[#050505] lg:h-full">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={formData.initial_code}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, initial_code: val }))
                  }
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    padding: { top: 10 },
                    background: "#050505",
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Validation Code
              </label>
              <div className="h-56 overflow-hidden rounded-md border border-white/10 bg-[#050505] lg:h-full">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={formData.test_code}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, test_code: val }))
                  }
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    padding: { top: 10 },
                    background: "#050505",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-neutral-400 hover:text-white hover:bg-white/10 px-4 h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-zinc-200 px-4 h-9 font-medium"
            >
              Save Challenge
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!editingTask ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Challenge Management
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTasks}
                disabled={isLoading}
                className="h-8 w-full gap-2 rounded-md border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white sm:w-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {isLoading ? "Refreshing..." : "Refresh"}
                </span>
              </Button>
              <Button
                size="sm"
                onClick={() => setEditingTask({})}
                className="h-8 w-full gap-2 rounded-md bg-white px-3 font-medium text-black transition-colors hover:bg-zinc-200 sm:w-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="text-xs">Add Challenge</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="admin-panel h-32 animate-pulse bg-white/[0.02]"
                />
              ))
            ) : paginatedTasks.length === 0 ? (
              <div className="admin-panel px-4 py-10 text-center text-sm italic text-neutral-500">
                No challenges found.
              </div>
            ) : (
              paginatedTasks.map((task) => (
                <div key={task.id} className="admin-panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-500">
                        #{task.order.toString().padStart(2, "0")}
                      </div>
                      <div className="mt-1 truncate text-sm font-medium text-neutral-100">
                        {task.title}
                      </div>
                      <div className="truncate text-[11px] font-mono text-neutral-500">
                        /{task.slug}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-neutral-200">
                        {task.xp_reward} XP
                      </div>
                      <div className="mt-1 text-[11px] text-neutral-500">
                        {task.time_limit}s
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-white/8 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                      className="h-9 flex-1 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(task.slug)}
                      className="h-9 flex-1 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-hidden md:block admin-panel">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent bg-white/[0.02]">
                  <TableHead className="w-[80px] py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    #
                  </TableHead>
                  <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Challenge
                  </TableHead>
                  <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    XP Reward
                  </TableHead>
                  <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Time Limit
                  </TableHead>
                  <TableHead className="py-3 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <AdminTableLoadingRow key={i} colSpan={5} />
                  ))
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-neutral-500 text-sm italic"
                    >
                      No challenges found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="border-white/10 hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="py-3">
                        <span className="text-xs font-mono text-neutral-500">
                          {task.order.toString().padStart(2, "0")}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-neutral-100 tracking-tight flex items-center gap-2">
                            {task.title}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            /{task.slug}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 font-mono text-xs">
                        <span className="text-neutral-300">
                          {task.xp_reward} XP
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-neutral-500 text-xs">
                          {task.time_limit}s
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.slug)}
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {!isLoading && (
            <div className="flex flex-col gap-3 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}-
                  {Math.min(page * pageSize, totalCount)} of {totalCount}
                </span>
                <select
                  value={String(pageSize)}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="admin-control h-8 rounded-md text-xs px-3"
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 px-3 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white sm:flex-none"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <span className="min-w-0 text-center text-neutral-400">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 px-3 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white sm:flex-none"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <TaskForm
          task={Object.keys(editingTask).length > 0 ? editingTask : null}
          onSave={() => {
            setEditingTask(null);
            fetchTasks();
          }}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default AdminTasks;
