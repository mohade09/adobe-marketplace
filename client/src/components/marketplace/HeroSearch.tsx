import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DOMAIN_COLORS } from "@/lib/domains";
import type { Domain } from "@/types";

interface HeroSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  selectedDomains: string[];
  onDomainToggle: (domain: Domain) => void;
}

const DOMAINS: Domain[] = ["Finance", "HR", "Marketing", "Operations"];

export function HeroSearch({
  query,
  onQueryChange,
  selectedDomains,
  onDomainToggle,
}: HeroSearchProps) {
  return (
    <section className="bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
          Adobe Data Mesh — Unity Catalog
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          Find the data you need to do your work
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-slate-300">
          Search certified data products across Finance, HR, Marketing, and
          Operations — review the contract, then request access.
        </p>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search data products, domains, or business terms..."
            className="h-12 rounded-lg border-0 bg-white pl-12 text-base text-gray-900 shadow-lg"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">Browse domains</span>
          {DOMAINS.map((domain) => {
            const colors = DOMAIN_COLORS[domain];
            const active = selectedDomains.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => onDomainToggle(domain)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition ${
                  active
                    ? "border-white bg-white/10 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-sm ${colors.dot}`} />
                {domain}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
