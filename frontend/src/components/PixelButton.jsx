import { Link } from "react-router-dom";

function PixelButton({
  children,
  className = "",
  icon,
  to,
  type = "button",
  variant = "primary",
  ...props
}) {
  const classes = `pixel-button ${variant} ${className}`.trim();
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {content}
    </button>
  );
}

export default PixelButton;
