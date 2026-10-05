import { useTranslation } from "../../i18n/useTranslation";
import { Link } from "react-router-dom";
import Icon from "../Icon";
import ProgressBar from "./ProgressBar";

function CategoryCard({ description, icon = "book", progress, title, to }) {
  const { t } = useTranslation();
  return (
    <Link className="codex-card category-card" to={to}>
      <Icon name={icon} />
      <span>
        <strong>{t(title)}</strong>
        <small>{description}</small>
        {progress && (
          <>
            <em>{progress.discovered} / {progress.total}</em>
            <ProgressBar percent={progress.percent} />
          </>
        )}
      </span>
      <Icon name="chevronRight" />
    </Link>
  );
}

export default CategoryCard;
