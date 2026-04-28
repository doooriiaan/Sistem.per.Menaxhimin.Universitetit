import NavigationIcon from "../NavigationIcon";

const variantClasses = {
  primary:
    "border-transparent bg-slate-950 text-white shadow-[0_18px_38px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:bg-slate-800",
  secondary:
    "border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50",
  ghost:
    "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900",
  danger:
    "border-red-200 bg-red-50 text-red-700 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-100",
};

const sizeClasses = {
  sm: "gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
  md: "gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold",
  lg: "gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold",
  icon: "h-11 w-11 rounded-2xl",
};

function Button({
  children,
  className = "",
  disabled = false,
  icon,
  iconPosition = "left",
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  const iconNode = icon ? (
    <NavigationIcon
      icon={icon}
      className={size === "icon" ? "h-5 w-5" : "h-4.5 w-4.5"}
    />
  ) : null;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center border transition-all duration-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {children}
        </span>
      ) : (
        size === "icon" ? (
          iconNode
        ) : (
          <>
            {iconPosition === "left" ? iconNode : null}
            <span>{children}</span>
            {iconPosition === "right" ? iconNode : null}
          </>
        )
      )}
    </button>
  );
}

export default Button;
