import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import HeartOrnament from "../components/HeartOrnament";
import Icon from "../components/Icon";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";
import { API_BASE_URL, api } from "../services/api";

function Settings() {
  const { currentUser, locale, logout, setLocale } = usePawTrack();
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState("");
  const navigate = useNavigate();

  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    setHealthError("");
    try {
      setHealth(await api.health());
    } catch (error) {
      setHealth(null);
      setHealthError(error.message);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      checkHealth();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [checkHealth]);

  const closeSession = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppShell>
      <TopBar backTo="/profile" title="Configuracion" />

      <section className="history-summary settings-summary">
        <HeartOrnament />
        <Icon name="settings" />
        <span>
          <strong>Centro PawTrack</strong>
          <small>{currentUser ? `Sesion de ${currentUser.username}` : "Sesion comunitaria"}</small>
        </span>
      </section>

      <section className="profile-stats settings-panel">
        <h2>Conexion</h2>
        {loadingHealth ? (
          <StatusPanel message="Revisando API..." />
        ) : healthError ? (
          <StatusPanel action={checkHealth} message={healthError} type="error" />
        ) : (
          <>
            <div className="profile-row settings-status-row">
              <Icon name="star" />
              <span>Estado API</span>
              <strong>OK</strong>
            </div>
            <div className="settings-copy-row">
              <small>Base URL</small>
              <strong>{API_BASE_URL}</strong>
            </div>
            <div className="settings-copy-row">
              <small>Ambiente</small>
              <strong>{health?.environment || "unknown"}</strong>
            </div>
            <div className="settings-copy-row">
              <small>Version backend</small>
              <strong>{health?.version || "unknown"}</strong>
            </div>
          </>
        )}
      </section>

      <section className="profile-stats settings-panel">
        <h2>Cuenta</h2>
        <div className="settings-copy-row">
          <small>Usuario</small>
          <strong>{currentUser?.username || "Sin usuario"}</strong>
        </div>
        <div className="settings-copy-row">
          <small>Correo</small>
          <strong>{currentUser?.email || "No disponible"}</strong>
        </div>
      </section>

      <section className="profile-stats settings-panel">
        <h2>Idioma</h2>
        <div className="settings-copy-row">
          <small>Preferencia</small>
          <strong>{locale === "en" ? "English" : "Español"}</strong>
        </div>
        <p className="settings-note">
          Disponible en iOS y en navegador. La app guarda el idioma elegido en este dispositivo.
        </p>
        <div className="settings-language-grid" role="group" aria-label="Seleccion de idioma">
          {[
            { code: "es", label: "Español" },
            { code: "en", label: "English" },
            { code: "auto", label: "Auto" },
          ].map((option) => (
            <button
              key={option.code}
              className={`language-chip ${locale === option.code ? "is-active" : ""}`}
              onClick={() => setLocale(option.code === "auto" ? window.navigator.language?.slice(0, 2) || "es" : option.code)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="stack-actions">
        <PixelButton className="full-width" onClick={checkHealth} type="button" variant="secondary">
          Revisar conexion
        </PixelButton>
        <button className="menu-card settings-row danger-row" onClick={closeSession} type="button">
          <Icon name="lock" /><span><strong>Cerrar sesion</strong><small>Salir de este dispositivo</small></span><Icon name="chevronRight" />
        </button>
      </div>
    </AppShell>
  );
}

export default Settings;
