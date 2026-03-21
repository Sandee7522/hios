/**
 * AdminTable – reusable admin data table component
 *
 * Props:
 *  title          string          - Card heading
 *  totalCount     number          - Total record count
 *  searchValue    string          - Controlled search input value
 *  onSearchChange fn(e)           - onChange for search input
 *  searchPlaceholder string       - Input placeholder text
 *  headerActions  ReactNode       - Optional buttons/actions next to search (e.g. "Create" button)
 *  tableKeys      string[]        - Column keys in display order
 *  headings       { [key]: label} - Map of key → column heading label
 *  sortFieldMap   { [key]: api}   - Map of display key → API field name
 *  sortBy         string          - Active sort API field
 *  sortOrder      "asc"|"desc"    - Active sort direction
 *  onSort         fn(key)         - Called with the display key when a header is clicked
 *  tableLoading   bool            - Shows shimmer bar + dims table
 *  rows           any[]           - Data rows
 *  renderRow      fn(row) → <tr>  - Renders a single <tr> for a row
 *  currentPage    number
 *  totalPages     number
 *  onPageChange   fn(page)
 *  emptyText      string          - Message when no rows
 */

import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";

function SortIcon({ field, sortBy, sortOrder }) {
    if (sortBy !== field) return null;
    return sortOrder === "asc"
        ? <FaArrowUp size={10} className="ml-1 inline text-blue-400" />
        : <FaArrowDown size={10} className="ml-1 inline text-blue-400" />;
}

export default function AdminTable({
    title,
    totalCount = 0,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    headerActions,
    tableKeys = [],
    headings = {},
    sortFieldMap = {},
    sortBy,
    sortOrder,
    onSort,
    tableLoading = false,
    rows = [],
    renderRow,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    emptyText = "No records found",
}) {
    return (
        <div className="w-full">
            <div className="rounded-2xl border border-indigo-900/40 bg-[linear-gradient(160deg,#141834_0%,#131730_52%,#111427_100%)] shadow-[0_14px_34px_rgba(5,8,24,0.65)] overflow-hidden">

                {/* ── Card Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
                        px-4 py-3 sm:px-5 border-b border-indigo-900/30 bg-slate-950/35">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
                        <p className="text-xs text-slate-300/70 mt-0.5">{totalCount} total records</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {headerActions}
                        <input
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={onSearchChange}
                            className="w-full sm:w-64 px-3 py-2 rounded-xl text-sm
                         bg-slate-950/70 border border-slate-700/70 text-white
                         placeholder:text-slate-300/40
                         focus:outline-none focus:ring-2 focus:ring-slate-500/40 focus:border-slate-500/70
                         transition-colors duration-150"
                        />
                    </div>
                </div>

                {/* ── Shimmer loading bar ── */}
                <div className="h-0.5 overflow-hidden bg-transparent">
                    {tableLoading && (
                        <div
                            className="h-full"
                            style={{
                                background: "linear-gradient(90deg, transparent 0%, #3b82f6 40%, #60a5fa 60%, transparent 100%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.1s ease-in-out infinite",
                            }}
                        />
                    )}
                </div>

                {/* ── Table ── */}
                <div
                    className="overflow-x-auto w-full"
                    style={{
                        opacity: tableLoading ? 0.55 : 1,
                        pointerEvents: tableLoading ? "none" : "auto",
                        transition: "opacity 0.25s ease",
                    }}
                >
                    <table className="w-full text-[20px] table-auto" style={{ minWidth: "760px" }}>
                        <thead>
                            <tr className="border-b border-indigo-900/30 bg-slate-950/45">
                                {tableKeys.map((key) => (
                                    <th
                                        key={key}
                                        onClick={() => onSort?.(key)}
                                        className="px-4 py-3 text-left text-[20px] font-semibold text-slate-200/80
                               uppercase tracking-wider cursor-pointer select-none
                               hover:text-white transition-colors whitespace-nowrap border-r border-indigo-900/30 last:border-r-0"
                                    >
                                        {headings[key] || key}
                                        <SortIcon
                                            field={sortFieldMap[key]}
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                        />
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-left text-[20px] font-semibold text-slate-200/80 uppercase tracking-wider sticky right-0 bg-[#1b1f4a] z-10">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-indigo-900/25">
                            {rows.length === 0 && !tableLoading ? (
                                <tr>
                                    <td
                                        colSpan={tableKeys.length + 1}
                                        className="px-4 py-12 text-center text-slate-500 text-sm"
                                    >
                                        {emptyText}
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row, i) => renderRow(row, i))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between
                          px-4 py-2.5 sm:px-5 border-t border-slate-800">
                        <p className="text-xs text-slate-500">
                            Total: <span className="text-white font-medium">{totalCount}</span> records
                        </p>
                        <div className="pagination">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
