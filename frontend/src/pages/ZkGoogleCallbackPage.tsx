// src/pages/ZkGoogleCallbackPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { completeGoogleZkLogin } from "../lib/zkAuth";

export default function ZkGoogleCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = completeGoogleZkLogin();
      console.log("ZkLogin user:", user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      navigate("/login?error=zklogin");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <p className="text-sm text-slate-300">Signing you in with Google…</p>
    </div>
  );
}
