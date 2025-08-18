import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import episodes from "../../data/episodes.json";
import styles from "../../styles/Episode.module.css";

/** ===== Utilidades Google Drive ===== **/
function extractDriveId(rawUrl = "") {
  try {
    // /file/d/ID/...
    const m1 = rawUrl.match(/\/file\/d\/([^/]+)\//);
    if (m1?.[1]) return m1[1];
    // open?id=ID  |  uc?export=download&id=ID
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

  // Marcar como visto al abrir (nombre "vistos" consistente)
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

  const [srcIndex, setSrcIndex] = useState(0);
  const [useIframePreview, setUseIframePreview] = useState(false);
  const videoRef = useRef(null);

  // Reset al cambiar de episodio
  useEffect(() => {
    setSrcIndex(0);
    setUseIframePreview(false);
  }, [episodeId]);

  // Autoplay al cargar (muted por políticas de navegador)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || useIframePreview) return;

    const onCanPlay = async () => {
      if (shouldAutoplay) {
        try {
          v.muted = true;
          await v.play();
        } catch {
          // El usuario podrá pulsar play manualmente si el navegador lo bloquea
        }
      }
    };

    v.addEventListener("canplay", onCanPlay);
    return () => v.removeEventListener("canplay", onCanPlay);
  }, [srcIndex, shouldAutoplay, useIframePreview]);

  // Si falla una fuente, probar la siguiente; si no quedan, usar preview (sin onEnded)
  const handleVideoError = () => {
    if (srcIndex < candidates.length - 1) {
      setSrcIndex((i) => i + 1);
    } else {
      setUseIframePreview(true);
    }
  };

  // Al terminar → ir al siguiente con autoplay
  const handleEnded = () => {
    if (next) router.push(`/ver/${next.id}?autoplay=1`);
  };

  // Botones
  const goPrev = () => prev && router.push(`/ver/${prev.id}`);
  const goNext = () => next && router.push(`/ver/${next.id}?autoplay=1`);

  if (!episode) {
    return (
      <div className={styles.container}>
        <h1>Episodio no encontrado</h1>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  const currentSrc = candidates[srcIndex];
  const previewSrc = driveId ? buildDrivePreviewUrl(driveId) : episode.url;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Inicio
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
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              background: "#000",
            }}
          />
        ) : (
          <iframe
            key={previewSrc}
            src={previewSrc}
            allow="autoplay"
            allowFullScreen
            loading="lazy"
            title={episode.title}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: 12,
              background: "#000",
            }}
          />
        )}
      </div>

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
