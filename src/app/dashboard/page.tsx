// app/dashboard/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for Instagram info
  const [instaInfo, setInstaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      console.log("Kullanıcı:", session, "-");
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;

  // Handler for Instagram Connect
  const handleInstagramConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics/instagram/info");
      if (!res.ok) throw new Error("Failed to fetch Instagram info");
      const data = await res.json();
      setInstaInfo(data);
    } catch (err) {
      setError(err.message);
      setInstaInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>Welcome {session?.user?.name}</div>
      <button onClick={handleInstagramConnect}>Instagram Connect</button>
      <button /* onClick={...} */>TikTok Connect</button>
      <button /* onClick={...} */>YouTube Connect</button>
      {loading && <p>Loading Instagram info...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {instaInfo && (
        <div>
          <h3>Instagram Info:</h3>
          <pre>{JSON.stringify(instaInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
