"use client";
import React, { forwardRef } from "react";

const CustomInput = forwardRef(
  (
    {
      height,
      width,    
      label,
      placeholder = "",
      type = "text",
      name,
      value,
      onChange,
      onFocus,
      defaultValue,
      disabled = false,
      required = false,
      className = "",
      inputClassName = "",
      labelClassName = "",
      error,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    // Generate unique id if not provided
    const inputId =
      id || `input-${name || Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e) => {
      if (onChange) {
        onChange(e.target.value, e);
      }
    };

    return (
      <div className={`customInput ${className} ${error ? "has-error" : ""}`} style={{ width }}>
        {label && (
          <label htmlFor={inputId} className={`input-label ${labelClassName}`}>
            {label}
            {required && <span className="required-indicator">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          style={{height}}
          className={`input-field ${inputClassName} ${error ? "error" : ""}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {error && (
          <span id={`${inputId}-error`} className="error_message" role="alert">
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={`${inputId}-helper`} className="helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;