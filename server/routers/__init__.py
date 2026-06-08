from fastapi import APIRouter

from .products import router as products_router
from .requests import router as requests_router
from .user import router as user_router

router = APIRouter()
router.include_router(user_router, prefix='/user', tags=['user'])
router.include_router(products_router, tags=['products'])
router.include_router(requests_router, tags=['requests'])
