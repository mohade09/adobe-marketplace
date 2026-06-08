import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AccessRequest,
  DomainsResponse,
  ProductFilters,
  ProductListResponse,
  DataProduct,
  UserInfo,
} from "@/types";

function buildProductQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  filters.domain?.forEach((d) => params.append("domain", d));
  filters.classification?.forEach((c) => params.append("classification", c));
  if (filters.certified !== undefined) params.set("certified", String(filters.certified));
  if (filters.sort) params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useProducts(filters: ProductFilters) {
  return useQuery<ProductListResponse>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const res = await fetch(`/api/products${buildProductQuery(filters)}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery<DataProduct>({
    queryKey: ["product", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
  });
}

export function useDomains() {
  return useQuery<DomainsResponse>({
    queryKey: ["domains"],
    queryFn: async () => {
      const res = await fetch("/api/domains");
      if (!res.ok) throw new Error("Failed to fetch domains");
      return res.json();
    },
  });
}

export function useUser() {
  return useQuery<UserInfo>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });
}

export function useMyRequests() {
  return useQuery<AccessRequest[]>({
    queryKey: ["my-requests"],
    queryFn: async () => {
      const res = await fetch("/api/requests/mine");
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
  });
}

export function usePendingRequestCount() {
  return useQuery<number>({
    queryKey: ["pending-request-count"],
    queryFn: async () => {
      const res = await fetch("/api/requests/mine/count");
      if (!res.ok) return 0;
      const data = await res.json();
      return data.pending ?? 0;
    },
  });
}

export function useSubmitRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      product_id: string;
      justification: string;
      use_case?: string;
    }) => {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to submit request");
      }
      return res.json() as Promise<AccessRequest>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-request-count"] });
    },
  });
}
