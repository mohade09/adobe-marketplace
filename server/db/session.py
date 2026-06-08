"""Database session management for UC Delta via SQL Warehouse."""

import logging
import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

logger = logging.getLogger(__name__)

_engine: Engine | None = None
_SessionLocal: sessionmaker[Session] | None = None


def _build_connection_url(token: str | None = None) -> str | None:
  host = os.environ.get('DATABRICKS_HOST')
  warehouse_id = os.environ.get('DATABRICKS_WAREHOUSE_ID')
  access_token = token or os.environ.get('DATABRICKS_TOKEN')

  if not host or not warehouse_id or not access_token:
    return None

  host = host.replace('https://', '').replace('http://', '')
  http_path = f'/sql/1.0/warehouses/{warehouse_id}'
  return (
    f'databricks://token:{quote_plus(access_token)}@{host}'
    f'?http_path={quote_plus(http_path)}&catalog=governance&schema=marketplace'
  )


def is_delta_available(token: str | None = None) -> bool:
  return _build_connection_url(token) is not None


def get_engine(token: str | None = None) -> Engine | None:
  global _engine, _SessionLocal

  url = _build_connection_url(token)
  if not url:
    return None

  if _engine is None:
    try:
      _engine = create_engine(url, pool_pre_ping=True)
      _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
      with _engine.connect() as conn:
        conn.execute(text('SELECT 1'))
      logger.info('Connected to Databricks SQL warehouse for request persistence.')
    except Exception as exc:
      logger.warning('Delta persistence unavailable, using in-memory fallback: %s', exc)
      _engine = None
      _SessionLocal = None
      return None

  return _engine


def get_db_session(token: str | None = None) -> Session | None:
  engine = get_engine(token)
  if engine is None or _SessionLocal is None:
    return None
  return _SessionLocal()


def reset_engine() -> None:
  global _engine, _SessionLocal
  if _engine is not None:
    _engine.dispose()
  _engine = None
  _SessionLocal = None
