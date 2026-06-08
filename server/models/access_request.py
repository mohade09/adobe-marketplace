"""Pydantic and SQLAlchemy models for access requests."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field
from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

RequestStatus = Literal['pending', 'approved', 'denied']


class Base(DeclarativeBase):
  pass


class AccessRequestORM(Base):
  __tablename__ = 'access_requests'
  __table_args__ = {'schema': 'marketplace'}

  request_id: Mapped[str] = mapped_column(String, primary_key=True)
  product_id: Mapped[str] = mapped_column(String, nullable=False)
  product_title: Mapped[str] = mapped_column(String, nullable=False)
  domain: Mapped[str] = mapped_column(String, nullable=False)
  requester_email: Mapped[str] = mapped_column(String, nullable=False)
  requester_name: Mapped[str | None] = mapped_column(String, nullable=True)
  justification: Mapped[str] = mapped_column(String, nullable=False)
  use_case: Mapped[str | None] = mapped_column(String, nullable=True)
  status: Mapped[str] = mapped_column(String, nullable=False)
  created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
  updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class AccessRequestCreate(BaseModel):
  product_id: str
  justification: str = Field(min_length=10)
  use_case: str | None = None


class AccessRequest(BaseModel):
  request_id: str
  product_id: str
  product_title: str
  domain: str
  requester_email: str
  requester_name: str | None
  justification: str
  use_case: str | None
  status: RequestStatus
  created_at: datetime
  updated_at: datetime
