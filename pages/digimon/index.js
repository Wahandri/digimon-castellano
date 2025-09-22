import SeriesListPage from "@/components/SeriesListPage";
import episodes from "@/data/episodes.json";
import Link from "next/link";

const HERO_CONFIG = {
  title: "Digimon Adventure",
  subtitle: "Sigue tu progreso y revive la primera temporada completa.",
  bannerImage: "/header.jpg",
};

const STORAGE_KEY = "vistos";

const getDigimonThumbnail = (episode) =>
  episode.thumbnail || `/mini${String(episode.id).padStart(2, "0")}.webp`;

export default function DigimonPage() {
  return (
    <>
      <Link href="/" className="back-link">
        ← Volver al inicio
      </Link>
      <SeriesListPage
        episodes={episodes}
        storageKey={STORAGE_KEY}
        basePath="/digimon"
        hero={HERO_CONFIG}
        getEpisodeThumbnail={getDigimonThumbnail}
      />
    </>
  );
}
