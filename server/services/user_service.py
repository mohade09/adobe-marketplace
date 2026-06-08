"""User service with Databricks OBO support and local dev fallback."""

import logging
import os

from databricks.sdk import WorkspaceClient

logger = logging.getLogger(__name__)

DEV_USER = {
  'userName': 'dev.user@adobe.com',
  'displayName': 'Dev User',
  'active': True,
  'emails': ['dev.user@adobe.com'],
  'initials': 'DU',
}


class UserService:
  def __init__(self, obo_token: str | None = None) -> None:
    self.obo_token = obo_token

  def _get_client(self) -> WorkspaceClient | None:
    if self.obo_token:
      host = os.environ.get('DATABRICKS_HOST')
      if host:
        return WorkspaceClient(host=host, token=self.obo_token)
    try:
      return WorkspaceClient()
    except Exception as exc:
      logger.warning('WorkspaceClient unavailable, using dev user: %s', exc)
      return None

  def get_user_info(self) -> dict:
    client = self._get_client()
    if client is None:
      return DEV_USER

    try:
      user = client.current_user.me()
      display_name = user.display_name or user.user_name or 'unknown'
      emails = [email.value for email in (user.emails or []) if email.value]
      initials = ''.join(part[0].upper() for part in display_name.split()[:2]) or 'U'
      return {
        'userName': user.user_name or 'unknown',
        'displayName': display_name,
        'active': user.active or False,
        'emails': emails,
        'initials': initials,
      }
    except Exception as exc:
      logger.warning('Failed to fetch user info, using dev user: %s', exc)
      return DEV_USER
