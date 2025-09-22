import SeriesListPage from "@/components/SeriesListPage";
import episodes from "@/data/beyblade.json";

const STORAGE_KEY = "vistos_beyblade";
const LEGACY_KEYS = ["vistos_baybade"];
const PLACEHOLDER_THUMB = "/beyblade-placeholder.svg";

const HERO_CONFIG = {
  title: "Beyblade",
  subtitle: "Marca tu progreso y disfruta de los 51 episodios clásicos.",
  bannerImage: "/beyblade-header.svg",
  switchLink: {
    href: "/digimon",
    label: "← Volver a Digimon Adventure",
  },
};

const getBeybladeThumbnail = (episode) =>
  episode.thumbnail || PLACEHOLDER_THUMB;

const handleThumbnailError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = PLACEHOLDER_THUMB;
};

export default function BeybladePage() {
  return (
    <SeriesListPage
      episodes={episodes}
      storageKey={STORAGE_KEY}
      legacyStorageKeys={LEGACY_KEYS}
      basePath="/beyblade"
      hero={HERO_CONFIG}
      getEpisodeThumbnail={getBeybladeThumbnail}
      onThumbnailError={handleThumbnailError}
    />
  );
}
