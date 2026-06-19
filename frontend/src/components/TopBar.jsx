import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function TopBar({ action = "menu", backTo, title }) {
  const navigate = useNavigate();

  const goBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    navigate(-1);
  };

  return (
    <header className="top-bar">
      <button aria-label="Volver" className="icon-button" onClick={goBack}>
        <Icon name="arrowLeft" />
      </button>
      <h1>{title}</h1>
      <button aria-label={action === "search" ? "Buscar" : "Menu"} className="icon-button" type="button">
        <Icon name={action === "search" ? "search" : "menu"} />
      </button>
    </header>
  );
}

export default TopBar;
