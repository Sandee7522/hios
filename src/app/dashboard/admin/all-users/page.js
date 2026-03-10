"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { getUserProfile, getUserRole } from "../../utils/auth";
import { GET_ALL_USERS } from "../../utils/api";
import MyLoader from "@/components/landing/MyLoder";
import { requestWithAuth } from "../../utils/apiClient";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";
import AssignRole from "@/components/common/AssignRole";

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

function StatusBadge({ verified }) {
  return verified ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium bg-green-500/15 text-green-400 border-green-500/30">
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
      Unverified
    </span>
  );
}

/* ── Sort indicator ── */
function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return null;
  return sortOrder === "asc"
    ? <FaArrowUp size={10} className="ml-1 inline text-blue-400" />
    : <FaArrowDown size={10} className="ml-1 inline text-blue-400" />;
}

const sortFieldMap = {
  name: "name",
  email: "email",
  user_type: "role.user_type",
  is_verified: "isEmailVerified",
  created_at: "created_at",
};

const tableKeys = ["name", "email", "user_type", "is_verified", "created_at"];
const headings = { name: "Name", email: "Email", user_type: "Role", is_verified: "Status", created_at: "Joined" };

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <MyLoader />
      </div>
    );
  }

  return (
    <>
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />

      <div className="w-full space-y-4">
        {/* Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
                          px-4 py-4 sm:px-6 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">User Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">{totalCount} total users</p>
            </div>
            <input
              placeholder="Search users..."
              value={searchInput}
              onChange={handleSearch}
              className="w-full sm:w-64 px-3 py-2 rounded-lg text-sm
                         bg-slate-800 border border-slate-700 text-white
                         placeholder:text-slate-500
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors duration-150"
            />
          </div>

          {/* Shimmer loading bar */}
          <div className="h-0.5 overflow-hidden bg-transparent">
            {tableLoading && (
              <div className="h-full bg-linear-to-r from-transparent via-blue-500 to-transparent
                              bg-size-[200%_100%] animate-shimmer" />
            )}
          </div>

          {/* Table */}
          <div
            className="overflow-x-auto w-full"
            style={{
              opacity: tableLoading ? 0.55 : 1,
              pointerEvents: tableLoading ? "none" : "auto",
              transition: "opacity 0.25s ease",
            }}
          >
            <table className="w-full min-w-160 text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {tableKeys.map((key) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-400
                                 uppercase tracking-wider cursor-pointer select-none
                                 hover:text-white transition-colors whitespace-nowrap"
                    >
                      {headings[key]}
                      <SortIcon field={sortFieldMap[key]} sortBy={sortBy} sortOrder={sortOrder} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {users.length === 0 && !tableLoading ? (
                  <tr>
                    <td colSpan={tableKeys.length + 1}
                      className="px-4 py-12 text-center text-slate-500 text-sm">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}
                      className="hover:bg-slate-800/40 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-white">{user.name || "—"}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                        {user.email || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge verified={user.isEmailVerified} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => { setSelectedUser(user); setShowRoleModal(true); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium
                                     bg-amber-500/15 text-amber-400 border border-amber-500/30
                                     hover:bg-amber-500/25 transition-colors duration-150"
                        >
                          Assign Role
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between
                            px-4 py-3 sm:px-6 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Total: <span className="text-white font-medium">{totalCount}</span> users
              </p>
              <div className="pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
