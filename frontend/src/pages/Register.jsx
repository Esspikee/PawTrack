import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";

function Register() {
  return (
    <main className="auth-screen">
      <TopBar backTo="/" title="Crear cuenta" />
      <section className="auth-card">
        <div className="section-divider">
          <span />
        </div>

        <form className="auth-form">
          <label>
            Usuario
            <span className="input-wrap">
              <input placeholder="Tu nombre de usuario" type="text" />
              <Icon name="user" size={20} />
            </span>
          </label>

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

          <label>
            Confirmar contrasena
            <span className="input-wrap">
              <input placeholder="********" type="password" />
              <Icon name="eye" size={20} />
            </span>
          </label>

          <PixelButton className="full-width" to="/dashboard">
            Crear cuenta
          </PixelButton>
        </form>

        <p className="auth-switch">
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
