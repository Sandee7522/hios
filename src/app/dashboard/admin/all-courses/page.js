"use client";
import { useEffect, useState } from "react";
import { getUserRole } from "../../utils/auth";
import { GET_ALL_COURSES_ADMIN } from "../../utils/api";
import { requestWithAuth } from "../../utils/apiClient";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";
import PageHeader from "@/components/common/PageHeader";
import AdminTable from "@/components/common/AdminTable";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import CreateAndUpdateCourse from "../commonModals/CreateAndUpdateCourse";
import DeleteCourseModal from "../commonModals/DeleteCourse";

const TABLE_KEYS = [
  "title", "slug", "description", "thumbnail", "instructor", "category",
  "level", "courseLanguage", "price", "discount", "totalFee", "currency",
  "duration", "requirements", "whatYouWillLearn", "tags",
  "status", "isPublished", "created_at",
];

const HEADINGS = {
  title: "Title",
  slug: "Slug",
  description: "Description",
  thumbnail: "Thumbnail",
  instructor: "Instructor",
  category: "Category",
  level: "Level",
  courseLanguage: "Language",
  price: "Price",
  discount: "Discount",
  totalFee: "Total Fee",
  currency: "Currency",
  duration: "Duration",
  requirements: "Requirements",
  whatYouWillLearn: "What You'll Learn",
  tags: "Tags",
  status: "Status",
  isPublished: "Published",
  created_at: "Created",
};

const SORT_FIELD_MAP = {
  title: "title",
  price: "price",
  created_at: "created_at",
};

const STATUS_COLORS = {
  published: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  draft: { bg: "rgba(234,179,8,0.15)", color: "#eab308" },
  pending: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  archived: { bg: "rgba(107,114,128,0.15)", color: "#6b7280" },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
};

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [mounted, setMounted] = useState(false);

  const fetchCourses = async (override = {}) => {
    try {
      setLoading(true);
      setError("");
      const result = await requestWithAuth(GET_ALL_COURSES_ADMIN, {
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
        setCourses(list);
        const meta = result.data?.pagination || {};
        setCurrentPage(meta.page || 1);
        setTotalPages(meta.totalPages || 1);
        setTotalCount(meta.total || list.length);
      } else {
        setCourses([]);
        setError(result?.message || "Failed to load courses");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    const apiField = SORT_FIELD_MAP[key];
    if (!apiField) return;
    const order = sortBy === apiField && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(apiField);
    setSortOrder(order);
    setCurrentPage(1);
    fetchCourses({ sortBy: apiField, sort: order, page: 1 });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
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
    fetchCourses();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchCourses();
  }, [currentPage, search, sortBy, sortOrder]);

  const statusBadge = (course) => {
    const s = course.isPublished ? "published" : course.status || "draft";
    const c = STATUS_COLORS[s] || STATUS_COLORS.draft;
    return (
      <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: c.bg, color: c.color, textTransform: "capitalize" }}>
        {s}
      </span>
    );
  };

  const arrayBadges = (arr) => {
    if (!arr?.length) return "—";
    return (
      <div className="flex flex-wrap gap-1 max-w-[180px]">
        {arr.slice(0, 3).map((item, i) => (
          <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-slate-700/60 text-slate-300 truncate max-w-[100px]">{item}</span>
        ))}
        {arr.length > 3 && <span className="text-[11px] text-slate-500">+{arr.length - 3}</span>}
      </div>
    );
  };

  const publishBadge = (val) => (
    <span style={{
      padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
      background: val ? "rgba(34,197,94,0.15)" : "rgba(234,179,8,0.15)",
      color: val ? "#22c55e" : "#eab308",
    }}>
      {val ? "Yes" : "No"}
    </span>
  );

  const renderRow = (course) => (
    <tr key={course._id} className="hover:bg-slate-800/40 transition-colors">
      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{course.title || "—"}</td>
      <td className="px-4 py-3 text-slate-400 text-xs">{course.slug || "—"}</td>
      <td className="px-4 py-3 text-slate-400 max-w-[180px] truncate">{course.description || "—"}</td>
      <td className="px-4 py-3">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt="" className="w-12 h-8 rounded object-cover border border-slate-700" />
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{course.instructorId?.name || "—"}</td>
      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{course.categoryId?.name || "—"}</td>
      <td className="px-4 py-3 text-slate-400 capitalize">{course.level || "—"}</td>
      <td className="px-4 py-3 text-slate-400">{course.courseLanguage || "—"}</td>
      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">₹{course.price ?? 0}</td>
      <td className="px-4 py-3 text-slate-400">{course.discount ?? 0}</td>
      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">₹{course.totalFee ?? 0}</td>
      <td className="px-4 py-3 text-slate-400">{course.currency || "INR"}</td>
      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
        {course.duration?.hours || course.duration?.minutes
          ? `${course.duration.hours || 0}h ${course.duration.minutes || 0}m`
          : "—"}
      </td>
      <td className="px-4 py-3">{arrayBadges(course.requirements)}</td>
      <td className="px-4 py-3">{arrayBadges(course.whatYouWillLearn)}</td>
      <td className="px-4 py-3">{arrayBadges(course.tags)}</td>
      <td className="px-4 py-3">{statusBadge(course)}</td>
      <td className="px-4 py-3">{publishBadge(course.isPublished)}</td>
      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{course.created_at ? new Date(course.created_at).toLocaleDateString() : "—"}</td>
      <td className="px-4 py-3 sticky right-0 bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedCourse(course); setShowUpdateModal(true); }} className="p-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition">
            <RiEdit2Line size={16} color="#3b82f6" />
          </button>
          <button onClick={() => { setSelectedCourse(course); setShowDeleteModal(true); }} className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 transition">
            <RiDeleteBin6Line size={16} color="#ef4444" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <PageHeader title="Course Management" subtitle={`${totalCount} total courses`} />
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />

      <AdminTable
        title="All Courses"
        totalCount={totalCount}
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search course..."
        headerActions={<Button onClick={() => setShowCreateModal(true)}>Create</Button>}
        tableKeys={TABLE_KEYS}
        headings={HEADINGS}
        sortFieldMap={SORT_FIELD_MAP}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        tableLoading={loading}
        rows={courses}
        renderRow={renderRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyText="No courses found"
      />

      {showCreateModal && (
        <CreateAndUpdateCourse
          onClose={() => setShowCreateModal(false)}
          onSuccess={(msg) => { setSuccessMessage(msg); fetchCourses(); }}
        />
      )}
      {showUpdateModal && selectedCourse && (
        <CreateAndUpdateCourse
          initialData={selectedCourse}
          onClose={() => { setShowUpdateModal(false); setSelectedCourse(null); }}
          onSuccess={(msg) => { setSuccessMessage(msg); setShowUpdateModal(false); setSelectedCourse(null); fetchCourses(); }}
        />
      )}
      {showDeleteModal && selectedCourse && (
        <DeleteCourseModal
          course={selectedCourse}
          onClose={() => { setShowDeleteModal(false); setSelectedCourse(null); }}
          onSuccess={(msg) => { setSuccessMessage(msg); setShowDeleteModal(false); setSelectedCourse(null); fetchCourses(); }}
        />
      )}
    </>
  );
}
