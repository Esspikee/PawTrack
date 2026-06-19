import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";

function Login() {
  return (
    <main className="auth-screen">
      <TopBar backTo="/" title="Iniciar sesion" />
      <section className="auth-card">
        <div className="section-divider">
          <span />
        </div>

        <form className="auth-form">
          <label>
            Correo electronico
            <span className="input-wrap">
              <input placeholder="ejemplo@correo.com" type="email" />
              <Icon name="mail" size={20} />
            </span>
          </label>

          <label>
            Contrasena
            <span className="input-wrap">
              <input placeholder="********" type="password" />
              <Icon name="eye" size={20} />
            </span>
          </label>

          <Link className="tiny-link" to="#">
            Olvidaste tu contrasena?
          </Link>

          <PixelButton className="full-width" to="/dashboard">
            Iniciar sesion
          </PixelButton>
        </form>

        <div className="auth-separator">
          <span />
          <small>o</small>
          <span />
        </div>

        <p className="auth-switch">No tienes cuenta?</p>
        <PixelButton className="full-width" to="/register" variant="secondary">
          Registrate
        </PixelButton>
      </section>
    </main>
  );
}

export default Login;
