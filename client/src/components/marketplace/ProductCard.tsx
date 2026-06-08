import { Link } from "react-router-dom";
import { Check, Clock, Lock, ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DOMAIN_COLORS } from "@/lib/domains";
import type { DataProduct } from "@/types";
import { QualityGauge } from "./QualityGauge";

export function ProductCard({ product }: { product: DataProduct }) {
  const colors = DOMAIN_COLORS[product.domain];

  return (
    <Link to={`/products/${product.id}`}>
      <Card
        className={`h-full border-t-4 transition hover:shadow-md ${colors.border}`}
      >
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-sm ${colors.dot}`} />
              <span className={`text-xs font-medium ${colors.text}`}>
                {product.domain}
              </span>
            </div>
            <QualityGauge score={product.quality_score} />
          </div>

          <h3 className="mb-2 text-base font-semibold text-gray-900">
            {product.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {product.description}
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {product.certified && (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                <Check className="mr-1 h-3 w-3" />
                Certified
              </Badge>
            )}
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
              <Lock className="mr-1 h-3 w-3" />
              {product.classification}
            </Badge>
            {product.contract_status === "ok" ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Contract OK
              </Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                <ShieldAlert className="mr-1 h-3 w-3" />
                Contract at risk
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700">
                {product.owner_initials}
              </div>
              <span>{product.owner_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {product.usage_count}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {product.refresh_cadence}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
