import { SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ClassificationSummary, DomainSummary } from "@/types";

interface FilterSidebarProps {
  domains: DomainSummary[];
  classifications: ClassificationSummary[];
  selectedDomains: string[];
  selectedClassifications: string[];
  certifiedOnly: boolean;
  onDomainChange: (domain: string, checked: boolean) => void;
  onClassificationChange: (classification: string, checked: boolean) => void;
  onCertifiedChange: (checked: boolean) => void;
}

export function FilterSidebar({
  domains,
  classifications,
  selectedDomains,
  selectedClassifications,
  certifiedOnly,
  onDomainChange,
  onClassificationChange,
  onCertifiedChange,
}: FilterSidebarProps) {
  return (
    <aside className="w-56 shrink-0">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Domain
        </h3>
        <div className="space-y-2">
          {domains.map((domain) => (
            <label
              key={domain.name}
              className="flex cursor-pointer items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDomains.includes(domain.name)}
                  onCheckedChange={(checked) =>
                    onDomainChange(domain.name, checked === true)
                  }
                />
                {domain.name}
              </span>
              <span className="text-gray-400">{domain.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Classification
        </h3>
        <div className="space-y-2">
          {classifications.map((item) => (
            <label
              key={item.name}
              className="flex cursor-pointer items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <Checkbox
                  checked={selectedClassifications.includes(item.name)}
                  onCheckedChange={(checked) =>
                    onClassificationChange(item.name, checked === true)
                  }
                />
                {item.name}
              </span>
              <span className="text-gray-400">{item.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Certification
        </h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={certifiedOnly}
            onCheckedChange={(checked) => onCertifiedChange(checked === true)}
          />
          Certified only
        </label>
      </div>
    </aside>
  );
}
