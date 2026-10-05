import { useTranslation } from "../i18n/useTranslation";
import Icon from "../components/Icon";
import HeartOrnament from "../components/HeartOrnament";
import NightScene from "../components/NightScene";
import PixelButton from "../components/PixelButton";

function Welcome() {
  const { t } = useTranslation();
  return (
    <main className="welcome-screen">
      <section className="brand-panel">
        <div className="logo-badge">
          <Icon name="paw" size={34} />
          <span className="logo-paw">PawTrack</span>
          <Icon name="paw" size={28} />
        </div>

        <NightScene />

        <div className="message-box">
          <HeartOrnament />
          <p>{t("Encuentra mascotas y ayuda a tu comunidad.")}</p>
        </div>

        <div className="auth-actions">
          <PixelButton to="/login">{t("Iniciar sesion")}</PixelButton>
          <PixelButton to="/register" variant="secondary">{t("Registrarse")}</PixelButton>
        </div>
      </section>
    </main>
  );
}

export default Welcome;
