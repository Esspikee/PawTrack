import { useTranslation } from "../i18n/useTranslation";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function LoginForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = usePawTrack();
  const location = useLocation();
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.status === 401 ? t("Correo o contrasena incorrectos.") : loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <TopBar backTo="/" title={t("Iniciar sesion")} />
      <section className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          {location.state?.message && <p className="form-message success">{location.state.message}</p>}
          {error && <p className="form-message error" role="alert">{t(error)}</p>}

          <label>{t("Correo electronico")}<span className="input-wrap">
              <input
                autoComplete="email"
                name="email"
                onChange={updateField}
                placeholder={t("ejemplo@correo.com")}
                required
                type="email"
                value={form.email}
              />
              <Icon name="mail" size={20} />
            </span>
          </label>

          <label>{t("Contrasena")}<span className="input-wrap">
              <input
                autoComplete="current-password"
                name="password"
                onChange={updateField}
                placeholder="********"
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
              />
              <button
                aria-label={showPassword ? t("Ocultar contrasena") : t("Mostrar contrasena")}
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                <Icon name="eye" size={20} />
              </button>
            </span>
          </label>

          <PixelButton className="full-width" disabled={submitting} type="submit">
            {submitting ? t("Conectando...") : t("Iniciar sesion")}
          </PixelButton>
        </form>

        <div className="auth-separator">
          <span />
          <small>{t("o")}</small>
          <span />
        </div>

        <p className="auth-switch">{t("No tienes cuenta?")}</p>
        <PixelButton className="full-width" to="/register" variant="secondary">{t("Registrate")}</PixelButton>
      </section>
    </main>
  );
}

export default LoginForm;
