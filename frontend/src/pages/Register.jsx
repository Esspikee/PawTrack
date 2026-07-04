import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

const initialForm = { username: "", email: "", password: "", confirmPassword: "" };

function Register() {
  const [form, setForm] = useState(initialForm);
  const [visiblePasswords, setVisiblePasswords] = useState({ password: false, confirmPassword: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { register } = usePawTrack();
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const togglePassword = (field) => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login", {
        replace: true,
        state: { message: "Cuenta creada. Ya puedes iniciar sesion." },
      });
    } catch (registerError) {
      if (registerError.status === 409) setError(registerError.message || "El correo o usuario ya existe.");
      else if (registerError.status === 422) setError("Escribe un correo valido y revisa los datos.");
      else setError(registerError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <TopBar backTo="/" title="Crear cuenta" />
      <section className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="form-message error" role="alert">{error}</p>}

          <label>
            Usuario
            <span className="input-wrap">
              <input autoComplete="username" name="username" onChange={updateField} placeholder="Tu nombre de usuario" required type="text" value={form.username} />
              <Icon name="user" size={20} />
            </span>
          </label>

          <label>
            Correo electronico
            <span className="input-wrap">
              <input autoComplete="email" name="email" onChange={updateField} placeholder="ejemplo@correo.com" required type="email" value={form.email} />
              <Icon name="mail" size={20} />
            </span>
          </label>

          <label>
            Contrasena
            <span className="input-wrap">
              <input autoComplete="new-password" name="password" onChange={updateField} placeholder="********" required type={visiblePasswords.password ? "text" : "password"} value={form.password} />
              <button
                aria-label={visiblePasswords.password ? "Ocultar contrasena" : "Mostrar contrasena"}
                className="password-toggle"
                onClick={() => togglePassword("password")}
                type="button"
              >
                <Icon name="eye" size={20} />
              </button>
            </span>
          </label>

          <label>
            Confirmar contrasena
            <span className="input-wrap">
              <input autoComplete="new-password" name="confirmPassword" onChange={updateField} placeholder="********" required type={visiblePasswords.confirmPassword ? "text" : "password"} value={form.confirmPassword} />
              <button
                aria-label={visiblePasswords.confirmPassword ? "Ocultar confirmacion de contrasena" : "Mostrar confirmacion de contrasena"}
                className="password-toggle"
                onClick={() => togglePassword("confirmPassword")}
                type="button"
              >
                <Icon name="eye" size={20} />
              </button>
            </span>
          </label>

          <PixelButton className="full-width" disabled={submitting} type="submit">
            {submitting ? "Creando..." : "Crear cuenta"}
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
