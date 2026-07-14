
import Cookies from "js-cookie";

const REDIRECT_KEY = "auth_redirect_target";

export const RedirectHelper = {

  saveTarget(targetUrl?: string) {
    const url = targetUrl || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "");
    if (!url || url.includes("/login") || url.includes("/register") || url.includes("/verify")) {
      return;
    }
    localStorage.setItem(REDIRECT_KEY, url);
    Cookies.set(REDIRECT_KEY, url, { expires: 1, secure: true, sameSite: "lax" });
  },


  getAndClearTarget(): string {
    const localVal = localStorage.getItem(REDIRECT_KEY);
    const cookieVal = Cookies.get(REDIRECT_KEY);
    
    localStorage.removeItem(REDIRECT_KEY);
    Cookies.remove(REDIRECT_KEY);
    
    return localVal || cookieVal || "/";
  },


  redirectToLogin() {
    this.saveTarget();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  redirectToRegister() {
    this.saveTarget();
    if (typeof window !== "undefined") {
      window.location.href = "/register";
    }
  }
};
