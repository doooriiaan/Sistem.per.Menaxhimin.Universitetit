import { useLocation, useNavigate } from "react-router-dom";
import Button from "./ui/Button";

function FloatingBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";
  const canGoBack =
    typeof window !== "undefined" && Number(window.history.state?.idx) > 0;

  if (isHomePage) {
    return null;
  }

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="pointer-events-none fixed top-5 left-5 z-50 :bottom-10 sm:right-5 lg:bottom-8 lg:right-8">
      <Button
        aria-label="Kthehu"
        className="pointer-events-auto border-slate-200 bg-white text-slate-900 shadow-[0_18px_42px_rgba(15,23,42,0.16)] hover:border-white/70 hover:bg-slate-800 hover:text-white"
        icon="back"
        onClick={handleBack}
        size="icon"
        title="Kthehu"
        variant="secondary"
      />
    </div>
  );
}

export default FloatingBackButton;
