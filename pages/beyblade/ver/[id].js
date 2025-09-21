import EpisodePlayerPage from "@/components/EpisodePlayerPage";
import episodes from "@/data/beyblade.json";

const STORAGE_KEY = "vistos_beyblade";
const LEGACY_KEYS = ["vistos_baybade"];

export default function BeybladeEpisodePage() {
  return (
    <EpisodePlayerPage
      episodes={episodes}
      storageKey={STORAGE_KEY}
      legacyStorageKeys={LEGACY_KEYS}
      basePath="/beyblade"
      backHref="/beyblade"
      backLabel="← Volver a Beyblade"
    />
  );
}
