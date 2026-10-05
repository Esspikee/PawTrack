import { Link } from "react-router-dom";
import Icon from "./Icon";
export default function BrandHeader() {
  return <header className="brand-header"><Link className="brand-wordmark" to="/dashboard">Paw<span>Track</span><Icon name="paw" size={25} /></Link>
    <Link className="icon-button" to="/notifications" aria-label="Actividad de la comunidad"><Icon name="bell" /></Link></header>;
}
