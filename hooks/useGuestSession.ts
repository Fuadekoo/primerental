import { useEffect, useState } from "react";

// Helper to generate a simple unique ID
const generateUniqueId = (): string => {
  return "primeRent_" + Math.random().toString(36).substr(2, 9) + Date.now();
};

// Helper to get cookie by name
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

// Helper to set cookie
const setCookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const COOKIE_NAME = "prime_rent_guest_id";

const useGuestSession = (): string => {
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    const userToken = getCookie("token");

    if (userToken) {
      // If user is logged in, delete the guest session cookie and clear the state.
      deleteCookie(COOKIE_NAME);
      setGuestId("");
      return;
    }

    let id = getCookie(COOKIE_NAME);
    if (!id) {
      id = generateUniqueId();
      setCookie(COOKIE_NAME, id);
    }
    setGuestId(id);
  }, []);

  return guestId;
};

export default useGuestSession;
