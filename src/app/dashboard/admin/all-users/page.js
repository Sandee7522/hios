"use client";
import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import { getUserProfile, getUserRole } from "../../utils/auth";
import { GET_ALL_USERS, FORCE_LOGOUT_USER } from "../../utils/api";
import MyLoader from "@/components/landing/MyLoder";
import { requestWithAuth } from "../../utils/apiClient";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";
import AssignRole from "@/components/common/AssignRole";
import PageHeader from "@/components/common/PageHeader";
import AdminTable from "@/components/common/AdminTable";
import ConfirmModal from "@/components/common/ConfirmModal";
import GenerateCouponModal from "@/components/common/GenerateCouponModal";

/** Debounce – delays a value by `delay` ms */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

/* ── Badge helpers ── */
function RoleBadge({ role }) {
  const map = {
    admin: "bg-red-500/15 text-red-400 border-red-500/30",
    instructor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const cls = map[role?.user_type] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${cls}`}>
      {role?.user_type || "user"}
    </span>
  );
}

const sortFieldMap = {
  name: "name",
  email: "email",
  user_type: "role.user_type",
  created_at: "created_at",
};

const tableKeys = ["name", "email", "user_type", "created_at"];
const headings = { name: "Name", email: "Email", user_type: "Role", created_at: "Joined" };

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [forceLogoutLoading, setForceLogoutLoading] = useState(null);
  const [forceLogoutUser, setForceLogoutUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [couponUser, setCouponUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const hasInitializedRef = useRef(false);
  const isFirstRun = useRef(true);

  const fetchUsers = useCallback(async (override = {}) => {
    setTableLoading(true);
    setError("");
    try {
      const payload = {
        page: override.page ?? currentPage,
        pageSize: itemsPerPage,
        search: (override.search ?? debouncedSearch).trim(),
        sortBy: override.sortBy ?? sortBy,
        sort: override.sort ?? sortOrder,
      };
      const result = await requestWithAuth(GET_ALL_USERS, {
        method: "POST", body: payload, allowedRoles: ["admin"],
      });
      if (result?.status === 200 || result?.data) {
        const userList = Array.isArray(result.data?.users) ? result.data.users : [];
        setUsers(userList);
        const meta = result.data?.pagination || {};
        setTotalPages(meta.pages || meta.totalPages || 1);
        setTotalCount(meta.total || meta.totalCount || userList.length);
      } else {
        setUsers([]);
        setError(result?.message || "Failed to load users");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setTableLoading(false);
      setInitialLoading(false);
    }
  }, [currentPage, debouncedSearch, sortBy, sortOrder]);

  // Initial auth check + load
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    getUserProfile();
    const role = getUserRole();
    if (role !== "admin") {
      setError("You do not have permission to view this page.");
      setInitialLoading(false);
      setTableLoading(false);
      return;
    }
    fetchUsers();
  }, []); // eslint-disable-line

  // Re-fetch on change
  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    fetchUsers();
  }, [currentPage, debouncedSearch, sortBy, sortOrder]); // eslint-disable-line

  const handleSearch = (e) => { setSearchInput(e.target.value); setCurrentPage(1); };

  const handleSort = (key) => {
    const apiField = sortFieldMap[key];
    if (!apiField) return;
    const order = sortBy === apiField && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(apiField);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleForceLogout = async () => {
    if (!forceLogoutUser) return;

    setForceLogoutLoading(forceLogoutUser.id);
    setError("");
    setSuccessMessage("");
    try {
      await requestWithAuth(FORCE_LOGOUT_USER, {
        method: "POST",
        body: { userId: forceLogoutUser.id, reason: deleteReason.trim() },
        allowedRoles: ["admin"],
      });
      setSuccessMessage(
        `User "${forceLogoutUser.name || forceLogoutUser.email}" has been force logged out and all data deleted successfully.`
      );
      fetchUsers();
    } catch (err) {
      setError(err.message || "Failed to force logout user");
    } finally {
      setForceLogoutLoading(null);
      setForceLogoutUser(null);
      setDeleteReason("");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <MyLoader />
      </div>
    );
  }

  const renderRow = (user) => {
    const isExpanded = expandedUserId === user.id;
    const tracking = user.courseTracking || {};
    const courses = Array.isArray(tracking.courses) ? tracking.courses : [];

    return (
      <Fragment key={user.id}>
        <tr className="hover:bg-slate-800/35 transition-colors duration-150">
          <td className="px-4 py-3 whitespace-nowrap">
            <span className="font-medium text-white">{user.name || "—"}</span>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-slate-400">
            {user.email || "—"}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <RoleBadge role={user.role} />
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-xs">
            {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
          </td>
          <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-slate-900 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-cyan-500/15 text-cyan-300 border border-cyan-500/30
                           hover:bg-cyan-500/25 transition-colors duration-150"
              >
                {isExpanded ? "Hide Courses" : "View Courses"}
              </button>
              <button
                onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-amber-500/15 text-amber-400 border border-amber-500/30
                           hover:bg-amber-500/25 transition-colors duration-150"
              >
                Assign Role
              </button>
              {(user.role?.user_type === "admin" || user.role?.user_type === "instructor") && (
                <button
                  onClick={() => setCouponUser(user)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-emerald-500/15 text-emerald-400 border border-emerald-500/30
                             hover:bg-emerald-500/25 transition-colors duration-150"
                >
                  Generate Coupon
                </button>
              )}
              <button
                onClick={() => setForceLogoutUser(user)}
                disabled={forceLogoutLoading === user.id}
                className="px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-red-500/15 text-red-400 border border-red-500/30
                           hover:bg-red-500/25 transition-colors duration-150
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forceLogoutLoading === user.id ? "Deleting..." : "Force Logout"}
              </button>
            </div>
          </td>
        </tr>

        {isExpanded && (
          <tr>
            <td colSpan={tableKeys.length + 1} className="px-4 py-3 bg-slate-950/45 border-t border-slate-800">
              <div className="flex flex-wrap gap-3 text-xs text-slate-300 mb-3">
                <span className="px-2 py-1 rounded bg-slate-800">
                  Total: <span className="text-white font-medium">{tracking.totalCourses ?? 0}</span>
                </span>
                <span className="px-2 py-1 rounded bg-emerald-900/30 text-emerald-300">
                  Completed: <span className="font-medium">{tracking.completedCourses ?? 0}</span>
                </span>
                <span className="px-2 py-1 rounded bg-amber-900/30 text-amber-300">
                  In Progress: <span className="font-medium">{tracking.inProgressCourses ?? 0}</span>
                </span>
              </div>

              {courses.length === 0 ? (
                <p className="text-slate-500 text-sm">No courses tracked for this user.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-800">
                        <th className="py-2 pr-3">Course</th>
                        <th className="py-2 pr-3">Progress</th>
                        <th className="py-2 pr-3">Payment</th>
                        <th className="py-2 pr-3">Paid</th>
                        <th className="py-2 pr-3">Remaining</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.enrollmentId} className="border-b border-slate-800/60">
                          <td className="py-2 pr-3 text-slate-200">{course.courseTitle || "—"}</td>
                          <td className="py-2 pr-3 text-slate-300">{course.progress ?? 0}%</td>
                          <td className="py-2 pr-3 text-slate-300 capitalize">{course.paymentStatus || "pending"}</td>
                          <td className="py-2 pr-3 text-slate-300">₹{course.totalPaid ?? 0}</td>
                          <td className="py-2 pr-3 text-slate-300">₹{course.remainingAmount ?? 0}</td>
                          <td className="py-2 pr-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${course.completed ? "bg-emerald-900/30 text-emerald-300" : "bg-amber-900/30 text-amber-300"}`}>
                              {course.completed ? "Completed" : "In Progress"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  return (
    <>
      <PageHeader title="User Management" subtitle={`${totalCount} total users`} />
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />
      <AdminTable
        title="All Users"
        totalCount={totalCount}
        searchValue={searchInput}
        onSearchChange={handleSearch}
        searchPlaceholder="Search users..."
        tableKeys={tableKeys}
        headings={headings}
        sortFieldMap={sortFieldMap}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        tableLoading={tableLoading}
        rows={users}
        renderRow={renderRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        emptyText="No users found"
      />

      {showRoleModal && selectedUser && (
        <AssignRole
          user={selectedUser}
          onClose={() => setShowRoleModal(false)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            fetchUsers();
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!forceLogoutUser}
        title="Force Logout & Delete User"
        message={
          <>
            Are you sure you want to force logout and permanently delete all data for{" "}
            <strong className="text-white">{forceLogoutUser?.name || forceLogoutUser?.email}</strong>?
            <br /><br />
            This will remove the user and their data from every collection. This action cannot be undone.
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Reason for deletion (optional)"
              rows={2}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600
                         text-white text-sm placeholder-slate-500 focus:border-red-500/50
                         focus:outline-none focus:ring-1 focus:ring-red-500/20 resize-none"
            />
          </>
        }
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        loading={!!forceLogoutLoading}
        onConfirm={handleForceLogout}
        onCancel={() => { setForceLogoutUser(null); setDeleteReason(""); }}
      />

      {couponUser && (
        <GenerateCouponModal
          user={couponUser}
          onClose={() => setCouponUser(null)}
          onSuccess={(msg) => setSuccessMessage(msg)}
        />
      )}
    </>
  );
}
