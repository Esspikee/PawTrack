import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon";
const items = [
  { to: "/dashboard", label: "Inicio", icon: "home" },
  { to: "/animals", label: "Cerca", icon: "mapPin" },
  { to: "/report", label: "Avistar", icon: "plus", featured: true },
  { to: "/codex", label: "Códice", icon: "book" },
  { to: "/profile", label: "Perfil", icon: "user" },
];
export default function BottomNav() {
  const { pathname } = useLocation();
  const capturing = pathname === "/animals/new" || pathname.startsWith("/report");
  return <nav className="bottom-nav" aria-label="Navegacion principal">{items.map(item => {
    const active = item.featured ? capturing : !capturing && (pathname === item.to || pathname.startsWith(item.to + "/"));
    return <Link key={item.to} className={`nav-item ${item.featured ? "featured" : ""} ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} to={item.to}>
      <Icon name={item.icon} size={item.featured ? 26 : 20} /><span>{item.label}</span>
    </Link>;
  })}</nav>;
}
