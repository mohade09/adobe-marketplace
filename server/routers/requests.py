"""Access request workflow API routes."""

from fastapi import APIRouter, Header, HTTPException, Request

from server.models.access_request import AccessRequest, AccessRequestCreate
from server.services.request_service import RequestService
from server.services.user_service import UserService

router = APIRouter()
service = RequestService()


def _get_identity(request: Request) -> tuple[str, str | None, str | None]:
  obo_token = request.headers.get('x-forwarded-access-token')
  user = UserService(obo_token=obo_token).get_user_info()
  email = user['emails'][0] if user.get('emails') else user['userName']
  return email, user.get('displayName'), obo_token


@router.post('/requests', response_model=AccessRequest, status_code=201)
async def create_request(payload: AccessRequestCreate, request: Request):
  email, display_name, obo_token = _get_identity(request)
  try:
    return service.create_request(
      payload=payload,
      requester_email=email,
      requester_name=display_name,
      obo_token=obo_token,
    )
  except ValueError as exc:
    raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get('/requests/mine', response_model=list[AccessRequest])
async def list_my_requests(request: Request):
  email, _, obo_token = _get_identity(request)
  return service.list_requests_for_user(email, obo_token=obo_token)


@router.get('/requests/mine/count')
async def count_my_pending_requests(request: Request):
  email, _, obo_token = _get_identity(request)
  return {'pending': service.count_pending_for_user(email, obo_token=obo_token)}
