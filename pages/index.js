import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import episodes from "../data/episodes.json";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [vistos, setVistos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem("vistos") || "[]");
    setVistos(storage);
  }, []);

  const toggleVisto = (id, e) => {
    e.stopPropagation(); // no dispares la navegación
    let updated;
    if (vistos.includes(id)) {
      updated = vistos.filter((ep) => ep !== id);
    } else {
      updated = [...vistos, id];
    }
    setVistos(updated);
    localStorage.setItem("vistos", JSON.stringify(updated));
  };

  const handleCardClick = (id) => {
    // al abrir un episodio se marca como visto automáticamente
    if (!vistos.includes(id)) {
      const updated = [...vistos, id];
      setVistos(updated);
      localStorage.setItem("vistos", JSON.stringify(updated));
    }
    router.push(`/ver/${id}`);
  };

  const borrarProgreso = () => {
    localStorage.removeItem("vistos");
    setVistos([]);
  };

  const progreso = Math.round((vistos.length / episodes.length) * 100);
  const bannerImg = "/header.jpg";

  return (
    <div className={styles.container}>
      {/* --- HERO HEADER --- */}
      <header
        className={styles.hero}
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        <div className={styles.overlay}>
          <h1 className={styles.title}>Digimon Adventure</h1>

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

      {/* --- GRID DE EPISODIOS --- */}
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
                src={
                  ep.thumbnail || `/mini${String(ep.id).padStart(2, "0")}.webp`
                }
                alt={ep.title}
                className={styles.thumbnail}
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
