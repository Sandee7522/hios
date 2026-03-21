"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import AdminTable from "@/components/common/AdminTable";
import ErrorBox from "@/components/common/ErrorBox";
import SuccessBox from "@/components/common/SuccessBox";
import { Button } from "@/components/ui/button";
import SearchableSelect from "@/components/common/SearchableSelect";
import { requestWithAuth } from "../../utils/apiClient";
import {
  CREATE_LESSON_ADMIN,
  DELETE_LESSON_ADMIN,
  GET_ALL_COURSES_ADMIN,
  GET_ALL_LESSON_ADMIN,
  GET_ALL_MODULE_ADMIN,
  RE_ORDER_LESSON,
  UPDATE_LESSON,
} from "../../utils/api";
import { getUserRole } from "../../utils/auth";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";

const TABLE_KEYS = ["title", "course", "module", "videoUrl", "order", "isPublished", "created_at"];
const HEADINGS = {
  title: "Title",
  course: "Course",
  module: "Module",
  videoUrl: "Video URL",
  order: "Order",
  isPublished: "Published",
  created_at: "Created",
};
const SORT_FIELD_MAP = {
  title: "title",
  order: "order",
  created_at: "created_at",
};

export default function AllLessonPage() {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [mounted, setMounted] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState("");
  const [createCourseSearch, setCreateCourseSearch] = useState("");
  const [createModuleSearch, setCreateModuleSearch] = useState("");
  const [modalCourses, setModalCourses] = useState([]);
  const [modalModules, setModalModules] = useState([]);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    courseId: "",
    moduleId: "",
    isPublished: false,
  });
  const [updateForm, setUpdateForm] = useState({
    title: "",
    description: "",
    content: "",
    videoUrl: "",
    isPublished: false,
  });

  const [reorderItems, setReorderItems] = useState([]);
  const [isReorderDirty, setIsReorderDirty] = useState(false);

  const extractList = (result) => {
    if (Array.isArray(result?.data?.data)) return result.data.data;
    if (Array.isArray(result?.data)) return result.data;
    return [];
  };

  const courseModules = useMemo(() => {
    const base = createForm.courseId
      ? modalModules.filter((m) => String(m.courseId?._id || m.courseId) === String(createForm.courseId))
      : modalModules;
    return base;
  }, [modalModules, createForm.courseId]);

  const fetchCourses = async () => {
    try {
      const result = await requestWithAuth(GET_ALL_COURSES_ADMIN, {
        method: "POST",
        body: { page: 1, pageSize: 100, search: "", sortBy: "created_at", sort: "desc" },
        allowedRoles: ["admin"],
      });
      setCourses(extractList(result));
    } catch (err) {
      console.error(err);
      setCourses([]);
    }
  };

  const fetchModules = async () => {
    try {
      const result = await requestWithAuth(GET_ALL_MODULE_ADMIN, {
        method: "POST",
        body: { page: 1, pageSize: 100, search: "", sortBy: "order", sort: "asc" },
        allowedRoles: ["admin"],
      });
      setModules(extractList(result));
    } catch (err) {
      console.error(err);
      setModules([]);
    }
  };

  const fetchCoursesForModal = async (searchText = "") => {
    try {
      const result = await requestWithAuth(GET_ALL_COURSES_ADMIN, {
        method: "POST",
        body: { page: 1, pageSize: 100, search: searchText, sortBy: "created_at", sort: "desc" },
        allowedRoles: ["admin"],
      });
      setModalCourses(extractList(result));
    } catch (err) {
      console.error(err);
      setModalCourses([]);
    }
  };

  const fetchModulesForModal = async (searchText = "", courseId = "") => {
    try {
      const result = await requestWithAuth(GET_ALL_MODULE_ADMIN, {
        method: "POST",
        body: {
          page: 1,
          pageSize: 100,
          search: searchText,
          sortBy: "order",
          sort: "asc",
          courseId: courseId || undefined,
        },
        allowedRoles: ["admin"],
      });
      setModalModules(extractList(result));
    } catch (err) {
      console.error(err);
      setModalModules([]);
    }
  };

  const fetchLessons = async (override = {}) => {
    try {
      setLoading(true);
      setError("");
      const result = await requestWithAuth(GET_ALL_LESSON_ADMIN, {
        method: "POST",
        body: {
          page: override.page ?? currentPage,
          pageSize: 10,
          search: search.trim(),
          sortBy: override.sortBy ?? sortBy,
          sort: override.sort ?? sortOrder,
          courseId: selectedCourseId || undefined,
          moduleId: selectedModuleId || undefined,
        },
        allowedRoles: ["admin"],
      });

      const list = Array.isArray(result?.data?.data) ? result.data.data : [];
      setLessons(list);
      setReorderItems(list.map((x) => ({ lessonId: x._id, order: x.order })));
      setIsReorderDirty(false);
      const meta = result?.data?.pagination || {};
      setTotalPages(meta.pages || meta.totalPages || 1);
      setTotalCount(meta.total || meta.totalCount || list.length);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load lessons");
      setLessons([]);
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
    Promise.all([fetchCourses(), fetchModules(), fetchLessons()]).catch((err) => {
      setError(err.message || "Failed to initialize lesson page");
      setLoading(false);
    });
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchLessons();
  }, [currentPage, search, sortBy, sortOrder, selectedCourseId, selectedModuleId]);

  useEffect(() => {
    if (!showCreateModal) return;
    const t = setTimeout(() => {
      fetchCoursesForModal(createCourseSearch.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [showCreateModal, createCourseSearch]);

  useEffect(() => {
    if (!showCreateModal) return;
    const t = setTimeout(() => {
      fetchModulesForModal(createModuleSearch.trim(), createForm.courseId);
    }, 300);
    return () => clearTimeout(t);
  }, [showCreateModal, createModuleSearch, createForm.courseId]);

  const handleSort = (key) => {
    const apiField = SORT_FIELD_MAP[key];
    if (!apiField) return;
    const order = sortBy === apiField && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(apiField);
    setSortOrder(order);
    setCurrentPage(1);
    fetchLessons({ sortBy: apiField, sort: order, page: 1 });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const moveOrder = (lessonId, direction) => {
    const sorted = [...reorderItems].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.lessonId === lessonId);
    if (idx < 0) return;
    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= sorted.length) return;
    const currentOrder = sorted[idx].order;
    sorted[idx].order = sorted[nextIdx].order;
    sorted[nextIdx].order = currentOrder;
    setReorderItems(sorted);
    setIsReorderDirty(true);
  };

  const handleSaveReorder = async () => {
    try {
      if (!selectedModuleId) {
        setError("Select a module before saving reorder.");
        return;
      }
      await requestWithAuth(RE_ORDER_LESSON, {
        method: "POST",
        body: { moduleId: selectedModuleId, lessonOrders: reorderItems },
        allowedRoles: ["admin"],
      });
      setSuccessMessage("Lessons reordered successfully");
      fetchLessons();
    } catch (err) {
      setError(err.message || "Failed to reorder lessons");
    }
  };

  const handleCreateLesson = async () => {
    try {
      if (!createForm.title.trim() || !createForm.courseId || !createForm.moduleId) {
        setError("Title, course and module are required.");
        return;
      }
      await requestWithAuth(CREATE_LESSON_ADMIN, {
        method: "POST",
        body: {
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          content: createForm.content.trim(),
          videoUrl: createForm.videoUrl.trim(),
          courseId: createForm.courseId,
          moduleId: createForm.moduleId,
          isPublished: createForm.isPublished,
        },
        allowedRoles: ["admin"],
      });
      setSuccessMessage("Lesson created successfully");
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", content: "", videoUrl: "", courseId: "", moduleId: "", isPublished: false });
      setCreateCourseSearch("");
      setCreateModuleSearch("");
      fetchLessons({ page: 1 });
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to create lesson");
    }
  };

  const openUpdateModal = (item) => {
    setSelectedLesson(item);
    setUpdateForm({
      title: item.title || "",
      description: item.description || "",
      content: item.content || "",
      videoUrl: item.videoUrl || "",
      isPublished: !!item.isPublished,
    });
    setShowUpdateModal(true);
  };

  const handleUpdateLesson = async () => {
    try {
      if (!selectedLesson?._id) return;
      await requestWithAuth(UPDATE_LESSON, {
        method: "POST",
        body: { id: selectedLesson._id, ...updateForm },
        allowedRoles: ["admin"],
      });
      setSuccessMessage("Lesson updated successfully");
      setShowUpdateModal(false);
      setSelectedLesson(null);
      fetchLessons();
    } catch (err) {
      setError(err.message || "Failed to update lesson");
    }
  };

  const handleDeleteLesson = async () => {
    try {
      if (!selectedLesson?._id) return;
      await requestWithAuth(DELETE_LESSON_ADMIN, {
        method: "POST",
        body: { id: selectedLesson._id },
        allowedRoles: ["admin"],
      });
      setSuccessMessage("Lesson deleted successfully");
      setShowDeleteModal(false);
      setSelectedLesson(null);
      fetchLessons();
    } catch (err) {
      setError(err.message || "Failed to delete lesson");
    }
  };

  const renderRow = (item) => {
    const current = reorderItems.find((x) => x.lessonId === item._id);
    return (
      <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
        <td className="px-4 py-3 text-slate-100 font-medium whitespace-nowrap">{item.title || "—"}</td>
        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{item.courseId?.title || "—"}</td>
        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{item.moduleId?.title || "—"}</td>
        <td className="px-4 py-3">
          {item.videoUrl ? (
            <button
              type="button"
              onClick={() => setPreviewVideoUrl(item.videoUrl)}
              className="px-2 py-1 rounded text-xs bg-cyan-900/30 text-cyan-200 hover:bg-cyan-900/50 transition shadow-[0_8px_18px_rgba(34,211,238,0.2)] hover:shadow-[0_10px_22px_rgba(34,211,238,0.28)]"
            >
              Preview Video
            </button>
          ) : (
            <span className="text-slate-500">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-slate-300">
          <div className="flex items-center gap-2">
            <span>{current?.order ?? item.order ?? "—"}</span>
            <button className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 shadow-[0_6px_14px_rgba(15,23,42,0.45)]" onClick={() => moveOrder(item._id, "up")}>↑</button>
            <button className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 shadow-[0_6px_14px_rgba(15,23,42,0.45)]" onClick={() => moveOrder(item._id, "down")}>↓</button>
          </div>
        </td>
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
            <button onClick={() => { setSelectedLesson(item); setShowDeleteModal(true); }} className="p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 transition shadow-[0_6px_16px_rgba(239,68,68,0.25)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.35)]">
              <RiDeleteBin6Line size={20} color="#ef4444" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <PageHeader title="Lesson Management" subtitle={`${totalCount} total lessons`} />
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />

      <div className="mb-3 flex flex-wrap gap-2">
        <div className="min-w-55">
          <SearchableSelect
            value={selectedCourseId}
            onChange={(v) => {
              setSelectedCourseId(v || "");
              setSelectedModuleId("");
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All courses" },
              ...courses.map((c) => ({ value: c._id, label: c.title })),
            ]}
            placeholder="All courses"
            searchPlaceholder="Search course..."
          />
        </div>

        <div className="min-w-55">
          <SearchableSelect
            value={selectedModuleId}
            onChange={(v) => {
              setSelectedModuleId(v || "");
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All modules" },
              ...modules
                .filter((m) => !selectedCourseId || String(m.courseId?._id || m.courseId) === String(selectedCourseId))
                .map((m) => ({ value: m._id, label: m.title })),
            ]}
            placeholder="All modules"
            searchPlaceholder="Search module..."
          />
        </div>

        {isReorderDirty && (
          <Button onClick={handleSaveReorder}>Save Reorder</Button>
        )}
      </div>

      <AdminTable
        title="All Lessons"
        totalCount={totalCount}
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search lesson..."
        headerActions={<Button onClick={() => { setShowCreateModal(true); fetchCoursesForModal(""); fetchModulesForModal(""); }}>Create</Button>}
        tableKeys={TABLE_KEYS}
        headings={HEADINGS}
        sortFieldMap={SORT_FIELD_MAP}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        tableLoading={loading}
        rows={lessons}
        renderRow={renderRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyText="No lessons found"
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-1200 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-semibold mb-3">Create Lesson</h3>
            <div className="space-y-3">
              <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" placeholder="Title" value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} />
              <textarea className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" rows={3} placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} />
              <textarea className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" rows={3} placeholder="Content" value={createForm.content} onChange={(e) => setCreateForm((p) => ({ ...p, content: e.target.value }))} />
              <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" placeholder="Video URL" value={createForm.videoUrl} onChange={(e) => setCreateForm((p) => ({ ...p, videoUrl: e.target.value }))} />
              <SearchableSelect
                value={createForm.courseId}
                onChange={(v) => setCreateForm((p) => ({ ...p, courseId: v, moduleId: "" }))}
                options={modalCourses.map((c) => ({ value: c._id, label: c.title }))}
                placeholder="Select course"
                searchPlaceholder="Search course..."
              />
            <SearchableSelect
                value={createForm.moduleId}
                onChange={(v) => setCreateForm((p) => ({ ...p, moduleId: v }))}
                options={courseModules.map((m) => ({ value: m._id, label: m.title }))}
                placeholder="Select module"
                searchPlaceholder="Search module..."
              />
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={createForm.isPublished} onChange={(e) => setCreateForm((p) => ({ ...p, isPublished: e.target.checked }))} />
                Published
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="shadow-[0_8px_18px_rgba(15,23,42,0.35)]">Cancel</Button>
              <Button onClick={handleCreateLesson} className="shadow-[0_10px_22px_rgba(37,99,235,0.3)]">Create</Button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedLesson && (
        <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUpdateModal(false)}>
          <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-semibold mb-3">Update Lesson</h3>
            <div className="space-y-3">
              <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" placeholder="Title" value={updateForm.title} onChange={(e) => setUpdateForm((p) => ({ ...p, title: e.target.value }))} />
              <textarea className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" rows={3} placeholder="Description" value={updateForm.description} onChange={(e) => setUpdateForm((p) => ({ ...p, description: e.target.value }))} />
              <textarea className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" rows={3} placeholder="Content" value={updateForm.content} onChange={(e) => setUpdateForm((p) => ({ ...p, content: e.target.value }))} />
              <input className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white" placeholder="Video URL" value={updateForm.videoUrl} onChange={(e) => setUpdateForm((p) => ({ ...p, videoUrl: e.target.value }))} />
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={updateForm.isPublished} onChange={(e) => setUpdateForm((p) => ({ ...p, isPublished: e.target.checked }))} />
                Published
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUpdateModal(false)} className="shadow-[0_8px_18px_rgba(15,23,42,0.35)]">Cancel</Button>
              <Button onClick={handleUpdateLesson} className="shadow-[0_10px_22px_rgba(37,99,235,0.3)]">Update</Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedLesson && (
        <div className="fixed inset-0 z-[1200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-semibold mb-2">Delete Lesson</h3>
            <p className="text-sm text-slate-300">Are you sure you want to delete <span className="text-white font-medium">{selectedLesson.title}</span>?</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="shadow-[0_8px_18px_rgba(15,23,42,0.35)]">Cancel</Button>
              <Button onClick={handleDeleteLesson} className="bg-red-600 hover:bg-red-700 shadow-[0_10px_22px_rgba(220,38,38,0.3)]">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {previewVideoUrl && (
        <div
          className="fixed inset-0 z-[1300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewVideoUrl("")}
        >
          <div
            className="relative w-[90vw] h-[90vw] sm:w-[70vw] sm:h-[70vw] lg:w-[50vw] lg:h-[50vh] max-w-[960px] max-h-[720px] rounded-xl border border-slate-700 bg-slate-950 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewVideoUrl("")}
              className="absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Close
            </button>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="w-full h-full rounded-lg bg-black"
            />
          </div>
        </div>
      )}
    </>
  );
}
