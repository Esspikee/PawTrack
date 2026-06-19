import Icon from "../components/Icon";
import NightScene from "../components/NightScene";
import PixelButton from "../components/PixelButton";

function Welcome() {
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
          <p>Encuentra mascotas y ayuda a tu comunidad.</p>
        </div>

        <div className="auth-actions">
          <PixelButton to="/login">Iniciar sesion</PixelButton>
          <PixelButton to="/register" variant="secondary">
            Registrarse
          </PixelButton>
        </div>
      </section>
    </main>
  );
}

export default Welcome;
