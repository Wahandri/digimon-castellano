import Link from "next/link";
import styles from "@/styles/Landing.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.panel}>
        <h1 className={styles.title}>Series en castellano</h1>
        <p className={styles.subtitle}>
          Elige la colección que quieres continuar viendo o descubrir.
        </p>
        <div className={styles.actions}>
          <Link href="/digimon" className={styles.buttonPrimary}>
            Digimon Adventure
          </Link>
          <Link href="/beyblade" className={styles.buttonSecondary}>
            Beyblade (castellano)
          </Link>
        </div>
      </main>
    </div>
  );
}
