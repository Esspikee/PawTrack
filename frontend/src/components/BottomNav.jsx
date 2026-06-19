import { NavLink } from "react-router-dom";
import Icon from "./Icon";

const items = [
  { to: "/dashboard", label: "Inicio", icon: "home" },
  { to: "/animals", label: "Mapa", icon: "mapPin" },
  { to: "/animals/new", label: "Nuevo", icon: "plus", featured: true },
  { to: "/profile", label: "Logros", icon: "trophy" },
  { to: "/profile", label: "Perfil", icon: "user" },
];

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {items.map((item) => (
        <NavLink
          className={({ isActive }) =>
            `nav-item ${item.featured ? "featured" : ""} ${isActive && !item.featured ? "active" : ""}`
          }
          key={`${item.to}-${item.label}`}
          to={item.to}
        >
          <Icon name={item.icon} size={item.featured ? 26 : 20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
