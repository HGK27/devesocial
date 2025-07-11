import Link from "next/link";

const Header = () => (
  <header
    style={{
      padding: "1rem",
      background: "#f5f5f5",
      borderBottom: "1px solid #ddd",
    }}
  >
    <nav style={{ display: "flex", gap: "1rem" }}>
      <Link href="/">Home</Link>
      <Link href="/login">Login</Link>
    </nav>
  </header>
);

export default Header;
