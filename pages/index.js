import { useEffect, useState } from "react";
import Link from "next/link";
import episodes from "../data/episodes.json";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [vistos, setVistos] = useState([]);

  // Leer vistos del localStorage al cargar
  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("vistos") || "[]");
    setVistos(guardados);
  }, []);

  // Alternar estado de un capítulo (visto/no visto)
  const toggleVisto = (id) => {
    const actualizados = vistos.includes(id)
      ? vistos.filter((v) => v !== id)
      : [...vistos, id];
    setVistos(actualizados);
    localStorage.setItem("vistos", JSON.stringify(actualizados));
  };

  // Resetear progreso
  const resetVistos = () => {
    localStorage.removeItem("vistos");
    setVistos([]);
  };

  return (
    <div className={styles.container}>
      <img src="/header.jpg" alt="Digimon Header" className={styles.banner} />

      <header className={styles.header}>
        <h1>📺 Digimon Adventure</h1>
      </header>

      <div className={styles.resetContainer}>
        <button className={styles.resetBtn} onClick={resetVistos}>
          🧹 Borrar progreso
        </button>
      </div>

      <div className={styles.grid}>
        {episodes.map((ep) => (
          <div key={ep.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.number}>Ep {ep.id}</span>
              <button
                className={`${styles.checkBtn} ${
                  vistos.includes(ep.id) ? styles.visto : ""
                }`}
                onClick={() => toggleVisto(ep.id)}
                title="Marcar como visto/no visto"
              >
                ✔
              </button>
            </div>

            <Link href={`/ver/${ep.id}`} className={styles.title}>
              {ep.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
