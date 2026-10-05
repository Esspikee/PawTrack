import { useTranslation } from "../i18n/useTranslation";
import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function CaptureHeader({ isNew, photoReady, locationReady }) {
  const { t } = useTranslation();
  return <>
    <nav className="capture-mode" aria-label={t("Tipo de avistamiento")}><Link aria-current={!isNew ? "page" : undefined} to="/report"><Icon name="paw" size={18} />{t("Animal conocido")}</Link><Link aria-current={isNew ? "page" : undefined} to="/animals/new"><Icon name="plus" size={18} />{t("Nuevo animal")}</Link></nav>
    <ol className="capture-steps" aria-label={t("Pasos del avistamiento")}><li className={photoReady ? "complete" : ""}><b>{photoReady ? "✓" : "1"}</b>{t("Foto")}{!isNew && <small>{" "}{t("opcional")}</small>}</li><li className={locationReady ? "complete" : ""}><b>{locationReady ? "✓" : "2"}</b>{t("Ubicación")}</li><li><b>3</b>{t("Detalles")}</li></ol>
  </>;
}
