"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import AdminTable from "@/components/common/AdminTable";
import ErrorBox from "@/components/common/ErrorBox";
import SuccessBox from "@/components/common/SuccessBox";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/common/SearchableSelect";
import { requestWithAuth } from "../../utils/apiClient";
import {
  DELETE_MODULE_ADMIN,
  GET_ALL_COURSES_ADMIN,
  GET_ALL_MODULE_ADMIN,
  UPDATE_MODULE_ADMIN,
  CREATE_MODULE_ADMIN,
} from "../../utils/api";
import { getUserRole } from "../../utils/auth";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";

const TABLE_KEYS = ["title", "course", "description", "order", "isPublished", "created_at"];
const HEADINGS = {
  title: "Title",
  course: "Course",
  description: "Description",
  order: "Order",
  isPublished: "Published",
  created_at: "Created",
};
const SORT_FIELD_MAP = {
  title: "title",
  order: "order",
  created_at: "created_at",
};

export default function AllModulesPage() {
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [mounted, setMounted] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    courseId: "",
    isPublished: true,
  });
  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    isPublished: true,
  });

  const fetchCourses = async () => {
    try {
      const result = await requestWithAuth(GET_ALL_COURSES_ADMIN, {
        method: "POST",
        body: { page: 1, pageSize: 200, search: "", sortBy: "created_at", sort: "desc" },
        allowedRoles: ["admin"],
      });
      const list = Array.isArray(result?.data?.data) ? result.data.data : [];
      setCourses(list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchModules = async (override = {}) => {
    try {
      setLoading(true);
      setError("");
      const result = await requestWithAuth(GET_ALL_MODULE_ADMIN, {
        method: "POST",
        body: {
          page: override.page ?? currentPage,
          pageSize: 10,
          search: search.trim(),
          sortBy: override.sortBy ?? sortBy,
          sort: override.sort ?? sortOrder,
        },
        allowedRoles: ["admin"],
      });

      if (result?.status === 200 || result?.data) {
        const list = Array.isArray(result.data?.data) ? result.data.data : [];
        setModules(list);
        const meta = result.data?.pagination || {};
        setTotalPages(meta.pages || meta.totalPages || 1);
        setTotalCount(meta.total || meta.totalCount || list.length);
      } else {
        setModules([]);
        setError(result?.message || "Failed to load modules");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (getUserRole() !== "admin") {
      setError("You do not have permission.");
      setLoading(false);
      return;
    }
    fetchModules();
    fetchCourses();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchModules();
  }, [currentPage, search, sortBy, sortOrder]);

  const handleSort = (key) => {
    const apiField = SORT_FIELD_MAP[key];
    if (!apiField) return;
    const order = sortBy === apiField && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(apiField);
    setSortOrder(order);
    setCurrentPage(1);
    fetchModules({ sortBy: apiField, sort: order, page: 1 });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const openUpdateModal = (item) => {
    setSelectedModule(item);
    setUpdateForm({
      title: item.title || "",
      description: item.description || "",
      isPublished: !!item.isPublished,
    });
    setShowUpdateModal(true);
  };

  const handleCreateModule = async () => {
    try {
      if (!createForm.title.trim() || !createForm.courseId) {
        setError("Title and course are required.");
        return;
      }
      await requestWithAuth(CREATE_MODULE_ADMIN, {
        method: "POST",
        body: {
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          courseId: createForm.courseId,
          isPublished: createForm.isPublished,
        },
        allowedRoles: ["admin"],
      });
      setSuccessMessage("Module created successfully");
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", courseId: "", isPublished: true });
      fetchModules({ page: 1 });
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to create module");
    }
  };

  const handleUpdateModule = async () => {
    try {
      if (!selectedModule?._id) return;
      await requestWithAuth(UPDATE_MODULE_ADMIN, {
        method: "POST",
        body: {
          id: selectedModule._id,
          title: updateForm.title.trim(),
          description: updateForm.description.trim(),
          isPublished: updateForm.isPublished,
        },
        allowedRoles: ["admin"],
      });
      setSuccessMessage("Module updated successfully");
      setShowUpdateModal(false);
      setSelectedModule(null);
      fetchModules();
    } catch (err) {
      setError(err.message || "Failed to update module");
    }
  };

  const handleDeleteModule = async () => {
    try {
      if (!selectedModule?._id) return;
      await requestWithAuth(DELETE_MODULE_ADMIN, {
        method: "POST",
        body: { id: selectedModule._id },
        allowedRoles: ["admin"],
      });
      setSuccessMessage("Module deleted successfully");
      setShowDeleteModal(false);
      setSelectedModule(null);
      fetchModules();
    } catch (err) {
      setError(err.message || "Failed to delete module");
    }
  };

  const renderRow = (item) => (
    <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 text-slate-100 font-medium whitespace-nowrap">{item.title || "—"}</td>
      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{item.courseId?.title || "—"}</td>
      <td className="px-4 py-3 text-slate-400 max-w-[220px] truncate">{item.description || "—"}</td>
      <td className="px-4 py-3 text-slate-300">{item.order ?? "—"}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${item.isPublished ? "bg-emerald-900/30 text-emerald-300" : "bg-amber-900/30 text-amber-300"}`}>
          {item.isPublished ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</td>
      <td className="px-4 py-3 sticky right-0 bg-[#1b1f4a] z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => openUpdateModal(item)} className="p-2 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition shadow-[0_6px_16px_rgba(59,130,246,0.25)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.35)]">
            <RiEdit2Line size={20} color="#3b82f6" />
          </button>
          <button onClick={() => { setSelectedModule(item); setShowDeleteModal(true); }} className="p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 transition shadow-[0_6px_16px_rgba(239,68,68,0.25)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.35)]">
            <RiDeleteBin6Line size={20} color="#ef4444" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <PageHeader title="Module Management" subtitle={`${totalCount} total modules`} />
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />

      <AdminTable
        title="All Modules"
        totalCount={totalCount}
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search module..."
        headerActions={<Button onClick={() => setShowCreateModal(true)}>Create</Button>}
        tableKeys={TABLE_KEYS}
        headings={HEADINGS}
        sortFieldMap={SORT_FIELD_MAP}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        tableLoading={loading}
        rows={modules}
        renderRow={renderRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyText="No modules found"
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-semibold mb-3">Create Module</h3>
            <div className="space-y-3">
              <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" placeholder="Title" value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} />
              <textarea className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" rows={4} placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} />
              <SearchableSelect
                value={createForm.courseId}
                onChange={(v) => setCreateForm((p) => ({ ...p, courseId: v }))}
                options={courses.map((c) => ({ value: c._id, label: c.title }))}
                placeholder="Select course"
                searchPlaceholder="Search course..."
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={createForm.isPublished} onChange={(e) => setCreateForm((p) => ({ ...p, isPublished: e.target.checked }))} />
                Published
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="shadow-[0_8px_18px_rgba(15,23,42,0.35)]">Cancel</Button>
              <Button onClick={handleCreateModule} className="shadow-[0_10px_22px_rgba(37,99,235,0.3)]">Create</Button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedModule && (
        <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUpdateModal(false)}>
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-semibold mb-3">Update Module</h3>
            <div className="space-y-3">
              <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" placeholder="Title" value={updateForm.title} onChange={(e) => setUpdateForm((p) => ({ ...p, title: e.target.value }))} />
              <textarea className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" rows={4} placeholder="Description" value={updateForm.description} onChange={(e) => setUpdateForm((p) => ({ ...p, description: e.target.value }))} />
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={updateForm.isPublished} onChange={(e) => setUpdateForm((p) => ({ ...p, isPublished: e.target.checked }))} />
                Published
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpdateModal(false)} className="shadow-[0_8px_18px_rgba(15,23,42,0.35)]">Cancel</Button>
              <Button onClick={handleUpdateModule} className="shadow-[0_10px_22px_rgba(37,99,235,0.3)]">Update</Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedModule && (
        <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-semibold mb-2">Delete Module</h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="text-white font-medium">{selectedModule.title}</span>?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="shadow-[0_8px_18px_rgba(15,23,42,0.35)]">Cancel</Button>
              <Button onClick={handleDeleteModule} className="bg-red-600 hover:bg-red-700 shadow-[0_10px_22px_rgba(220,38,38,0.3)]">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
