"use client";
import { useEffect, useState } from "react";
import styles from "../../dashboard.module.css";
import { getUserProfile, getUserRole } from "../../utils/auth";
import { GET_ALL_CATEGORY_ADMIN } from "../../utils/api";
import MyLoader from "@/components/landing/MyLoder";
import { requestWithAuth } from "../../utils/apiClient";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";
import {
  FaArrowUp,
  FaArrowDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Pagination from "@/components/common/Pagination";
import AssignRole from "@/components/common/AssignRole";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import CreateCategoryModal from "../commonModals/CreateAndUpdateCategory";

export default function AllUsers() {
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [mounted, setMounted] = useState(false);

  const sortFieldMap = {
    name: "name",
    slug: "slug",
    description: "description",
    icon: "icon",
    isAction: "isAction",
    created_at: "created_at",
    updated_at: "updated_at",
  };

  const fetchUsers = async (override = {}) => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        page: override.page ?? currentPage,
        pageSize: itemsPerPage,
        search: search.trim(),
        sortBy: override.sortBy ?? sortBy,
        sort: override.sort ?? sortOrder,
      };

      const result = await requestWithAuth(GET_ALL_CATEGORY_ADMIN, {
        method: "POST",
        body: payload,
        allowedRoles: ["admin"],
      });
      console.log("API result:", JSON.stringify(result, null, 2));

      if (result?.status === 200 || result?.data) {
        const userList = Array.isArray(result.data?.data)
          ? result.data.data
          : [];

        setUsers(userList);

        const meta = result.data?.pagination || {};
        setTotalPages(meta.pages || meta.totalPages || 1);
        setTotalCount(meta.total || meta.totalCount || userList.length);
      } else {
        setUsers([]);
        setError(result?.message || "Failed to load users");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    const apiField = sortFieldMap[key];
    if (!apiField) return;
    const order = sortBy === apiField && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(apiField);
    setSortOrder(order);
    setCurrentPage(1);
    fetchUsers({ sortBy: apiField, sort: order, page: 1 });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Initial load
  useEffect(() => {
    const userProfile = getUserProfile();
    setProfile(userProfile);

    const role = getUserRole();
    if (role !== "admin") {
      setError("You do not have permission to view this page.");
      setLoading(false);
      return;
    }

    fetchUsers();
    setMounted(true);
  }, []);

  // Re-fetch on page/search/sort change (skip initial mount)
  useEffect(() => {
    if (!mounted) return;
    fetchUsers();
  }, [currentPage, search, sortBy, sortOrder]);

  const getRoleBadgeStyle = (roleObj) => {
    switch (roleObj?.user_type) {
      case "admin":
        return styles.badgeDanger;
      case "instructor":
        return styles.badgePrimary;
      default:
        return styles.badgeInfo;
    }
  };

  const getStatusBadgeStyle = (verified) =>
    verified ? styles.badgeSuccess : styles.badgeWarning;

  const formatHeading = (key) =>
    ({
      name: "Name",
      slug: "Slug",
      description: "Dscription",
      //   icon: "Icon",
      isActive: "isActive",
      created_at: "Created",
      updated_at: "Updated",
    })[key] || key;

  const tableKeys = [
    "name",
    "slug",
    "description",
    "isActive",
    "created_at",
    "updated_at",
  ];

  return (
    <>
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />
      <div>
        <main className={styles.card}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>All Category</h2>
              <div>
                <div
                  className={styles.searchDiv}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "1rem",
                  }}
                >
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create
                  </Button>

                  <input
                    placeholder="Search category..."
                    value={search}
                    onChange={handleSearch}
                    className={styles.formInput}
                    style={{ width: "280px", padding: "0.6rem" }}
                  />
                </div>
              </div>
            </div>

            <div className={`${styles.cardBody} admin-table-wrap`}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    {tableKeys.map((key) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        style={{ cursor: "pointer" }}
                      >
                        {formatHeading(key)}
                        {sortBy === sortFieldMap[key] &&
                          (sortOrder === "asc" ? (
                            <FaArrowUp
                              size={12}
                              style={{ marginLeft: "6px" }}
                            />
                          ) : (
                            <FaArrowDown
                              size={12}
                              style={{ marginLeft: "6px" }}
                            />
                          ))}
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={tableKeys.length + 1}
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        <MyLoader />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableKeys.length + 1}
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className={styles.tableRow}>
                        <td data-label="Name">
                          <div
                            className={styles.flexRow}
                            style={{ alignItems: "center", gap: "0.6rem" }}
                          >
                            <strong>{user.name || "—"}</strong>
                          </div>
                        </td>

                        <td data-label="Email">{user.slug || "—"}</td>

                        <td data-label="Description">
                          {user.description || "—"}
                        </td>

                        {/* <td data-label="Icon">
                          {user.icon}
                        </td> */}

                        <td data-label="Is Active">
                          {user.isActive ? "Yes" : "No"}
                        </td>

                        <td data-label="Joined">
                          {user.created_at
                            ? new Date(user.updated_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td data-label="Joined">
                          {user.updated_at
                            ? new Date(user.updated_at).toLocaleDateString()
                            : "—"}
                        </td>

                        <td data-label="Actions">
                          <div className={`${styles.flexRow} ${styles.gap1}`}>
                            {/* EDIT */}
                            <button
                              className={`${styles.btn} ${styles.btnWarning}`}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUpdateModal(true);
                              }}
                            >
                              <RiEdit2Line size={20} color="#245ffe" />
                            </button>

                            {/* DELETE */}
                            <button
                              className={`${styles.btn} ${styles.btnDanger}`}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                            >
                              <RiDeleteBin6Line size={20} color="#f11e1e" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination & Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 0.8rem",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <b>Total users:</b> {totalCount}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>
        </main>
      </div>
      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchCategories}
          initialData={tableKeys}
        />
      )}
      {showUpdateModal && selectedUser && (
        <CreateCategoryModal
          user={selectedUser}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            fetchUsers();
          }}
        />
      )}
      {showDeleteModal && selectedUser && (
        <AssignRole
          user={selectedUser}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            fetchUsers();
          }}
        />
      )}
    </>
  );
}
