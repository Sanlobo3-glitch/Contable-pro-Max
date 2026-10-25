import { useEffect, useState } from "react";

const KEY = "contable-pro-device";
const EVENT = "contable-device";

export function setDeviceMode(on: boolean) {
  if (on) localStorage.setItem(KEY, "1");
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useDeviceMode() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const read = () => setOn(localStorage.getItem(KEY) === "1");
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return on;
}
