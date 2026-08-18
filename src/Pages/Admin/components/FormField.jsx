export default function FormField({
  label,
  error,
  required,
  as = "input",
  className = "",
  ...props
}) {
  const Component = as;

  const inputClasses = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-slate-900 ${
    error ? "border-red-300" : "border-slate-200"
  } ${className}`;

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <Component
        className={inputClasses}
        aria-invalid={Boolean(error)}
        {...props}
      />

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
