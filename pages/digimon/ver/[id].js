import EpisodePlayerPage from "@/components/EpisodePlayerPage";
import episodes from "@/data/episodes.json";

const STORAGE_KEY = "vistos";

export default function DigimonEpisodePage() {
  return (
    <EpisodePlayerPage
      episodes={episodes}
      storageKey={STORAGE_KEY}
      basePath="/digimon"
      backHref="/digimon"
      backLabel="← Volver a Digimon"
    />
  );
}
