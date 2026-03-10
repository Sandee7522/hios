"use client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  const buttonStyle = {
    width: "25px",
    height: "25px",
    borderRadius: "20px",
    border: "2px solid #e5e7eb",
    background: "white",
    fontSize: "16px",
    fontWeight: "600",
    color: "#444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const activeStyle = {
    background: "#3b82f6",
    color: "white",
    border: "2px solid #3b82f6",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "14px 18px",
        borderRadius: "10px",
        justifyContent: "center",
      }}
    >
      <button
        style={buttonStyle}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <FaChevronLeft size={12} />
      </button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={index}
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#666",
              padding: "0 5px",
            }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...buttonStyle,
              ...(currentPage === page ? activeStyle : {}),
            }}
          >
            {page}
          </button>
        ),
      )}

      <button
        style={buttonStyle}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
}
