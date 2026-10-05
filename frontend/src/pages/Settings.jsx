import { useTranslation } from "../i18n/useTranslation";
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
  const { t } = useTranslation();
  const { currentUser, locale, languagePreference, logout, setLocale } = usePawTrack();
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
      <TopBar backTo="/profile" title={t("Configuracion")} />

      <section className="history-summary settings-summary">
        <HeartOrnament />
        <Icon name="settings" />
        <span>
          <strong>{t("Centro PawTrack")}</strong>
          <small>{currentUser ? t("Sesion de {0}", {0: currentUser.username}) : t("Sesion comunitaria")}</small>
        </span>
      </section>

      <section className="profile-stats settings-panel">
        <h2>{t("Conexion")}</h2>
        {loadingHealth ? (
          <StatusPanel message={t("Revisando API...")} />
        ) : healthError ? (
          <StatusPanel action={checkHealth} message={t(healthError)} type="error" />
        ) : (
          <>
            <div className="profile-row settings-status-row">
              <Icon name="star" />
              <span>{t("Estado API")}</span>
              <strong>OK</strong>
            </div>
            <div className="settings-copy-row">
              <small>{t("URL base")}</small>
              <strong>{API_BASE_URL}</strong>
            </div>
            <div className="settings-copy-row">
              <small>{t("Ambiente")}</small>
              <strong>{health?.environment || t("No disponible")}</strong>
            </div>
            <div className="settings-copy-row">
              <small>{t("Version del backend")}</small>
              <strong>{health?.version || t("No disponible")}</strong>
            </div>
          </>
        )}
      </section>

      <section className="profile-stats settings-panel">
        <h2>{t("Cuenta")}</h2>
        <div className="settings-copy-row">
          <small>{t("Usuario")}</small>
          <strong>{currentUser?.username || t("Sin usuario")}</strong>
        </div>
        <div className="settings-copy-row">
          <small>{t("Correo")}</small>
          <strong>{currentUser?.email || t("No disponible")}</strong>
        </div>
      </section>

      <section className="profile-stats settings-panel">
        <h2>{t("Idioma")}</h2>
        <div className="settings-copy-row">
          <small>{t("Preferencia")}</small>
          <strong>{locale === "en" ? t("Inglés") : t("Español")}</strong>
        </div>
        <p className="settings-note">{t("Disponible en iOS y en navegador. La app guarda el idioma elegido en este dispositivo.")}</p>
        <div className="settings-language-grid" role="group" aria-label={t("Seleccion de idioma")}>
          {[
            { code: "es", label: t("Español") },
            { code: "en", label: t("Inglés") },
            { code: "auto", label: t("Auto") },
          ].map((option) => (
            <button
              key={option.code}
              className={`language-chip ${languagePreference === option.code ? "is-active" : ""}`}
              aria-pressed={languagePreference === option.code}
              onClick={() => setLocale(option.code)}
              type="button"
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </section>

      <div className="stack-actions">
        <PixelButton className="full-width" onClick={checkHealth} type="button" variant="secondary">{t("Revisar conexion")}</PixelButton>
        <button className="menu-card settings-row danger-row" onClick={closeSession} type="button">
          <Icon name="lock" /><span><strong>{t("Cerrar sesion")}</strong><small>{t("Salir de este dispositivo")}</small></span><Icon name="chevronRight" />
        </button>
      </div>
    </AppShell>
  );
}

export default Settings;
