from urllib.parse import urlparse

from django.conf import settings


def _is_absolute_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def build_media_url(raw_url: str, request=None) -> str | None:
    if not raw_url:
        return None

    if raw_url.startswith("//"):
        return f"https:{raw_url}"

    if _is_absolute_url(raw_url):
        return raw_url

    if request:
        return request.build_absolute_uri(raw_url)

    return f"{settings.BACKEND_URL.rstrip('/')}{raw_url}"


def build_file_url(file_field, request=None) -> str | None:
    if not file_field:
        return None

    try:
        raw_url = file_field.url
    except Exception:
        return None

    return build_media_url(raw_url, request=request)
