import { useTranslation } from "../i18n/useTranslation";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import PixelDivider from "./PixelDivider";

function TopBar({ action = "menu", actionLabel, actionTo = "/dashboard", onAction, title, backTo }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    navigate(-1);
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }
    if (actionTo) {
      navigate(actionTo);
    }
  };

  const label = actionLabel || (action === "search" ? t("Buscar") : t("Menu"));

  return (
    <header className="top-bar">
      <button aria-label={t("Volver")} className="icon-button" onClick={goBack}>
        <Icon name="arrowLeft" />
      </button>
      <h1>{title}</h1>
      <button aria-label={t(label)} className="icon-button" onClick={handleAction} type="button">
        <Icon name={action === "search" ? "search" : "menu"} />
      </button>
      <PixelDivider compact />
    </header>
  );
}

export default TopBar;
