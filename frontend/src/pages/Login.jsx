import { useTranslation } from "../i18n/useTranslation";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import heroImage from "../assets/hero.png";

function Login() {
  const { t } = useTranslation();
  return (
    <main className="splash-screen">
      <section className="splash-phone" aria-label={t("Bienvenida a PawTrack")}>
        <span aria-hidden="true" className="splash-spark spark-top-left" />
        <span aria-hidden="true" className="splash-spark spark-top-right" />
        <span aria-hidden="true" className="splash-spark spark-bottom-left" />
        <span aria-hidden="true" className="splash-spark spark-bottom-right" />

        <header className="splash-logo-panel">
          <Icon name="paw" size={22} />
          <span>PawTrack</span>
          <Icon name="paw" size={20} />
        </header>

        <figure className="splash-hero">
          <img
            className="hero-image"
            alt={t("Perro husky y gato negro en una ciudad nocturna")}
            src={heroImage}
          />
        </figure>

        <section className="splash-message-panel">
          <span aria-hidden="true" className="hud-corner corner-top-left" />
          <span aria-hidden="true" className="hud-corner corner-top-right" />
          <span aria-hidden="true" className="hud-corner corner-bottom-left" />
          <span aria-hidden="true" className="hud-corner corner-bottom-right" />
          <p>{t("Encuentra mascotas y")}<br />{t("ayuda a tu comunidad.")}</p>
        </section>

        <nav className="splash-actions" aria-label={t("Acceso")}>
          <PixelButton className="splash-primary" to="/login-form">{t("Iniciar sesion")}</PixelButton>
          <PixelButton className="splash-secondary" to="/register" variant="secondary">{t("Registrarse")}</PixelButton>
        </nav>
      </section>
    </main>
  );
}

export default Login;
