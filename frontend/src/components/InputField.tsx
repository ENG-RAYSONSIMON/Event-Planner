import { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const InputField = ({ label, error, ...props }: InputFieldProps) => (
  <label className="block space-y-1">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <input
      {...props}
      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-50"
    />
    {error ? <span className="text-xs text-red-600">{error}</span> : null}
  </label>
);
