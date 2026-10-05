import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function CaptureHeader({ isNew, photoReady, locationReady }) {
  return <>
    <nav className="capture-mode" aria-label="Tipo de avistamiento"><Link aria-current={!isNew ? "page" : undefined} to="/report"><Icon name="paw" size={18} />Animal conocido</Link><Link aria-current={isNew ? "page" : undefined} to="/animals/new"><Icon name="plus" size={18} />Nuevo animal</Link></nav>
    <ol className="capture-steps" aria-label="Pasos del avistamiento"><li className={photoReady ? "complete" : ""}><b>{photoReady ? "✓" : "1"}</b>Foto{!isNew && <small> opcional</small>}</li><li className={locationReady ? "complete" : ""}><b>{locationReady ? "✓" : "2"}</b>Ubicación</li><li><b>3</b>Detalles</li></ol>
  </>;
}
