import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import episodes from "../../data/beyblade.json";
import styles from "../../styles/Home.module.css";

const STORAGE_KEY = "vistos_baybade";
const PLACEHOLDER_THUMB = "/beyblade-placeholder.svg";
const BANNER_IMAGE = "/beyblade-header.svg";

export default function BeybladePage() {
  const [vistos, setVistos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setVistos(storage);
  }, []);

  const toggleVisto = (id, e) => {
    e.stopPropagation();
    let updated;
    if (vistos.includes(id)) {
      updated = vistos.filter((ep) => ep !== id);
    } else {
      updated = [...vistos, id];
    }
    setVistos(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCardClick = (id) => {
    if (!vistos.includes(id)) {
      const updated = [...vistos, id];
      setVistos(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    router.push(`/baybade/ver/${id}`);
  };

  const borrarProgreso = () => {
    localStorage.removeItem(STORAGE_KEY);
    setVistos([]);
  };

  const progreso = Math.round((vistos.length / episodes.length) * 100);

  const handleImgError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = PLACEHOLDER_THUMB;
  };

  return (
    <div className={styles.container}>
      <header
        className={styles.hero}
        style={{ backgroundImage: `url(${BANNER_IMAGE})` }}
      >
        <div className={styles.overlay}>
          <div className={styles.switchRow}>
            <Link href="/" className={styles.switchBtn}>
              ← Volver a Digimon Adventure
            </Link>
          </div>

          <h1 className={styles.title}>Beyblade (Castellano)</h1>

          <p className={styles.subtitle}>
            Marca tu progreso y disfruta de los 51 episodios clásicos.
          </p>

          <div className={styles.progressWrapper}>
            <div
              className={styles.progressBar}
              aria-label="Progreso de visualización"
            >
              <div
                className={styles.progressFill}
                style={{ width: `${progreso}%` }}
              />
            </div>
            <p className={styles.progressText}>
              {vistos.length} / {episodes.length} episodios vistos
            </p>
          </div>

          <button onClick={borrarProgreso} className={styles.resetBtn}>
            Borrar progreso
          </button>
        </div>
      </header>

      <main className={styles.grid}>
        {episodes.map((ep) => (
          <div
            key={ep.id}
            className={styles.card}
            onClick={() => handleCardClick(ep.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handleCardClick(ep.id)
            }
            aria-label={`Reproducir episodio ${ep.id}: ${ep.title}`}
          >
            <div className={styles.thumbWrapper}>
              <img
                src={ep.thumbnail}
                alt={ep.title}
                className={styles.thumbnail}
                onError={handleImgError}
              />

              <div className={styles.hoverOverlay}>
                <span className={styles.playIcon}>▶</span>
              </div>
              {vistos.includes(ep.id) && (
                <span className={styles.watchedMark}>✓</span>
              )}
            </div>

            <h2 className={styles.epTitle}>
              {ep.id}. {ep.title}
            </h2>

            <button
              className={`${styles.vistoBtn} ${
                vistos.includes(ep.id) ? styles.vistoActivo : ""
              }`}
              onClick={(e) => toggleVisto(ep.id, e)}
              aria-pressed={vistos.includes(ep.id)}
              aria-label={
                vistos.includes(ep.id)
                  ? "Marcar como no visto"
                  : "Marcar como visto"
              }
            >
              {vistos.includes(ep.id) ? "Visto" : "Marcar visto"}
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
