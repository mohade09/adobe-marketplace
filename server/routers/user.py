"""User router for Databricks user information."""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from server.services.user_service import UserService

router = APIRouter()


class UserInfo(BaseModel):
  userName: str
  displayName: str | None = None
  active: bool
  emails: list[str] = []
  initials: str = 'U'


@router.get('/me', response_model=UserInfo)
async def get_current_user(request: Request):
  try:
    obo_token = request.headers.get('x-forwarded-access-token')
    user_info = UserService(obo_token=obo_token).get_user_info()
    return UserInfo(
      userName=user_info['userName'],
      displayName=user_info['displayName'],
      active=user_info['active'],
      emails=user_info['emails'],
      initials=user_info.get('initials', 'U'),
    )
  except Exception as exc:
    raise HTTPException(status_code=500, detail=f'Failed to fetch user info: {str(exc)}') from exc
