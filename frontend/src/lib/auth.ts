import jwtDecode from "jwt-decode";

export function getClientRole() {
  try {
    // Try cookie first
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp('(^| )authToken=([^;]+)'));
    const token = match ? decodeURIComponent(match[2]) : (localStorage.getItem("authToken") || null);
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded?.role || null;
  } catch {
    return null;
  }
}
