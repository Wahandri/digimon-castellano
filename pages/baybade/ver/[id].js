import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import episodes from "../../../data/beyblade.json";
import styles from "../../../styles/Episode.module.css";

const STORAGE_KEY = "vistos_baybade";

/** ===== Utilidades Google Drive ===== **/
function extractDriveId(rawUrl = "") {
  try {
    const m1 = rawUrl.match(/\/file\/d\/([^/]+)\//);
    if (m1?.[1]) return m1[1];
    const u = new URL(rawUrl);
    const qid = u.searchParams.get("id");
    if (qid) return qid;
    const m2 = rawUrl.match(/[?&]id=([^&]+)/);
    if (m2?.[1]) return m2[1];
  } catch {}
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

const INTRO_END = 92;
const SKIP_INTRO_TO = INTRO_END;
const SKIP_RECAP_TO = 125;
const RECAP_END = 125;

export default function VerBeyblade() {
  const router = useRouter();
  const { id, autoplay: autoplayQuery } = router.query;
  const episodeId = Number(id);

  const episode = useMemo(
    () => episodes.find((e) => e.id === episodeId),
    [episodeId]
  );
  const prev = useMemo(
    () => episodes.find((e) => e.id === episodeId - 1),
    [episodeId]
  );
  const next = useMemo(
    () => episodes.find((e) => e.id === episodeId + 1),
    [episodeId]
  );

  useEffect(() => {
    if (!episodeId) return;
    const vistos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!vistos.includes(episodeId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...vistos, episodeId]));
    }
  }, [episodeId]);

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
    const v = videoRef.current;
    if (!v || useIframePreview) return;

    const onCanPlay = async () => {
      setShowSkipIntro(true);
      setShowSkipRecap(false);

      if (shouldAutoplay) {
        try {
          v.muted = true;
          await v.play();
        } catch {}
      }
    };

    const onTimeUpdate = () => {
      const t = v.currentTime || 0;
      if (t >= INTRO_END) setShowSkipIntro(false);
      if (t >= INTRO_END && t < RECAP_END) setShowSkipRecap(true);
      else if (t >= RECAP_END) setShowSkipRecap(false);
    };

    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [srcIndex, shouldAutoplay, useIframePreview]);

  const handleVideoError = () => {
    if (srcIndex < candidates.length - 1) {
      setSrcIndex((i) => i + 1);
    } else {
      setUseIframePreview(true);
    }
  };

  const handleEnded = () => {
    if (next) router.push(`/baybade/ver/${next.id}?autoplay=1`);
  };

  const goPrev = () => prev && router.push(`/baybade/ver/${prev.id}`);
  const goNext = () => next && router.push(`/baybade/ver/${next.id}?autoplay=1`);

  const skipTo = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = seconds;
      v.play().catch(() => {});
    } catch {}
  };

  if (!episode) {
    return (
      <div className={styles.container}>
        <h1>Episodio no encontrado</h1>
        <Link href="/baybade">Volver al listado</Link>
      </div>
    );
  }

  const currentSrc = candidates[srcIndex];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/baybade" className={styles.back}>
          ← Volver a la lista
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

        {!useIframePreview && currentSrc && (
          <>
            {showSkipRecap && (
              <button
                className={`${styles.skipBtn} ${styles.skipTop}`}
                onClick={() => skipTo(SKIP_RECAP_TO)}
                title="Saltar resumen"
              >
                ⏭ Saltar resumen
              </button>
            )}
            {showSkipIntro && (
              <button
                className={`${styles.skipBtn} ${styles.skipBelow}`}
                onClick={() => skipTo(SKIP_INTRO_TO)}
                title="Saltar intro"
              >
                ⏭ Saltar intro
              </button>
            )}
          </>
        )}
      </div>

      {useIframePreview && (
        <p className={styles.iframeNotice}>
          Este reproductor no permite saltar intro ni resumen.
        </p>
      )}

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
