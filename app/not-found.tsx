import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 64 }}>🥀</div>
      <h1 style={{ fontFamily: "var(--serif)", marginBottom: 4 }}>Hindi mahanap ang bouquet</h1>
      <p style={{ color: "var(--muted)" }}>Baka putol ang link o mali ang pagkaka-copy.</p>
      <Link className="btn" style={{ display: "inline-block", textDecoration: "none", marginTop: 12, flex: "none" }} href="/">
        Gumawa ng bagong bouquet
      </Link>
    </main>
  );
}
