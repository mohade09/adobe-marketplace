"""Product catalog service backed by mock data."""

from server.data.mock_products import MOCK_PRODUCTS
from server.models.data_product import (
  ClassificationSummary,
  DataProduct,
  DomainSummary,
  SortOption,
)


class ProductService:
  def __init__(self) -> None:
    self._products = MOCK_PRODUCTS

  def list_products(
    self,
    q: str | None = None,
    domains: list[str] | None = None,
    classifications: list[str] | None = None,
    certified: bool | None = None,
    sort: SortOption = 'most_used',
  ) -> tuple[list[DataProduct], int]:
    results = list(self._products)

    if q:
      query = q.lower()
      results = [
        p
        for p in results
        if query in p.title.lower()
        or query in p.description.lower()
        or query in p.domain.lower()
        or any(query in tag.lower() for tag in p.tags)
      ]

    if domains:
      domain_set = {d.lower() for d in domains}
      results = [p for p in results if p.domain.lower() in domain_set]

    if classifications:
      class_set = {c.lower() for c in classifications}
      results = [p for p in results if p.classification.lower() in class_set]

    if certified is not None:
      results = [p for p in results if p.certified == certified]

    if sort == 'most_used':
      results.sort(key=lambda p: p.usage_count, reverse=True)
    elif sort == 'quality':
      results.sort(key=lambda p: p.quality_score, reverse=True)
    else:
      results.sort(key=lambda p: p.title.lower())

    return results, len(results)

  def get_product(self, product_id: str) -> DataProduct | None:
    return next((p for p in self._products if p.id == product_id), None)

  def list_domains(self) -> list[DomainSummary]:
    counts: dict[str, int] = {}
    for product in self._products:
      counts[product.domain] = counts.get(product.domain, 0) + 1
    return [DomainSummary(name=domain, count=count) for domain, count in sorted(counts.items())]

  def list_classifications(self) -> list[ClassificationSummary]:
    counts: dict[str, int] = {}
    for product in self._products:
      counts[product.classification] = counts.get(product.classification, 0) + 1
    return [
      ClassificationSummary(name=name, count=count) for name, count in sorted(counts.items())
    ]

