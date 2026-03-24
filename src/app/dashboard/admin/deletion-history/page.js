"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { getUserProfile, getUserRole } from "../../utils/auth";
import { GET_DELETION_LOGS } from "../../utils/api";
import MyLoader from "@/components/landing/MyLoder";
import { requestWithAuth } from "../../utils/apiClient";
import ErrorBox from "@/components/common/ErrorBox";
import PageHeader from "@/components/common/PageHeader";
import AdminTable from "@/components/common/AdminTable";

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

const sortFieldMap = {
  deletedUserName: "deletedUserName",
  deletedByName: "deletedByName",
  reason: "reason",
  created_at: "created_at",
};

const tableKeys = ["deletedUserName", "deletedByName", "reason", "created_at"];
const headings = {
  deletedUserName: "Deleted User",
  deletedByName: "Deleted By",
  reason: "Reason",
  created_at: "Date",
};

export default function DeletionHistory() {
  const [logs, setLogs] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);

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

  const fetchLogs = useCallback(async (override = {}) => {
    setTableLoading(true);
    setError("");
    try {
      const payload = {
        page: override.page ?? currentPage,
        pageSize: itemsPerPage,
        search: (override.search ?? debouncedSearch).trim(),
      };
      const result = await requestWithAuth(GET_DELETION_LOGS, {
        method: "POST",
        body: payload,
        allowedRoles: ["admin"],
      });
      if (result?.status === 200 || result?.data) {
        const logList = Array.isArray(result.data?.logs) ? result.data.logs : [];
        setLogs(logList);
        const meta = result.data?.pagination || {};
        setTotalPages(meta.pages || 1);
        setTotalCount(meta.total || logList.length);
      } else {
        setLogs([]);
        setError(result?.message || "Failed to load logs");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setTableLoading(false);
      setInitialLoading(false);
    }
  }, [currentPage, debouncedSearch]);

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
    fetchLogs();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    fetchLogs();
  }, [currentPage, debouncedSearch]); // eslint-disable-line

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

  const renderRow = (log) => {
    const isExpanded = expandedLogId === log._id;
    const collections = log.deletedCollections || {};
    const collectionEntries = Object.entries(collections);

    return (
      <>
        <tr key={log._id} className="hover:bg-slate-800/35 transition-colors duration-150">
          <td className="px-4 py-3 whitespace-nowrap">
            <div>
              <span className="font-medium text-white">{log.deletedUserName}</span>
              <p className="text-xs text-slate-500">{log.deletedUserEmail}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-300 mt-1">
                {log.deletedUserRole || "user"}
              </span>
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <div>
              <span className="font-medium text-white">{log.deletedByName}</span>
              <p className="text-xs text-slate-500">{log.deletedByEmail}</p>
            </div>
          </td>
          <td className="px-4 py-3 max-w-50">
            <span className="text-slate-400 text-sm truncate block">
              {log.reason || <span className="text-slate-600 italic">No reason provided</span>}
            </span>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-xs">
            {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
          </td>
          <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-slate-900 z-10">
            <button
              onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-cyan-500/15 text-cyan-300 border border-cyan-500/30
                         hover:bg-cyan-500/25 transition-colors duration-150"
            >
              {isExpanded ? "Hide Details" : "View Details"}
            </button>
          </td>
        </tr>

        {isExpanded && (
          <tr>
            <td colSpan={tableKeys.length + 1} className="px-4 py-3 bg-slate-950/45 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2 font-medium">Deleted from collections:</p>
              {collectionEntries.length === 0 ? (
                <p className="text-slate-500 text-sm">No collection data deleted (user record only).</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {collectionEntries.map(([name, count]) => (
                    <span key={name} className="px-2 py-1 rounded bg-red-900/20 text-red-300 text-xs border border-red-500/20">
                      {name}: <strong>{count}</strong>
                    </span>
                  ))}
                </div>
              )}
              {log.reason && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400 font-medium">Reason:</p>
                  <p className="text-sm text-slate-300 mt-1">{log.reason}</p>
                </div>
              )}
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <>
      <PageHeader title="Deletion History" subtitle={`${totalCount} total records`} />
      <ErrorBox message={error} />
      <AdminTable
        title="User Deletion Logs"
        totalCount={totalCount}
        searchValue={searchInput}
        onSearchChange={handleSearch}
        searchPlaceholder="Search by user, admin, or reason..."
        tableKeys={tableKeys}
        headings={headings}
        sortFieldMap={sortFieldMap}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        tableLoading={tableLoading}
        rows={logs}
        renderRow={renderRow}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        emptyText="No deletion logs found"
      />
    </>
  );
}
