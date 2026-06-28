import Icon from "./Icon";

function StatusPanel({ action, actionLabel = "Reintentar", message, type = "loading" }) {
  return (
    <section className={`status-panel ${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon name={type === "error" ? "bell" : "star"} size={22} />
      <p>{message}</p>
      {action && (
        <button className="mini-pixel-button" onClick={action} type="button">
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export default StatusPanel;
