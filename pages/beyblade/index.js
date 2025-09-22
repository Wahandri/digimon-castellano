import SeriesListPage from "@/components/SeriesListPage";
import episodes from "@/data/beyblade.json";
import Link from "next/link";

const STORAGE_KEY = "vistos_beyblade";
const LEGACY_KEYS = ["vistos_baybade"];
const PLACEHOLDER_THUMB = "/beyblade-placeholder.svg";

const HERO_CONFIG = {
  title: "Beyblade",
  subtitle: "Marca tu progreso y disfruta de los 51 episodios clásicos.",
  bannerImage: "/beyblade.jpg",
};

const getBeybladeThumbnail = (episode) =>
  episode.thumbnail || PLACEHOLDER_THUMB;

const handleThumbnailError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = PLACEHOLDER_THUMB;
};

export default function BeybladePage() {
  return (
    <>
      <Link href="/" className="back-link">
        ← Volver al inicio
      </Link>
      <SeriesListPage
        episodes={episodes}
        storageKey={STORAGE_KEY}
        legacyStorageKeys={LEGACY_KEYS}
        basePath="/beyblade"
        hero={HERO_CONFIG}
        getEpisodeThumbnail={getBeybladeThumbnail}
        onThumbnailError={handleThumbnailError}
      />
    </>
  );
}
