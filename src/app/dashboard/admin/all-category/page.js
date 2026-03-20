"use client";
import { useEffect, useState } from "react";
import { getUserRole } from "../../utils/auth";
import { GET_ALL_CATEGORY_ADMIN } from "../../utils/api";
import { requestWithAuth } from "../../utils/apiClient";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";
import PageHeader from "@/components/common/PageHeader";
import AdminTable from "@/components/common/AdminTable";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import CreateCategoryModal from "../commonModals/CreateAndUpdateCategory";
import DeleteCtgModal from "../commonModals/DeleteCategory";

const TABLE_KEYS = ["name", "slug", "description", "isActive", "created_at", "updated_at"];

const HEADINGS = {
  name: "Name",
  slug: "Slug",
  description: "Description",
  isActive: "Active",
  created_at: "Created",
  updated_at: "Updated",
};

const SORT_FIELD_MAP = {
  name: "name",
  slug: "slug",
  created_at: "created_at",
  updated_at: "updated_at",
};

export default function AllCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [mounted, setMounted] = useState(false);

  const fetchCategories = async (override = {}) => {
    try {
      setLoading(true);
      setError("");
      const result = await requestWithAuth(GET_ALL_CATEGORY_ADMIN, {
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
        setCategories(list);
        const meta = result.data?.pagination || {};
        setTotalPages(meta.pages || meta.totalPages || 1);
        setTotalCount(meta.total || meta.totalCount || list.length);
      } else {
        setCategories([]);
        setError(result?.message || "Failed to load categories");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
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
    fetchCategories({ sortBy: apiField, sort: order, page: 1 });
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
    fetchCategories();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchCategories();
  }, [currentPage, search, sortBy, sortOrder]);

  const renderRow = (cat) => (
    <tr key={cat._id} className="hover:bg-slate-800/40 transition-colors">
      <td className="px-4 py-3 text-white font-medium">{cat.name || "—"}</td>
      <td className="px-4 py-3 text-slate-400">{cat.slug || "—"}</td>
      <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{cat.description || "—"}</td>
      <td className="px-4 py-3">
        <span style={{
          padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
          background: cat.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
          color: cat.isActive ? "#22c55e" : "#ef4444",
        }}>
          {cat.isActive ? "Yes" : "No"}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500">{cat.created_at ? new Date(cat.created_at).toLocaleDateString() : "—"}</td>
      <td className="px-4 py-3 text-slate-500">{cat.updated_at ? new Date(cat.updated_at).toLocaleDateString() : "—"}</td>
      <td className="px-4 py-3 sticky right-0 bg-slate-900 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedCategory(cat); setShowUpdateModal(true); }} className="p-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition">
            <RiEdit2Line size={16} color="#3b82f6" />
          </button>
          <button onClick={() => { setSelectedCategory(cat); setShowDeleteModal(true); }} className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 transition">
            <RiDeleteBin6Line size={16} color="#ef4444" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <PageHeader title="Category Management" subtitle={`${totalCount} total categories`} />
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />

      <AdminTable
        title="All Categories"
        totalCount={totalCount}
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search category..."
        headerActions={<Button onClick={() => setShowCreateModal(true)}>Create</Button>}
        tableKeys={TABLE_KEYS}
        headings={HEADINGS}
        sortFieldMap={SORT_FIELD_MAP}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        tableLoading={loading}
        rows={categories}
        renderRow={renderRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyText="No categories found"
      />

      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(msg) => { setSuccessMessage(msg); fetchCategories(); }}
        />
      )}
      {showUpdateModal && selectedCategory && (
        <CreateCategoryModal
          initialData={selectedCategory}
          onClose={() => { setShowUpdateModal(false); setSelectedCategory(null); }}
          onSuccess={(msg) => { setSuccessMessage(msg); setShowUpdateModal(false); setSelectedCategory(null); fetchCategories(); }}
        />
      )}
      {showDeleteModal && selectedCategory && (
        <DeleteCtgModal
          category={selectedCategory}
          onClose={() => { setShowDeleteModal(false); setSelectedCategory(null); }}
          onSuccess={(msg) => { setSuccessMessage(msg); setShowDeleteModal(false); setSelectedCategory(null); fetchCategories(); }}
        />
      )}
    </>
  );
}
