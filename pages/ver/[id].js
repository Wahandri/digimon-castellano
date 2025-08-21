import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import episodes from "../../data/episodes.json";
import styles from "../../styles/Episode.module.css";

/** ===== Utilidades Google Drive ===== **/
function extractDriveId(rawUrl = "") {
  try {
    const m1 = rawUrl.match(/\/file\/d\/([^/]+)\//); // /file/d/ID/...
    if (m1?.[1]) return m1[1];
    const u = new URL(rawUrl); // open?id=ID | uc?export=download&id=ID
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

/** ===== Tiempos de salto (segundos) =====
 * Opening: 00:00 → 01:34  ⇒ usar 01:32 (92s)
 * Resumen: 01:34 → 02:05  ⇒ saltar a 02:05 (125s)
 */
const INTRO_END = 92; // 1:32 (fin de opening)
const SKIP_INTRO_TO = INTRO_END; // usar mismo valor para salto
const SKIP_RECAP_TO = 125; // 2:05
const RECAP_END = 125; // 2:05 (igual que salto)

/** ===== Componente principal ===== */
export default function VerEpisodio() {
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

  // Guardar 'vistos' al abrir
  useEffect(() => {
    if (!episodeId) return;
    const vistos = JSON.parse(localStorage.getItem("vistos") || "[]");
    if (!vistos.includes(episodeId)) {
      localStorage.setItem("vistos", JSON.stringify([...vistos, episodeId]));
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

  // Estado de reproducción / fallbacks
  const [srcIndex, setSrcIndex] = useState(0);
  const [useIframePreview, setUseIframePreview] = useState(false);
  const videoRef = useRef(null);

  // Controles de visibilidad de botones de salto
  const [showSkipIntro, setShowSkipIntro] = useState(true);
  const [showSkipRecap, setShowSkipRecap] = useState(false);

  // Reset al cambiar de episodio
  useEffect(() => {
    setSrcIndex(0);
    setUseIframePreview(false);
    setShowSkipIntro(true);
    setShowSkipRecap(false);
  }, [episodeId]);

  // Autoplay al poder reproducir (HTML5)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || useIframePreview) return;

    const onCanPlay = async () => {
      // Reinicia estado de botones al cargar fuente nueva
      setShowSkipIntro(true);
      setShowSkipRecap(false);

      if (shouldAutoplay) {
        try {
          v.muted = true;
          await v.play();
        } catch {
          /* si el navegador bloquea, el usuario podrá darle a play manualmente */
        }
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

  // Si una fuente falla → probar siguiente; si no quedan → preview (sin saltos)
  const handleVideoError = () => {
    if (srcIndex < candidates.length - 1) {
      setSrcIndex((i) => i + 1);
    } else {
      setUseIframePreview(true);
    }
  };

  const handleEnded = () => {
    if (next) router.push(`/ver/${next.id}?autoplay=1`);
  };

  // Acciones
  const goPrev = () => prev && router.push(`/ver/${prev.id}`);
  const goNext = () => next && router.push(`/ver/${next.id}?autoplay=1`);

  const skipTo = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.currentTime = seconds;
      // pequeña ayuda para reanudar si quedó pausado
      v.play().catch(() => {});
    } catch {}
  };

  if (!episode) {
    return (
      <div className={styles.container}>
        <h1>Episodio no encontrado</h1>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  const currentSrc = candidates[srcIndex];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Inicio
        </Link>
        <h1>{episode.title}</h1>
      </header>

      <div className={styles.videoWrapper}>
        {/* Reproductor principal */}
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

        {/* Botones de salto (solo en modo video HTML5) */}
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

      {/* Navegación entre episodios */}
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
