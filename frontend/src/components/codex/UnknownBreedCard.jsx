import { useTranslation } from "../../i18n/useTranslation";
import { Link } from "react-router-dom";
import Icon from "../Icon";

function UnknownBreedCard({ to }) {
  const { t } = useTranslation();
  return (
    <Link className="breed-card unknown" to={to}>
      <div className="breed-silhouette"><Icon name="paw" size={28} /></div>
      <span>
        <strong>{t("Desconocida")}</strong>
        <small>{t("Raza sin descubrir")}</small>
      </span>
      <Icon name="chevronRight" />
    </Link>
  );
}

export default UnknownBreedCard;
