import type { InputHTMLAttributes, ReactNode } from "react";

type ContactInputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "autoComplete" | "defaultValue" | "name"
> & {
  label: string;
  placeholder: string;
  type?: "text" | "email" | "tel";
  children?: ReactNode;
};

export function ContactInput({
  label,
  placeholder,
  type = "text",
  children,
  ...inputProps
}: ContactInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-800">
        {label}
      </span>

      <div className="relative">
        {children ? (
          children
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            {...inputProps}
            className="h-11 w-full border border-gray-200 bg-white px-4 text-xs text-slate-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black"
          />
        )}
      </div>
    </label>
  );
}
