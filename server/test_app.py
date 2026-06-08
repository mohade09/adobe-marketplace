"""Simple test FastAPI application without Databricks dependencies."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
  title='Test Databricks App API',
  description='Simple test application',
  version='0.1.0',
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://localhost:5174'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)

@app.get('/health')
async def health():
  """Health check endpoint."""
  return {'status': 'healthy'}

@app.get('/test')
async def test():
  """Simple test endpoint."""
  return {'message': 'Server is running and responding to requests'}

@app.get('/')
async def root():
  """Root endpoint."""
  return {'message': 'Test server is running'} 