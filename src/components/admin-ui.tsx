import Link from "next/link";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const inputCls =
  "mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  step,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  step?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  );
}

export function TextareaField({
  label,
  name,
  defaultValue,
  rows = 3,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className={inputCls}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink/80">{label}</span>
      <select name={name} defaultValue={defaultValue} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-black/20 text-brand focus:ring-brand"
      />
      {label}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand"
    >
      {children}
    </button>
  );
}

export function DeleteButton({
  action,
  id,
  label = "Delete",
}: {
  action: (formData: FormData) => void;
  id: string;
  label?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink/50 transition-colors hover:bg-red-50 hover:text-red-600">
        {label}
      </button>
    </form>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-brand hover:underline">
      {children}
    </Link>
  );
}
