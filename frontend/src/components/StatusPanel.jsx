import { useTranslation } from "../i18n/useTranslation";
import Icon from "./Icon";

function StatusPanel({ action, actionLabel = "Reintentar", message, type = "loading" }) {
  const { t } = useTranslation();
  return (
    <section className={`status-panel ${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon name={type === "error" ? "bell" : "star"} size={22} />
      <p>{t(message)}</p>
      {action && (
        <button className="mini-pixel-button" onClick={action} type="button">
          {t(actionLabel)}
        </button>
      )}
    </section>
  );
}

export default StatusPanel;
