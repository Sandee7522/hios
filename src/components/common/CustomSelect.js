"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./CustomSelect.css"

export default function CustomSelect({
  height,
  width,
  dropdownHeight,
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  searchable = true,
  error,
  disabled = false,
  required = false,
  className = "",
}) {
  const optionsRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);
  const showError = required && !value && error;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // console.log("filtered option length", filteredOptions);

  return (
    <div
      ref={wrapperRef}
      className={`custom-select-comp ${className}`}
      style={{width}}
    >
      {label && (
        <label className="custom-select-comp-label">
          {label}
          {required && (
            <span className="custom-select-comp-required">*</span>
          )}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        aria-required={required}
        aria-invalid={showError}
        onClick={() => !disabled && setOpen(!open)}
        className={`custom-select-comp-button
          ${disabled ? "disabled" : ""}
          ${showError ? "error" : ""}
        `}
        style={{height}}
      >
        <span
          className={!selectedOption ? "custom-select-comp-placeholder" : ""}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FaChevronDown />
      </button>

      {open && !disabled && (
        <div className="custom-select-comp-dropdown">
          {searchable && (
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="custom-select-comp-search"
            />
          )}

          <ul className="custom-select-comp-options" style={{maxHeight:dropdownHeight}}>
            {filteredOptions.length === 0 && (
              <li className="custom-select-comp-empty">
                No results found
              </li>
            )}

            {filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`custom-select-comp-option
                  ${value === opt.value ? "selected" : ""}
                `}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showError && (
        <p className="custom-select-comp-error-text">
          {error}
        </p>
      )}
    </div>
  );
}
