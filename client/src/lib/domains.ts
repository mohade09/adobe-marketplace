import type { Domain } from "@/types";

export const DOMAIN_COLORS: Record<
  Domain,
  { dot: string; border: string; text: string; bg: string }
> = {
  Finance: {
    dot: "bg-blue-500",
    border: "border-t-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
  },
  HR: {
    dot: "bg-emerald-500",
    border: "border-t-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  Marketing: {
    dot: "bg-red-500",
    border: "border-t-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
  },
  Operations: {
    dot: "bg-purple-500",
    border: "border-t-purple-500",
    text: "text-purple-700",
    bg: "bg-purple-50",
  },
};
