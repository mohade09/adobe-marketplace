"""Pydantic models for data product catalog."""

from typing import Literal

from pydantic import BaseModel, Field

Domain = Literal['Finance', 'HR', 'Marketing', 'Operations']
ContractStatus = Literal['ok', 'at_risk']
SortOption = Literal['most_used', 'quality', 'name']


class DataProduct(BaseModel):
  id: str
  title: str
  description: str
  domain: Domain
  quality_score: int = Field(ge=0, le=100)
  certified: bool
  classification: str
  contract_status: ContractStatus
  owner_name: str
  owner_initials: str
  usage_count: int
  refresh_cadence: str
  tags: list[str]
  tables: list[str]


class DomainSummary(BaseModel):
  name: Domain
  count: int


class ProductListResponse(BaseModel):
  products: list[DataProduct]
  total: int


class ClassificationSummary(BaseModel):
  name: str
  count: int
