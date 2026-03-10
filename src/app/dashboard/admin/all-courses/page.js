"use client";
import { useEffect, useState } from "react";
import styles from "../../dashboard.module.css";
import { getUserProfile, getUserRole } from "../../utils/auth";
import { GET_ALL_COURSES_ADMIN } from "../../utils/api";
import MyLoader from "@/components/landing/MyLoder";
import { requestWithAuth } from "../../utils/apiClient";
import SuccessBox from "@/components/common/SuccessBox";
import ErrorBox from "@/components/common/ErrorBox";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";
import { RiDeleteBin6Line, RiEdit2Line } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import CreateCategoryModal from "../commonModals/CreateAndUpdateCategory";

export default function AllCourses() {

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [mounted, setMounted] = useState(false);

  const tableKeys = [
    "title",
    "slug",
    "description",
    "instructor",
    "category",
    "level",
    "courseLanguage",
    "price",
    "status",
    "created_at",
  ];

  const sortFieldMap = {
    title: "title",
    slug: "slug",
    description: "description",
    created_at: "created_at",
  };

  const formatHeading = (key) =>
    ({
      title: "Title",
      slug: "Slug",
      description: "Description",
      instructor: "Instructor",
      category: "Category",
      level: "Level",
      courseLanguage: "Language",
      price: "Price",
      status: "Status",
      created_at: "Created",
    })[key] || key;

  const fetchCourses = async (override = {}) => {
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

      const result = await requestWithAuth(GET_ALL_COURSES_ADMIN, {
        method: "POST",
        body: payload,
        allowedRoles: ["admin"],
      });

      console.log("API result:", result);

      if (result?.status === 200 || result?.data) {

        const list = Array.isArray(result.data?.data)
          ? result.data.data
          : [];

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

    const apiField = sortFieldMap[key];
    if (!apiField) return;

    const order =
      sortBy === apiField && sortOrder === "asc" ? "desc" : "asc";

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

    const userProfile = getUserProfile();
    setProfile(userProfile);

    const role = getUserRole();

    if (role !== "admin") {
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

  return (
    <>
      <ErrorBox message={error} />
      <SuccessBox message={successMessage} />

      <main className={styles.card}>

        <div className={styles.cardHeader}>

          <h2 className={styles.cardTitle}>All Courses</h2>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >

            <Button onClick={() => setShowCreateModal(true)}>
              Create
            </Button>

            <input
              placeholder="Search course..."
              value={search}
              onChange={handleSearch}
              className={styles.formInput}
              style={{ width: "280px" }}
            />

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
                        <FaArrowUp size={12} />
                      ) : (
                        <FaArrowDown size={12} />
                      ))}

                  </th>

                ))}

                <th>Actions</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan={tableKeys.length + 1} style={{ textAlign: "center", padding: "2rem" }}>
                    <MyLoader />
                  </td>
                </tr>

              ) : courses.length === 0 ? (

                <tr>
                  <td colSpan={tableKeys.length + 1} style={{ textAlign: "center", padding: "2rem" }}>
                    No courses found
                  </td>
                </tr>

              ) : (

                courses.map((course) => (

                  <tr key={course._id} className={styles.tableRow}>

                    <td>{course.title || "—"}</td>

                    <td>{course.slug || "—"}</td>

                    <td>{course.description || "—"}</td>

                    <td>{course.instructorId?.name || "—"}</td>

                    <td>{course.categoryId?.name || "—"}</td>

                    <td>{course.level || "—"}</td>

                    <td>{course.courseLanguage || "—"}</td>

                    <td>₹{course.price}</td>

                    <td>
                      {course.isPublished ? "Published" : "Draft"}
                    </td>

                    <td>
                      {course.created_at
                        ? new Date(course.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>

                      <div className={styles.flexRow}>

                        <button
                          className={`${styles.btn} ${styles.btnWarning}`}
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowUpdateModal(true);
                          }}
                        >
                          <RiEdit2Line size={18} />
                        </button>

                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                        >
                          <RiDeleteBin6Line size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "1rem",
          }}
        >

          <div>
            <b>Total Courses:</b> {totalCount}
          </div>

          {totalPages > 1 && (

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />

          )}

        </div>

      </main>

      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchCourses}
        />
      )}

      {showUpdateModal && selectedCourse && (
        <CreateCategoryModal
          user={selectedCourse}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            fetchCourses();
          }}
        />
      )}
    </>
  );
}