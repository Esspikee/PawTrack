import { useTranslation } from "../i18n/useTranslation";
import { Link } from "react-router-dom";
import Icon from "./Icon";
export default function BrandHeader() {
  const { t } = useTranslation();
  return <header className="brand-header"><Link className="brand-wordmark" to="/dashboard">Paw<span>Track</span><Icon name="paw" size={25} /></Link>
    <Link className="icon-button" to="/notifications" aria-label={t("Actividad de la comunidad")}><Icon name="bell" /></Link></header>;
}
