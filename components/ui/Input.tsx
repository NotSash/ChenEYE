"use client";

import React, { forwardRef, useState, useRef, useEffect, useId } from "react";
import { clsx } from "clsx";
import { Eye, EyeOff, ChevronDown, Upload, X, Check, Search } from "lucide-react";

/* ═════════════════════════════════════════════
   Input
   ═════════════════════════════════════════════ */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, required, disabled, type = "text", className, id: propId, ...props }, ref) => {
    const autoId = useId();
    const id = propId || autoId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
            {label}
            {required && <span className="text-[var(--status-rejected)] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={clsx(
              "w-full h-10 rounded-xl px-3 text-sm",
              "bg-[var(--bg-input)] text-[var(--text-primary)]",
              "border transition-all duration-200",
              "placeholder:text-[var(--text-tertiary)]",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              error
                ? "border-[var(--border-error)] focus:ring-[var(--status-rejected)] animate-[shake_0.3s_ease-in-out]"
                : "border-[var(--border-primary)] focus:border-[var(--border-focus)] focus:ring-[var(--brand-primary)]",
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              disabled && "opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)]"
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">{rightIcon}</span>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-xs text-[var(--status-rejected)]" role="alert">{error}</p>
        )}
        {!error && helperText && (
          <p id={`${id}-helper`} className="text-xs text-[var(--text-tertiary)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

/* ═════════════════════════════════════════════
   TextArea
   ═════════════════════════════════════════════ */

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, required, disabled, maxLength, autoResize, className, id: propId, rows = 4, onChange, ...props }, ref) => {
    const autoId = useId();
    const id = propId || autoId;
    const [charCount, setCharCount] = useState(0);
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (autoResize && innerRef.current) {
        innerRef.current.style.height = "auto";
        innerRef.current.style.height = `${Math.min(innerRef.current.scrollHeight, 300)}px`;
      }
      onChange?.(e);
    };

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
            {label}
            {required && <span className="text-[var(--status-rejected)] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }}
          id={id}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={handleChange}
          className={clsx(
            "w-full rounded-xl px-3 py-2.5 text-sm resize-y",
            "bg-[var(--bg-input)] text-[var(--text-primary)]",
            "border transition-all duration-200",
            "placeholder:text-[var(--text-tertiary)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            error
              ? "border-[var(--border-error)] focus:ring-[var(--status-rejected)]"
              : "border-[var(--border-primary)] focus:border-[var(--border-focus)] focus:ring-[var(--brand-primary)]",
            disabled && "opacity-50 cursor-not-allowed bg-[var(--bg-tertiary)]"
          )}
          {...props}
        />
        <div className="flex justify-between">
          <div>
            {error && <p className="text-xs text-[var(--status-rejected)]" role="alert">{error}</p>}
            {!error && helperText && <p className="text-xs text-[var(--text-tertiary)]">{helperText}</p>}
          </div>
          {maxLength && (
            <p className="text-xs text-[var(--text-tertiary)]">{charCount}/{maxLength}</p>
          )}
        </div>
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

/* ═════════════════════════════════════════════
   Select
   ═════════════════════════════════════════════ */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  id?: string;
}

export function Select({
  label, options, placeholder = "Select an option", value, onChange, error, required, disabled, searchable, className, id: propId,
}: SelectProps) {
  const autoId = useId();
  const id = propId || autoId;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    if (e.key === "Enter" && highlighted >= 0 && filtered[highlighted]) {
      onChange?.(filtered[highlighted].value);
      setIsOpen(false);
      setSearch("");
    }
  };

  return (
    <div ref={containerRef} className={clsx("flex flex-col gap-1.5 relative", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {required && <span className="text-[var(--status-rejected)] ml-0.5">*</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          "w-full h-10 rounded-xl px-3 text-sm text-left flex items-center justify-between",
          "bg-[var(--bg-input)] border transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          error
            ? "border-[var(--border-error)] focus:ring-[var(--status-rejected)]"
            : "border-[var(--border-primary)] focus:border-[var(--border-focus)] focus:ring-[var(--brand-primary)]",
          disabled && "opacity-50 cursor-not-allowed",
          selectedLabel ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
        )}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown size={16} className={clsx("transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-lg max-h-60 overflow-auto animate-fadeIn">
          {searchable && (
            <div className="p-2 border-b border-[var(--border-primary)]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setHighlighted(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className="w-full h-8 pl-8 pr-3 text-sm rounded-lg bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>
          )}
          <ul role="listbox">
            {filtered.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={clsx(
                  "px-3 py-2 text-sm cursor-pointer transition-colors",
                  "hover:bg-[var(--bg-hover)]",
                  opt.value === value && "bg-[var(--bg-accent-subtle)] text-[var(--brand-primary)] font-medium",
                  i === highlighted && "bg-[var(--bg-hover)]"
                )}
                onClick={() => {
                  onChange?.(opt.value);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                <span className="flex items-center justify-between">
                  {opt.label}
                  {opt.value === value && <Check size={14} />}
                </span>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-[var(--text-tertiary)]">No options found</li>
            )}
          </ul>
        </div>
      )}
      {error && <p className="text-xs text-[var(--status-rejected)]" role="alert">{error}</p>}
    </div>
  );
}

/* ═════════════════════════════════════════════
   Checkbox
   ═════════════════════════════════════════════ */

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function Checkbox({ label, checked = false, onChange, disabled, error, className, id: propId }: CheckboxProps) {
  const autoId = useId();
  const id = propId || autoId;

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <label htmlFor={id} className={clsx("flex items-start gap-2.5 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
        <div className="relative shrink-0 mt-0.5">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.checked)}
            className="sr-only"
          />
          <div
            className={clsx(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
              checked
                ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]"
                : "bg-[var(--bg-input)] border-[var(--border-secondary)]",
              error && !checked && "border-[var(--border-error)]"
            )}
          >
            {checked && <Check size={14} className="text-white" />}
          </div>
        </div>
        {label && <span className="text-sm text-[var(--text-primary)] select-none">{label}</span>}
      </label>
      {error && <p className="text-xs text-[var(--status-rejected)] ml-7" role="alert">{error}</p>}
    </div>
  );
}

/* ═════════════════════════════════════════════
   FileUpload
   ═════════════════════════════════════════════ */

export interface FileUploadProps {
  accept?: string;
  maxSize?: number;        // bytes
  maxFiles?: number;
  onFilesSelected?: (files: File[]) => void;
  existingFiles?: File[];
  errors?: string[];
  className?: string;
}

export function FileUpload({
  accept = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo",
  maxSize = 50 * 1024 * 1024,
  maxFiles = 4,
  onFilesSelected,
  existingFiles = [],
  errors = [],
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = existingFiles.map((f) => {
      if (f.type.startsWith("image/")) return URL.createObjectURL(f);
      return "";
    });
    setPreviews(urls);
    return () => urls.forEach((u) => { if (u) URL.revokeObjectURL(u); });
  }, [existingFiles]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (newFiles: File[]) => {
    const combined = [...existingFiles, ...newFiles].slice(0, maxFiles);
    onFilesSelected?.(combined);
  };

  const removeFile = (index: number) => {
    const updated = existingFiles.filter((_, i) => i !== index);
    onFilesSelected?.(updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
          "flex flex-col items-center gap-3",
          dragActive
            ? "border-[var(--brand-primary)] bg-[var(--bg-accent-subtle)]"
            : "border-[var(--border-secondary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-hover)]"
        )}
      >
        <Upload size={32} className="text-[var(--text-tertiary)]" />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Drag & drop your files here, or click to browse</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">JPG, PNG, WEBP, MP4, MOV, AVI</p>
          <p className="text-xs text-[var(--text-tertiary)]">Images: max 5MB | Videos: max 50MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ""; }}
          className="hidden"
        />
      </div>

      {/* File count */}
      {existingFiles.length > 0 && (
        <p className="text-xs text-[var(--text-secondary)]">{existingFiles.length}/{maxFiles} files selected</p>
      )}

      {/* Previews */}
      {existingFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {existingFiles.map((file, i) => {
            const isOverSize = file.size > maxSize || (file.type.startsWith("image/") && file.size > 5 * 1024 * 1024);
            return (
              <div
                key={`${file.name}-${i}`}
                className={clsx(
                  "rounded-xl border p-2 relative group",
                  isOverSize ? "border-[var(--border-error)] bg-[var(--bg-danger-subtle)]" : "border-[var(--border-primary)] bg-[var(--bg-card)]"
                )}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--status-rejected)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} />
                </button>
                <div className="aspect-video rounded-lg overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center mb-2">
                  {previews[i] ? (
                    <img src={previews[i]} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🎬</span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-primary)] truncate">{file.name}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{formatSize(file.size)}</p>
                {isOverSize && (
                  <p className="text-xs text-[var(--status-rejected)] mt-1">File exceeds size limit</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Errors */}
      {errors.map((err, i) => (
        <p key={i} className="text-xs text-[var(--status-rejected)]" role="alert">{err}</p>
      ))}
    </div>
  );
}
