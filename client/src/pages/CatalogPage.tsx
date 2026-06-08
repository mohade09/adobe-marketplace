import { useMemo, useState } from "react";
import { AppNavbar } from "@/components/marketplace/AppNavbar";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { HeroSearch } from "@/components/marketplace/HeroSearch";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { SortSelect } from "@/components/marketplace/SortSelect";
import { useDomains, useProducts } from "@/hooks/useMarketplace";
import type { Domain, SortOption } from "@/types";

export function CatalogPage() {
  const [query, setQuery] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>([]);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("most_used");

  const filters = useMemo(
    () => ({
      q: query || undefined,
      domain: selectedDomains.length ? selectedDomains : undefined,
      classification: selectedClassifications.length ? selectedClassifications : undefined,
      certified: certifiedOnly ? true : undefined,
      sort,
    }),
    [query, selectedDomains, selectedClassifications, certifiedOnly, sort],
  );

  const { data: domainsData } = useDomains();
  const { data, isLoading } = useProducts(filters);

  const toggleDomain = (domain: Domain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <HeroSearch
        query={query}
        onQueryChange={setQuery}
        selectedDomains={selectedDomains}
        onDomainToggle={toggleDomain}
      />

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <FilterSidebar
          domains={domainsData?.domains ?? []}
          classifications={domainsData?.classifications ?? []}
          selectedDomains={selectedDomains}
          selectedClassifications={selectedClassifications}
          certifiedOnly={certifiedOnly}
          onDomainChange={(domain, checked) =>
            setSelectedDomains((prev) =>
              checked ? [...prev, domain] : prev.filter((d) => d !== domain),
            )
          }
          onClassificationChange={(classification, checked) =>
            setSelectedClassifications((prev) =>
              checked ? [...prev, classification] : prev.filter((c) => c !== classification),
            )
          }
          onCertifiedChange={setCertifiedOnly}
        />

        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {data?.total ?? 0} data products
            </h2>
            <SortSelect value={sort} onChange={setSort} />
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Loading products...</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {data?.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
