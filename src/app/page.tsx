import Image from "next/image";
import styles from "./page.module.scss";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <div className={styles.loginCon}>
        <h1 className={styles.main}>
          Welcome to Social Media Analytics Platform
        </h1>
        <p>Analyze your social media accounts in one place.</p>
        <Link href="/login">
          <button className={`btn-blue ${styles.loginConBtn}`}>Login</button>
        </Link>
      </div>
    </main>
  );
}
