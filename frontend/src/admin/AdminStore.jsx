import React, { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Plus, Pencil, Trash2, Image as ImageIcon, Copy } from "lucide-react";
import { notify } from "../services/notification";
import { AdminTableLoadingRow } from "./AdminSkeletons";

// We need to add admin methods to storeAPI or create new ones.
// Assuming storeAPI has standard CRUD or we use a new adminStoreAPI.
// For now, I'll assume we can add these to storeAPI or use axios directly if needed,
// but sticking to patterns, let's extend api.js first or use a local helper.

import api, { authAPI } from "../services/api";

const AdminStore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: 100,
    category: "THEME",
    icon_name: "Palette",
    image: "",
    is_active: true,
    item_data: "{}",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await api.get("/store/items/");
      setItems(response.data);
    } catch {
      notify.error("Failed to fetch store items");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        cost: item.cost,
        category: item.category,
        icon_name: item.icon_name,
        image: item.image || "",
        is_active: item.is_active,
        item_data: JSON.stringify(item.item_data || {}, null, 2),
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: "",
        description: "",
        cost: 100,
        category: "THEME",
        icon_name: "Palette",
        image: "",
        is_active: true,
        item_data: "{}",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(formData.item_data);
      } catch {
        notify.error("Invalid JSON configuration");
        setSaving(false);
        return;
      }

      const payload = { ...formData, item_data: parsedData };

      if (currentItem) {
        await api.patch(`/store/items/${currentItem.id}/`, payload);
        notify.success("Item updated");
      } else {
        await api.post("/store/items/", payload);
        notify.success("Item created");
      }
      setIsDialogOpen(false);
      fetchItems();
    } catch {
      notify.error("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    notify.warning("Delete Item", {
      description:
        "Are you sure you want to delete this item? This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => confirmDelete(id),
      },
    });
  };

  const confirmDelete = async (id) => {
    try {
      await api.delete(`/store/items/${id}/`);
      notify.success("Item deleted");
      fetchItems();
    } catch {
      notify.error("Failed to delete item");
    }
  };

  const toggleItemField = async (item, field) => {
    try {
      await api.patch(`/store/items/${item.id}/`, {
        [field]: !item[field],
      });
      notify.success(
        `${field === "featured" ? "Featured" : "Visibility"} updated`,
      );
      fetchItems();
    } catch {
      notify.error("Failed to update item");
    }
  };

  const duplicateItem = async (itemId) => {
    try {
      await authAPI.duplicateStoreItem(itemId);
      notify.success("Item duplicated");
      fetchItems();
    } catch {
      notify.error("Failed to duplicate item");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold text-neutral-100 tracking-tight">
          Store Management
        </h2>
        <Button
          onClick={() => handleOpenDialog()}
          className="h-8 w-full gap-2 rounded-md bg-white px-3 font-medium text-black transition-colors hover:bg-zinc-200 sm:w-auto"
        >
          <Plus size={16} />
          <span className="text-xs">Add Item</span>
        </Button>
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="admin-panel h-32 animate-pulse bg-white/[0.02]"
            />
          ))
        ) : paginatedItems.length === 0 ? (
          <div className="admin-panel px-4 py-10 text-center text-sm italic text-neutral-500">
            No store items found.
          </div>
        ) : (
          paginatedItems.map((item) => (
            <div key={item.id} className="admin-panel p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={18} className="text-neutral-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-100">
                    {item.name}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[11px] text-neutral-500">
                    {item.description}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="admin-muted-badge rounded-md px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                      >
                        {item.category}
                      </Badge>
                      {item.featured ? (
                        <Badge
                          variant="outline"
                          className="admin-muted-badge rounded-md px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                        >
                          Featured
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-neutral-200">
                        {item.cost} XP
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {item.is_active ? "Visible" : "Hidden"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-white/8 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(item)}
                  className="h-9 flex-1 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <Pencil size={16} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateItem(item.id)}
                  className="h-9 flex-1 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <Copy size={16} />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="h-9 flex-1 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={16} />
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
              <TableHead className="w-[80px] px-6 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Icon
              </TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Item Details
              </TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Category
              </TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Price
              </TableHead>
              <TableHead className="py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Flags
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [...Array(6)].map((_, i) => (
                  <AdminTableLoadingRow key={i} colSpan={6} />
                ))
              : paginatedItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-white/10 hover:bg-white/5 transition-colors group"
                  >
                    <TableCell className="py-3 px-6">
                      <div className="w-10 h-10 bg-white/[0.04] rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={18} className="text-neutral-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-100 tracking-tight">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 line-clamp-1">
                          {item.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className="admin-muted-badge rounded-md px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                      >
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 font-mono text-xs text-neutral-300">
                      {item.cost} XP
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleItemField(item, "is_active")}
                          className="h-7 border-white/10 bg-white/[0.03] px-2 text-[10px] uppercase tracking-wider text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                        >
                          {item.is_active ? "Visible" : "Hidden"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleItemField(item, "featured")}
                          className="h-7 border-white/10 bg-white/[0.03] px-2 text-[10px] uppercase tracking-wider text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                        >
                          {item.featured ? "Featured" : "Standard"}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-3 px-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateItem(item.id)}
                          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(item)}
                          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      {!loading && (
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
            <span className="text-neutral-400">
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

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-white/10 bg-[#050505] text-white max-w-[calc(100vw-2rem)] sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-100">
              {currentItem ? "Edit Item" : "New Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="admin-control h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="admin-control h-9 w-full rounded-md px-3 text-sm text-white focus:outline-none"
                >
                  <option value="THEME">Theme</option>
                  <option value="FONT">Font</option>
                  <option value="EFFECT">Effect</option>
                  <option value="VICTORY">Victory</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="admin-control h-20 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Cost (XP)
                </label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: parseInt(e.target.value) })
                  }
                  className="admin-control h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Icon Name
                </label>
                <Input
                  value={formData.icon_name}
                  onChange={(e) =>
                    setFormData({ ...formData, icon_name: e.target.value })
                  }
                  className="admin-control h-9 text-sm"
                  placeholder="e.g. Palette"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Configuration (JSON)
              </label>
              <Textarea
                value={formData.item_data}
                onChange={(e) =>
                  setFormData({ ...formData, item_data: e.target.value })
                }
                className="admin-control h-24 font-mono text-[10px] resize-none"
                placeholder='{"theme_key": "dracula"}'
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-500">
                Asset URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="admin-control h-9 flex-1 text-sm"
                  placeholder="/assets/item.png"
                />
                <Input
                  type="file"
                  className="hidden"
                  id="image-upload"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const uploadData = new FormData();
                    uploadData.append("image", file);

                    const toastId = notify.loading("Uploading...");
                    try {
                      const res = await api.post("/store/upload/", uploadData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      setFormData((prev) => ({ ...prev, image: res.data.url }));
                      notify.success("Uploaded");
                    } catch {
                      notify.error("Upload failed");
                    } finally {
                      notify.dismiss(toastId);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white"
                  onClick={() =>
                    document.getElementById("image-upload").click()
                  }
                >
                  Upload
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="text-neutral-400 hover:text-white hover:bg-white/10 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-white text-black hover:bg-zinc-200 h-9 font-medium px-6"
              >
                {saving ? "Saving..." : "Save Asset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStore;
