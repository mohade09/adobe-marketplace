import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AppNavbar } from "@/components/marketplace/AppNavbar";
import { QualityGauge } from "@/components/marketplace/QualityGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOMAIN_COLORS } from "@/lib/domains";
import { useProduct } from "@/hooks/useMarketplace";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar />
        <div className="mx-auto max-w-4xl px-6 py-8">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar />
        <div className="mx-auto max-w-4xl px-6 py-8">
          <p className="text-red-600">Product not found.</p>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const colors = DOMAIN_COLORS[product.domain];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>

        <Card className={`border-t-4 ${colors.border}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-sm ${colors.dot}`} />
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {product.domain}
                  </span>
                </div>
                <CardTitle className="text-2xl">{product.title}</CardTitle>
              </div>
              <QualityGauge score={product.quality_score} size={56} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">{product.description}</p>

            <div className="flex flex-wrap gap-2">
              {product.certified && (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <Check className="mr-1 h-3 w-3" />
                  Certified
                </Badge>
              )}
              <Badge className="bg-amber-100 text-amber-800">
                <Lock className="mr-1 h-3 w-3" />
                {product.classification}
              </Badge>
              {product.contract_status === "ok" ? (
                <Badge className="bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Contract OK
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-800">
                  <ShieldAlert className="mr-1 h-3 w-3" />
                  Contract at risk
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 text-sm">
              <div>
                <p className="text-gray-500">Owner</p>
                <p className="font-medium">{product.owner_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Usage</p>
                <p className="inline-flex items-center gap-1 font-medium">
                  <Users className="h-4 w-4" />
                  {product.usage_count} users
                </p>
              </div>
              <div>
                <p className="text-gray-500">Refresh</p>
                <p className="inline-flex items-center gap-1 font-medium">
                  <Clock className="h-4 w-4" />
                  {product.refresh_cadence}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Unity Catalog Tables
              </h3>
              <ul className="space-y-1 rounded-lg border bg-white p-4 text-sm font-mono text-gray-700">
                {product.tables.map((table) => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <Button asChild className="bg-[#EB1000] hover:bg-[#c40d00]">
              <Link to={`/request/${product.id}`}>Request Access</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
