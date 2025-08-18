import DevBadge from "./DevBadge";
import styles from "../../styles/SiteFooter.module.css";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.copy}>
            © {year} Digimon Web (fan project)
          </span>
        </div>

        {/* Badge en el footer (no fijo, versión normal) */}
        <div className={styles.right}>
          <DevBadge compact={false} fixedTopRight={false} />
        </div>
      </div>
    </footer>
  );
}
