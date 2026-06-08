"""Access request workflow service with Delta persistence and in-memory fallback."""

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from server.db.session import get_db_session
from server.models.access_request import AccessRequest, AccessRequestCreate, AccessRequestORM
from server.services.product_service import ProductService

logger = logging.getLogger(__name__)

_in_memory_requests: list[AccessRequest] = []


class RequestService:
  def __init__(self) -> None:
    self._product_service = ProductService()

  def create_request(
    self,
    payload: AccessRequestCreate,
    requester_email: str,
    requester_name: str | None,
    obo_token: str | None = None,
  ) -> AccessRequest:
    product = self._product_service.get_product(payload.product_id)
    if product is None:
      raise ValueError(f'Product not found: {payload.product_id}')

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    request = AccessRequest(
      request_id=str(uuid.uuid4()),
      product_id=product.id,
      product_title=product.title,
      domain=product.domain,
      requester_email=requester_email,
      requester_name=requester_name,
      justification=payload.justification,
      use_case=payload.use_case,
      status='pending',
      created_at=now,
      updated_at=now,
    )

    session = get_db_session(obo_token)
    if session is not None:
      try:
        orm = AccessRequestORM(
          request_id=request.request_id,
          product_id=request.product_id,
          product_title=request.product_title,
          domain=request.domain,
          requester_email=request.requester_email,
          requester_name=request.requester_name,
          justification=request.justification,
          use_case=request.use_case,
          status=request.status,
          created_at=request.created_at,
          updated_at=request.updated_at,
        )
        session.add(orm)
        session.commit()
        logger.info('Persisted access request %s to Delta.', request.request_id)
        return request
      except Exception as exc:
        session.rollback()
        logger.warning('Delta insert failed, using in-memory fallback: %s', exc)
      finally:
        session.close()

    _in_memory_requests.append(request)
    return request

  def list_requests_for_user(
    self,
    requester_email: str,
    obo_token: str | None = None,
  ) -> list[AccessRequest]:
    session = get_db_session(obo_token)
    if session is not None:
      try:
        rows = session.scalars(
          select(AccessRequestORM)
          .where(AccessRequestORM.requester_email == requester_email)
          .order_by(AccessRequestORM.created_at.desc())
        ).all()
        return [
          AccessRequest(
            request_id=row.request_id,
            product_id=row.product_id,
            product_title=row.product_title,
            domain=row.domain,
            requester_email=row.requester_email,
            requester_name=row.requester_name,
            justification=row.justification,
            use_case=row.use_case,
            status=row.status,  # type: ignore[arg-type]
            created_at=row.created_at,
            updated_at=row.updated_at,
          )
          for row in rows
        ]
      except Exception as exc:
        logger.warning('Delta read failed, using in-memory fallback: %s', exc)
      finally:
        session.close()

    return sorted(
      [r for r in _in_memory_requests if r.requester_email == requester_email],
      key=lambda r: r.created_at,
      reverse=True,
    )

  def count_pending_for_user(
    self,
    requester_email: str,
    obo_token: str | None = None,
  ) -> int:
    requests = self.list_requests_for_user(requester_email, obo_token)
    return sum(1 for r in requests if r.status == 'pending')
