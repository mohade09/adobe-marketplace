import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppNavbar } from "@/components/marketplace/AppNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProduct, useSubmitRequest } from "@/hooks/useMarketplace";

export function RequestAccessPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product } = useProduct(id);
  const submitRequest = useSubmitRequest();

  const [justification, setJustification] = useState("");
  const [useCase, setUseCase] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!id || justification.trim().length < 10) {
      setError("Please provide a justification of at least 10 characters.");
      return;
    }
    try {
      await submitRequest.mutateAsync({
        product_id: id,
        justification: justification.trim(),
        use_case: useCase.trim() || undefined,
      });
      navigate("/requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link
          to={product ? `/products/${product.id}` : "/"}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to product
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Request Access</CardTitle>
            <p className="text-sm text-gray-600">
              Submit a request to the {product?.domain ?? "domain"} team for{" "}
              <strong>{product?.title ?? "this data product"}</strong>.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="use_case">Use case</Label>
                <Input
                  id="use_case"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="e.g. Quarterly revenue reporting for EMEA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="justification">
                  Business justification <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why you need access and how the data will be used..."
                  rows={5}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-[#EB1000] hover:bg-[#c40d00]"
                  disabled={submitRequest.isPending}
                >
                  {submitRequest.isPending ? "Submitting..." : "Submit Request"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
