import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import { loadProgress, saveProgress } from "@/utils/progressStorage";

function defaultThumbnailResolver(episode) {
  return episode.thumbnail || "";
}

export default function SeriesListPage({
  episodes,
  storageKey,
  legacyStorageKeys = [],
  basePath,
  hero,
  getEpisodeThumbnail = defaultThumbnailResolver,
  onThumbnailError,
}) {
  const router = useRouter();
  const [seenEpisodes, setSeenEpisodes] = useState([]);

  const legacySignature = legacyStorageKeys.join("|");

  useEffect(() => {
    const stored = loadProgress(storageKey, legacyStorageKeys);
    setSeenEpisodes(stored);
  }, [storageKey, legacySignature]);

  const updateProgress = useCallback(
    (next) => {
      setSeenEpisodes(next);
      saveProgress(storageKey, next);
    },
    [storageKey]
  );

  const handleToggleSeen = useCallback(
    (episodeId, event) => {
      event?.stopPropagation();
      const isSeen = seenEpisodes.includes(episodeId);
      const updated = isSeen
        ? seenEpisodes.filter((ep) => ep !== episodeId)
        : [...seenEpisodes, episodeId];
      updateProgress(updated);
    },
    [seenEpisodes, updateProgress]
  );

  const handleCardActivation = useCallback(
    (episodeId) => {
      if (!seenEpisodes.includes(episodeId)) {
        updateProgress([...seenEpisodes, episodeId]);
      }
      router.push(`${basePath}/ver/${episodeId}`);
    },
    [basePath, router, seenEpisodes, updateProgress]
  );

  const progress = useMemo(() => {
    if (!episodes?.length) return 0;
    return Math.round((seenEpisodes.length / episodes.length) * 100);
  }, [episodes, seenEpisodes]);

  return (
    <div className={styles.container}>
      <header
        className={styles.hero}
        style={{ backgroundImage: `url(${hero.bannerImage})` }}
      >
        <div className={styles.overlay}>
          {hero.switchLink ? (
            <div className={styles.switchRow}>
              <Link href={hero.switchLink.href} className={styles.switchBtn}>
                {hero.switchLink.label}
              </Link>
            </div>
          ) : null}

          <h1 className={styles.title}>{hero.title}</h1>

          {hero.subtitle ? (
            <p className={styles.subtitle}>{hero.subtitle}</p>
          ) : null}

          <div className={styles.progressWrapper}>
            <div
              className={styles.progressBar}
              aria-label="Progreso de visualización"
            >
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={styles.progressText}>
              {seenEpisodes.length} / {episodes.length} episodios vistos
            </p>
          </div>

          <button
            onClick={() => updateProgress([])}
            className={styles.resetBtn}
          >
            Borrar progreso
          </button>
        </div>
      </header>

      <main className={styles.grid}>
        {episodes.map((episode) => {
          const thumbnailSrc = getEpisodeThumbnail(episode);
          const seen = seenEpisodes.includes(episode.id);

          const handleKeyDown = (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleCardActivation(episode.id);
            }
          };

          return (
            <div
              key={episode.id}
              className={styles.card}
              onClick={() => handleCardActivation(episode.id)}
              role="button"
              tabIndex={0}
              onKeyDown={handleKeyDown}
              aria-label={`Reproducir episodio ${episode.id}: ${episode.title}`}
            >
              <div className={styles.thumbWrapper}>
                <img
                  src={thumbnailSrc}
                  alt={episode.title}
                  className={styles.thumbnail}
                  onError={onThumbnailError}
                />

                <div className={styles.hoverOverlay}>
                  <span className={styles.playIcon}>▶</span>
                </div>

                {seen ? <span className={styles.watchedMark}>✓</span> : null}
              </div>

              <h2 className={styles.epTitle}>
                {episode.id}. {episode.title}
              </h2>

              <button
                className={`${styles.vistoBtn} ${seen ? styles.vistoActivo : ""}`}
                onClick={(event) => handleToggleSeen(episode.id, event)}
                aria-pressed={seen}
                aria-label={seen ? "Marcar como no visto" : "Marcar como visto"}
              >
                {seen ? "Visto" : "Marcar visto"}
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}
