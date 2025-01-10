import { useEffect } from "react";
export function useClickOutside(
  component: React.RefObject<HTMLDivElement>,
  handler: (e: any) => void
) {
  const handleClickOutside = (e: any) => {
    if (
      component &&
      component.current &&
      !component.current.contains(e.target)
    ) {
      handler(e);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [component]);
}
