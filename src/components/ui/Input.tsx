import { cn } from "@/lib/utils";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-medium text-ink", className)} {...props} />;
}

export function FieldError({ children }: { children?: string[] | string | null }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  const messages = Array.isArray(children) ? children : [children];
  return (
    <p className="mt-1.5 text-sm text-danger" role="alert">
      {messages[0]}
    </p>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[10px] border border-line-strong bg-paper px-3.5 text-[15px] text-ink placeholder:text-muted",
        "focus:border-ink focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[10px] border border-line-strong bg-paper px-3.5 py-3 text-[15px] text-ink placeholder:text-muted",
        "focus:border-ink focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-[10px] border border-line-strong bg-paper px-3.5 text-[15px] text-ink",
        "focus:border-ink focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
