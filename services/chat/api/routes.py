import logging
from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from core.auth import get_token, verify_jwt
from services.chat_service import ChatService

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", status_code=status.HTTP_200_OK)
async def health_check():
    return JSONResponse(
        content={"status": "ok", "service": "chat"}, 
        status_code=status.HTTP_200_OK
    )

@router.get("/history/{room}")
async def get_message_history(
    request: Request,
    room: str,
    limit: int = 50,
    offset: int = 0,
):
    """Get paginated message history for a room."""
    token = get_token(request)
    payload = verify_jwt(token or "")
    if not payload:
        return JSONResponse(
            content={"error": "Invalid token"}, 
            status_code=status.HTTP_401_UNAUTHORIZED
        )

    try:
        data = await ChatService.get_history(room, limit, offset)
        return JSONResponse(content=data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching message history: {e}", exc_info=True)
        return JSONResponse(
            content={"error": "Failed to fetch message history"},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
