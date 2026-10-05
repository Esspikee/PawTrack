import { useTranslation } from "../i18n/useTranslation";
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
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const capturing = pathname === "/animals/new" || pathname.startsWith("/report");
  return <nav className="bottom-nav" aria-label={t("Navegacion principal")}>{items.map(item => {
    const profilePage = item.to === "/profile" && ["/settings", "/my-sightings"].includes(pathname);
    const active = item.featured ? capturing : !capturing && (profilePage || pathname === item.to || pathname.startsWith(item.to + "/"));
    return <Link key={item.to} className={`nav-item ${item.featured ? "featured" : ""} ${active ? "active" : ""}`} aria-current={active ? "page" : undefined} to={item.to}>
      <span className="nav-icon" aria-hidden="true"><Icon name={item.icon} size={24} /></span><span>{t(item.label)}</span>
    </Link>;
  })}</nav>;
}
