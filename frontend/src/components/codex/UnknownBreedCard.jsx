import { Link } from "react-router-dom";
import Icon from "../Icon";

function UnknownBreedCard({ to }) {
  return (
    <Link className="breed-card unknown" to={to}>
      <div className="breed-silhouette"><Icon name="paw" size={28} /></div>
      <span>
        <strong>Desconocida</strong>
        <small>Raza sin descubrir</small>
      </span>
      <Icon name="chevronRight" />
    </Link>
  );
}

export default UnknownBreedCard;
