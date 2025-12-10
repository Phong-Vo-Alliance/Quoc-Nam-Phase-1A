import React from "react";
import "./App.css";
import PortalWireframes from "./features/portal/PortalWireframes";

export default function App() {
  const [path, setPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const isMobileRoute = path.startsWith("/mobile");

  if (isMobileRoute) {
    // Khung demo mobile: 414x720, bo tròn, có viền máy
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="relative h-[720px] w-[414px] max-w-full rounded-[32px] bg-black shadow-2xl">
          <div className="absolute inset-[10px] overflow-hidden rounded-[24px] bg-gray-50">
            <PortalWireframes portalMode="mobile" />
          </div>
        </div>
      </div>
    );
  }

  // Desktop / route mặc định
  return <PortalWireframes portalMode="desktop" />;
}
