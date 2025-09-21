import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Episode.module.css";
import { ensureEpisodeMarked } from "@/utils/progressStorage";

const INTRO_END = 92;
const SKIP_INTRO_TO = INTRO_END;
const SKIP_RECAP_TO = 125;
const RECAP_END = 125;

function extractDriveId(rawUrl = "") {
  try {
    const matchByPath = rawUrl.match(/\/file\/d\/([^/]+)\//);
    if (matchByPath?.[1]) return matchByPath[1];

    const parsed = new URL(rawUrl);
    const queryId = parsed.searchParams.get("id");
    if (queryId) return queryId;

    const matchByQuery = rawUrl.match(/[?&]id=([^&]+)/);
    if (matchByQuery?.[1]) return matchByQuery[1];
  } catch {
    // Ignorar errores de URL inválidas.
  }
  return null;
}

function buildDriveCandidates(id) {
  return [
    `https://drive.usercontent.google.com/uc?id=${id}&export=download`,
    `https://drive.google.com/uc?export=download&id=${id}`,
    `https://lh3.googleusercontent.com/uc?export=download&id=${id}`,
  ];
}

function buildDrivePreviewUrl(id) {
  return `https://drive.google.com/file/d/${id}/preview`;
}

export default function EpisodePlayerPage({
  episodes,
  storageKey,
  legacyStorageKeys = [],
  basePath,
  backHref,
  backLabel = "← Volver al listado",
  notFoundLabel = "Episodio no encontrado",
  resumeNotice = "Este reproductor no permite saltar intro ni resumen.",
}) {
  const router = useRouter();
  const { id, autoplay: autoplayQuery } = router.query;
  const episodeId = Number(id);

  const episode = useMemo(
    () => episodes.find((item) => item.id === episodeId),
    [episodes, episodeId]
  );
  const prev = useMemo(
    () => episodes.find((item) => item.id === episodeId - 1),
    [episodes, episodeId]
  );
  const next = useMemo(
    () => episodes.find((item) => item.id === episodeId + 1),
    [episodes, episodeId]
  );

  useEffect(() => {
    if (!episodeId) return;
    ensureEpisodeMarked(storageKey, episodeId, legacyStorageKeys);
  }, [episodeId, storageKey, legacyStorageKeys]);

  const shouldAutoplay = String(autoplayQuery) === "1";
  const driveId = useMemo(
    () => (episode ? extractDriveId(episode.url) : null),
    [episode]
  );
  const candidates = useMemo(
    () => (driveId ? buildDriveCandidates(driveId) : []),
    [driveId]
  );
  const previewSrc = driveId
    ? buildDrivePreviewUrl(driveId)
    : episode?.url || "";

  const [srcIndex, setSrcIndex] = useState(0);
  const [useIframePreview, setUseIframePreview] = useState(false);
  const videoRef = useRef(null);

  const [showSkipIntro, setShowSkipIntro] = useState(true);
  const [showSkipRecap, setShowSkipRecap] = useState(false);

  useEffect(() => {
    setSrcIndex(0);
    setUseIframePreview(false);
    setShowSkipIntro(true);
    setShowSkipRecap(false);
  }, [episodeId]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || useIframePreview) return;

    const handleCanPlay = async () => {
      setShowSkipIntro(true);
      setShowSkipRecap(false);

      if (shouldAutoplay) {
        try {
          videoEl.muted = true;
          await videoEl.play();
        } catch {
          // Si el navegador bloquea la reproducción automática, el usuario podrá iniciar manualmente.
        }
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = videoEl.currentTime || 0;
      if (currentTime >= INTRO_END) setShowSkipIntro(false);
      if (currentTime >= INTRO_END && currentTime < RECAP_END)
        setShowSkipRecap(true);
      else if (currentTime >= RECAP_END) setShowSkipRecap(false);
    };

    videoEl.addEventListener("canplay", handleCanPlay);
    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoEl.removeEventListener("canplay", handleCanPlay);
      videoEl.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [shouldAutoplay, srcIndex, useIframePreview]);

  const handleVideoError = () => {
    if (srcIndex < candidates.length - 1) {
      setSrcIndex((index) => index + 1);
    } else {
      setUseIframePreview(true);
    }
  };

  const handleEnded = () => {
    if (next) {
      router.push(`${basePath}/ver/${next.id}?autoplay=1`);
    }
  };

  const goPrev = () => {
    if (prev) router.push(`${basePath}/ver/${prev.id}`);
  };

  const goNext = () => {
    if (next) router.push(`${basePath}/ver/${next.id}?autoplay=1`);
  };

  const skipTo = (seconds) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    try {
      videoEl.currentTime = seconds;
      videoEl.play().catch(() => {});
    } catch {
      // Ignoramos si el navegador no permite modificar el tiempo.
    }
  };

  const resolvedBackHref = backHref || basePath;

  if (!episode) {
    return (
      <div className={styles.container}>
        <h1>{notFoundLabel}</h1>
        <Link href={resolvedBackHref}>{backLabel}</Link>
      </div>
    );
  }

  const currentSrc = candidates[srcIndex];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={resolvedBackHref} className={styles.back}>
          {backLabel}
        </Link>
        <h1>{episode.title}</h1>
      </header>

      <div className={styles.videoWrapper}>
        {!useIframePreview && currentSrc ? (
          <video
            key={currentSrc}
            ref={videoRef}
            src={currentSrc}
            controls
            autoPlay={shouldAutoplay}
            muted
            playsInline
            onEnded={handleEnded}
            onError={handleVideoError}
            className={styles.videoEl}
          />
        ) : (
          <iframe
            key={previewSrc}
            src={previewSrc}
            allow="autoplay"
            allowFullScreen
            loading="lazy"
            title={episode.title}
            className={styles.iframeEl}
          />
        )}

        {!useIframePreview && currentSrc ? (
          <>
            {showSkipRecap ? (
              <button
                className={`${styles.skipBtn} ${styles.skipTop}`}
                onClick={() => skipTo(SKIP_RECAP_TO)}
                title="Saltar resumen"
              >
                ⏭ Saltar resumen
              </button>
            ) : null}
            {showSkipIntro ? (
              <button
                className={`${styles.skipBtn} ${styles.skipBelow}`}
                onClick={() => skipTo(SKIP_INTRO_TO)}
                title="Saltar intro"
              >
                ⏭ Saltar intro
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      {useIframePreview ? (
        <p className={styles.iframeNotice}>{resumeNotice}</p>
      ) : null}

      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={goPrev} disabled={!prev}>
          ⬅ Anterior
        </button>
        <button className={styles.navBtn} onClick={goNext} disabled={!next}>
          Siguiente ➡
        </button>
      </div>
    </div>
  );
}
