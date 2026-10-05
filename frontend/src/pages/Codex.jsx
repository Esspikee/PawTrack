import { useTranslation } from "../i18n/useTranslation";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import BreedSprite from "../components/codex/BreedSprite";
import AchievementBadge from "../components/codex/AchievementBadge";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { useCodexData } from "../hooks/useCodexData";
import { usePawTrack } from "../context/usePawTrack";
import { normalizeCodexText } from "../utils/codex";

function Meter({ percent, label }) {
  const { t } = useTranslation();
  return <div className="progress collection-meter" role="progressbar" aria-label={t(label)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}><span style={{ width: `${percent}%` }} /></div>;
}

function BreedRows({ entries, title }) {
  const { t } = useTranslation();
  if (!entries.length) return null;
  return <section className="collection-group"><h2>{t(title)}<small>{entries.length}</small></h2><div className="collection-rows">
    {entries.map(entry => <Link key={entry.id} className={`collection-row ${entry.discovered ? "discovered" : "undiscovered"}`} to={`/codex/bestiary/${entry.animalType === "dog" ? "dogs" : "cats"}/${entry.id}`}>
      <div className="collection-sprite" aria-hidden="true"><BreedSprite breed={entry.breed} locked={!entry.discovered} /></div>
      <span className="collection-row-copy"><strong>{t(entry.breed.displayName)}</strong><small><Icon name={entry.discovered ? "check" : "lock"} size={13} />{entry.animalType === "dog" ? t("Perro") : t("Gato")} · {entry.discovered ? t("Descubierto") : t("Sin descubrir")}</small>{entry.discovered && <small>{entry.totalSightings} {entry.totalSightings === 1 ? t("avistamiento") : t("avistamientos")}</small>}</span><Icon name="chevronRight" size={18} />
    </Link>)}
  </div></section>;
}

function AchievementRow({ achievement, featured = false }) {
  const { t } = useTranslation();
  const hidden = achievement.hidden && !achievement.completed;
  return <article className={`collection-row achievement-entry ${featured ? "featured-achievement" : ""}`}>
    <div className="collection-badge" aria-hidden="true"><AchievementBadge achievement={achievement} /></div>
    <div className="collection-row-copy"><strong>{hidden ? t("Logro oculto") : t(achievement.label)}</strong><small>{hidden ? t("Sigue explorando para descubrirlo.") : t(achievement.detail)}</small>
      {!hidden && !achievement.completed && <div className="collection-goal"><Meter percent={achievement.progress} label={t("Progreso: {0}", {0: t(achievement.label)})} /><small>{achievement.current} / {achievement.goal}</small></div>}
      {!hidden && <small className="collection-reward">{t(achievement.rarityLabel)} · +{achievement.pawPrintReward}{" "}{t("Patitas")}</small>}
    </div>{achievement.completed && <span className="collection-completed" aria-label={t("Completado")}><Icon name="check" size={20} /></span>}
  </article>;
}

function AchievementCollection() {
  const { t } = useTranslation();
  const { achievements, achievementPoints, loadAchievements } = usePawTrack();
  const [request, setRequest] = useState({ loading: true, error: "" });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    loadAchievements().then(() => { if (active) setRequest({ loading: false, error: "" }); })
      .catch(error => { if (active) setRequest({ loading: false, error: error.message }); });
    return () => { active = false; };
  }, [loadAchievements, retry]);
  const completed = achievements.filter(item => item.completed);
  const pending = achievements.filter(item => !item.completed);
  const next = pending.filter(item => !item.hidden).sort((a, b) => b.progress - a.progress)[0];
  const remaining = pending.filter(item => item !== next);
  if (request.loading && !achievements.length) return <StatusPanel message={t("Cargando logros...")} />;
  if (request.error) return <StatusPanel type="error" message={request.error} action={() => { setRequest({ loading: true, error: "" }); setRetry(value => value + 1); }} />;
  return <div className="collection-content">
    <div className="collection-achievement-totals"><span><Icon name="trophy" size={21} />{completed.length}{" "}{t("desbloqueados")}</span><span><Icon name="paw" size={21} />{achievementPoints}{" "}{t("Patitas")}</span></div>
    {!achievements.length && <p className="collection-empty">{t("Aún no hay logros disponibles.")}</p>}
    {next && <section className="collection-group"><h2>{t("Tu próximo logro")}</h2><div className="collection-next"><AchievementRow achievement={next} featured /><PixelButton to="/report" className="full-width">{t("Registrar avistamiento")}</PixelButton></div></section>}
    <section className="collection-group"><h2>{t("Desbloqueados")}<small>{completed.length}</small></h2>{completed.length ? <div className="collection-rows">{completed.map(item => <AchievementRow key={item.id} achievement={item} />)}</div> : <p className="collection-empty">{t("Tus logros aparecerán aquí cuando los completes.")}</p>}</section>
    {remaining.length > 0 && <section className="collection-group"><h2>{t("Por desbloquear")}<small>{remaining.length}</small></h2><div className="collection-rows">{remaining.map(item => <AchievementRow key={item.id} achievement={item} />)}</div></section>}
  </div>;
}

export default function Codex() {
  const { t } = useTranslation();
  const { codex, error, loading } = useCodexData();
  const { pathname } = useLocation();
  const { category } = useParams();
  const [params, setParams] = useSearchParams();
  const isAchievements = pathname === "/codex/achievements";
  const requestedSpecies = params.get("species") || (category === "dogs" ? "dog" : category === "cats" ? "cat" : "all");
  const species = ["all", "dog", "cat"].includes(requestedSpecies) ? requestedSpecies : "all";
  const query = params.get("q") || "";
  const update = (key, value) => setParams(current => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); return next; }, { replace: true });
  const entries = codex.all.filter(entry => (species === "all" || entry.animalType === species) && [entry.breed.displayName, t(entry.breed.displayName)].some(name => normalizeCodexText(name).includes(normalizeCodexText(query))));
  const progress = codex.overallProgress;
  const sectionParams = new URLSearchParams(params);
  if (category) sectionParams.set("species", species);
  const sectionQuery = sectionParams.size ? `?${sectionParams}` : "";
  if (category && category !== "dogs" && category !== "cats") return <Navigate to="/codex" replace />;
  return <AppShell><TopBar backTo="/dashboard" title={t("Códice")} />
    <section className="collection-overview" aria-label={t("Progreso de tu colección")}>
      {loading ? <p>{t("Abriendo tu colección...")}</p> : error ? <p className="form-message error" role="alert">{t(error)}</p> : <>
        <div className="collection-total"><div><strong>{t("Tu colección")}</strong><small>{progress.discovered} / {progress.total}{" "}{t("razas")}</small></div><Meter percent={progress.percent} label={t("Razas descubiertas")} /></div>
        <div className="collection-species"><span>{t("Perros")}<strong>{codex.progressByType.dog.discovered}/{codex.progressByType.dog.total}</strong></span><span>{t("Gatos")}<strong>{codex.progressByType.cat.discovered}/{codex.progressByType.cat.total}</strong></span></div>
      </>}
    </section>
    <nav className="collection-tabs" aria-label={t("Secciones del códice")}><Link to={`/codex${sectionQuery}`} aria-current={!isAchievements ? "page" : undefined}>{t("Bestiario")}</Link><Link to={`/codex/achievements${sectionQuery}`} aria-current={isAchievements ? "page" : undefined}>{t("Logros")}</Link></nav>
    {isAchievements ? <AchievementCollection /> : !loading && !error && <div className="collection-content">
      <label className="explore-search"><Icon name="search" size={20} /><input aria-label={t("Buscar raza")} placeholder={t("Buscar raza")} value={query} onChange={event => update("q", event.target.value)} type="search" /></label>
      <div className="explore-filters" aria-label={t("Filtrar razas")}>{[["all", t("Todos")], ["dog", t("Perros")], ["cat", t("Gatos")]].map(([value, label]) => <button key={value} type="button" aria-pressed={species === value} onClick={() => update("species", value)}>{t(label)}</button>)}</div>
      {!entries.length && <p className="collection-empty">{t("No hay razas que coincidan con tu búsqueda.")}</p>}
      <BreedRows entries={entries.filter(entry => entry.discovered)} title={t("Razas descubiertas")} />
      <BreedRows entries={entries.filter(entry => !entry.discovered)} title={t("Por descubrir")} />
    </div>}
  </AppShell>;
}
