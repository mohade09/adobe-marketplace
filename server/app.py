"""FastAPI application for Adobe Internal Data Marketplace."""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from server.db.session import get_engine
from server.routers import router

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)


def load_env_file(filepath: str) -> None:
  if Path(filepath).exists():
    with open(filepath) as f:
      for line in f:
        line = line.strip()
        if line and not line.startswith('#'):
          key, _, value = line.partition('=')
          if key and value:
            os.environ[key] = value


load_env_file('.env')
load_env_file('.env.local')


@asynccontextmanager
async def lifespan(app: FastAPI):
  engine = get_engine()
  if engine is None:
    logger.warning('UC Delta unavailable — access requests will use in-memory storage.')
  yield


app = FastAPI(
  title='Adobe Internal Data Marketplace API',
  description='Federated data product catalog and access request workflow',
  version='0.1.0',
  lifespan=lifespan,
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)

app.include_router(router, prefix='/api', tags=['api'])


@app.get('/health')
async def health():
  return {'status': 'healthy'}


if os.path.exists('client/build'):
  app.mount('/', StaticFiles(directory='client/build', html=True), name='static')


if __name__ == '__main__':
  import uvicorn

  port = int(os.environ.get('DATABRICKS_APP_PORT', 8000))
  uvicorn.run('server.app:app', host='0.0.0.0', port=port, reload=True)
