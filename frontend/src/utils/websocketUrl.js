const getWindowWsProtocol = () =>
  window.location.protocol === "https:" ? "wss:" : "ws:";

const toWebSocketProtocol = (protocol) =>
  protocol === "https:" || protocol === "wss:" ? "wss:" : "ws:";

const normalizePath = (pathname, defaultPath, legacyPaths = []) => {
  const trimmed = String(pathname || "").replace(/^\/+|\/+$/g, "");
  const normalized = trimmed ? `/${trimmed}` : "/";

  if (normalized === "/" || legacyPaths.includes(normalized)) {
    return defaultPath;
  }

  return normalized;
};

const parseUrl = (rawUrl) => {
  try {
    return new URL(rawUrl, window.location.origin);
  } catch {
    return null;
  }
};

export const buildWebSocketUrl = ({
  explicitUrl,
  apiUrl,
  defaultPath,
  legacyPaths = [],
  label = "WebSocket",
}) => {
  if (explicitUrl) {
    const explicit = parseUrl(explicitUrl);
    if (explicit) {
      explicit.protocol = toWebSocketProtocol(explicit.protocol);
      explicit.pathname = normalizePath(
        explicit.pathname,
        defaultPath,
        legacyPaths,
      );
      explicit.hash = "";
      return explicit.toString();
    }

    console.warn(`[${label}] Failed to parse explicit websocket URL.`);
  }

  if (apiUrl) {
    if (apiUrl.startsWith("/")) {
      return `${getWindowWsProtocol()}//${window.location.host}${defaultPath}`;
    }

    const parsedApiUrl = parseUrl(apiUrl);
    if (parsedApiUrl) {
      parsedApiUrl.protocol = toWebSocketProtocol(parsedApiUrl.protocol);
      parsedApiUrl.pathname = defaultPath;
      parsedApiUrl.search = "";
      parsedApiUrl.hash = "";
      return parsedApiUrl.toString();
    }

    console.warn(`[${label}] Failed to parse VITE_API_URL.`);
  }

  return `${getWindowWsProtocol()}//${window.location.host}${defaultPath}`;
};
