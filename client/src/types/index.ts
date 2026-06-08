export type Domain = "Finance" | "HR" | "Marketing" | "Operations";
export type ContractStatus = "ok" | "at_risk";
export type RequestStatus = "pending" | "approved" | "denied";
export type SortOption = "most_used" | "quality" | "name";

export interface DataProduct {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  quality_score: number;
  certified: boolean;
  classification: string;
  contract_status: ContractStatus;
  owner_name: string;
  owner_initials: string;
  usage_count: number;
  refresh_cadence: string;
  tags: string[];
  tables: string[];
}

export interface DomainSummary {
  name: Domain;
  count: number;
}

export interface ClassificationSummary {
  name: string;
  count: number;
}

export interface ProductListResponse {
  products: DataProduct[];
  total: number;
}

export interface DomainsResponse {
  domains: DomainSummary[];
  classifications: ClassificationSummary[];
}

export interface AccessRequest {
  request_id: string;
  product_id: string;
  product_title: string;
  domain: string;
  requester_email: string;
  requester_name: string | null;
  justification: string;
  use_case: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  userName: string;
  displayName?: string;
  active: boolean;
  emails: string[];
  initials: string;
}

export interface ProductFilters {
  q?: string;
  domain?: string[];
  classification?: string[];
  certified?: boolean;
  sort?: SortOption;
}
