import "@/styles/globals.css"; // si tienes un globals, mantenlo; si no, ignóralo
import DevBadge from "@/components/DevBadge";
import SiteFooter from "@/components/SiteFooter";

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Badge fijo arriba a la derecha en TODAS las páginas */}
      <DevBadge fixedTopRight={true} compact={true} />

      {/* Contenido de la página */}
      <Component {...pageProps} />

      {/* Footer global */}
      <SiteFooter />
    </>
  );
}
