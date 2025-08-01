import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import episodes from "../../data/episodes.json";
import styles from "../../styles/Episode.module.css";

export default function VerEpisodio() {
  const router = useRouter();
  const { id } = router.query;
  const episodeId = parseInt(id);
  const episode = episodes.find((e) => e.id === episodeId);
  const prev = episodes.find((e) => e.id === episodeId - 1);
  const next = episodes.find((e) => e.id === episodeId + 1);

  // Marcar como visto automáticamente al abrir
  useEffect(() => {
    if (episodeId) {
      const vistos = JSON.parse(localStorage.getItem("vistos") || "[]");
      if (!vistos.includes(episodeId)) {
        localStorage.setItem("vistos", JSON.stringify([...vistos, episodeId]));
      }
    }
  }, [episodeId]);

  if (!episode) {
    return (
      <div className={styles.container}>
        <h1>Episodio no encontrado</h1>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Inicio
        </Link>
        <h1>{episode.title}</h1>
      </header>

      <div className={styles.videoWrapper}>
        <iframe
          src={episode.url}
          allow="autoplay"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className={styles.nav}>
        {prev && (
          <Link href={`/ver/${prev.id}`} className={styles.navBtn}>
            ⬅ Episodio anterior
          </Link>
        )}
        {next && (
          <Link href={`/ver/${next.id}`} className={styles.navBtn}>
            Siguiente episodio ➡
          </Link>
        )}
      </div>
    </div>
  );
}
