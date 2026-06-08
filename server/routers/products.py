"""Product catalog API routes."""

from fastapi import APIRouter, HTTPException, Query

from server.models.data_product import ProductListResponse, SortOption
from server.services.product_service import ProductService

router = APIRouter()
service = ProductService()


@router.get('/products', response_model=ProductListResponse)
async def list_products(
  q: str | None = None,
  domain: list[str] | None = Query(default=None),
  classification: list[str] | None = Query(default=None),
  certified: bool | None = None,
  sort: SortOption = 'most_used',
):
  products, total = service.list_products(
    q=q,
    domains=domain,
    classifications=classification,
    certified=certified,
    sort=sort,
  )
  return ProductListResponse(products=products, total=total)


@router.get('/products/{product_id}')
async def get_product(product_id: str):
  product = service.get_product(product_id)
  if product is None:
    raise HTTPException(status_code=404, detail='Product not found')
  return product


@router.get('/domains')
async def list_domains():
  return {
    'domains': service.list_domains(),
    'classifications': service.list_classifications(),
  }
