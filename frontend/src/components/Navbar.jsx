import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import NavigationIcon from "./NavigationIcon";
import { useAuth } from "../hooks/useAuth";
import {
  getNavigationGroups,
  isGroupActive,
  isPathActive,
  roleDescriptions,
} from "../utils/navigation";

function buildOpenSections(groups, pathname, overrides = {}) {
  const nextState = {};

  groups.forEach((group, index) => {
    const overrideValue = overrides[group.id];
    const hasActiveItem = isGroupActive(pathname, group);

    nextState[group.id] =
      hasActiveItem || typeof overrideValue === "boolean"
        ? hasActiveItem || overrideValue
        : index === 0;
  });

  return nextState;
}

function Navbar({ isMobileOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const { user } = useAuth();

  const groups = getNavigationGroups(user?.roli);
  const [sectionOverrides, setSectionOverrides] = useState({});
  const openSections = buildOpenSections(
    groups,
    location.pathname,
    sectionOverrides
  );

  const linkClass = (path) =>
    `group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isPathActive(location.pathname, path)
        ? "border-white/[0.08] bg-white/[0.1] text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
        : "border-white/[0.03] bg-white/[0.02] text-slate-200/85 hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-white"
    }`;

  return (
    <>
      <button
        type="button"
        aria-label="Mbyll navigimin"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm transition lg:hidden ${
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[18.5rem] px-3 py-3 transition-transform duration-300 lg:px-4 lg:py-6 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[30px] border border-slate-800/60 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.93))] shadow-[0_34px_90px_rgba(2,6,23,0.45)]">
          <div className="border-b border-white/[0.06] px-5 pb-5 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="text-center ">
                <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-300/90">
                  UMS SIDEBAR
                </p>
                <h1 className="mt-3 ml-3.5 text-lg font-extrabold leading-tight text-white">
                  Qendra e menaxhimit
                </h1>
               
              </div>

            </div>
          </div>

          <div className="px-5 py-4">
            <div className="rounded-[24px] border border-cyan-400/10 bg-cyan-400/[0.07] p-4 shadow-inner shadow-cyan-950/20">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-100/85">
                  Roli aktiv
                </p>
                <span className="rounded-full border border-white/[0.08] bg-slate-950/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100/85">
                  Aktiv
                </span>
              </div>
              <p className="text-center text-[25px] pb-3 mt-3 text-base font-bold text-white">
                {user?.roli_label || "Perdorues"}
              </p>
              
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-5">
            <nav className="space-y-3">
              {groups.map((group) => {
                const isOpen = openSections[group.id];
                const isActive = isGroupActive(location.pathname, group);

                return (
                  <section
                    key={group.id}
                    className={`overflow-hidden rounded-[26px] border transition-all duration-200 ${
                      isActive
                        ? "border-white/[0.07] bg-white/[0.05] shadow-[0_18px_42px_rgba(15,23,42,0.18)]"
                        : "border-white/[0.03] bg-white/[0.02]"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setSectionOverrides((current) => ({
                          ...current,
                          [group.id]: !openSections[group.id],
                        }))
                      }
                      className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                            isActive
                              ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                              : "border-white/[0.05] bg-white/[0.04] text-slate-300"
                          }`}
                        >
                          <NavigationIcon icon={group.icon} className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">
                            {group.label}
                          </p>
                          
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 pt-1">
                        <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                          {group.items.length}
                        </span>
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          <path
                            d="M5 7.5 10 12.5 15 7.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="px-3 pb-3">
                        <div className="space-y-2 border-t border-white/[0.04] pt-3">
                          {group.items.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={onClose}
                              className={linkClass(item.path)}
                            >
                              <span>{item.label}</span>
                              <span
                                className={`h-2.5 w-2.5 rounded-full transition ${
                                  isPathActive(location.pathname, item.path)
                                    ? "bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.4)]"
                                    : "bg-slate-700 group-hover:bg-slate-500"
                                }`}
                              />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Navbar;
