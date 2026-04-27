function NavigationIcon({ icon, className = "" }) {
  if (icon === "book") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M6.75 5.75A2.75 2.75 0 0 1 9.5 3h7.75v15.25H9.5a2.75 2.75 0 1 0 0 5.5h7.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.75 5.75v15.5M10.5 7.5h4.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "building") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M4.75 20.25h14.5M6.75 20.25V6.75L12 4l5.25 2.75v13.5M9 9.25h.01M12 9.25h.01M15 9.25h.01M9 12.5h.01M12 12.5h.01M15 12.5h.01M11 20.25v-3.5h2v3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "spark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="m12 3 1.65 4.35L18 9l-4.35 1.65L12 15l-1.65-4.35L6 9l4.35-1.65L12 3ZM18.5 14.5l.85 2.15 2.15.85-2.15.85-.85 2.15-.85-2.15-2.15-.85 2.15-.85.85-2.15ZM5.5 14l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1L5.5 14Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M7.75 3.75v3M16.25 3.75v3M4.75 9.25h14.5M6.5 5.75h11a1.75 1.75 0 0 1 1.75 1.75v10a1.75 1.75 0 0 1-1.75 1.75h-11a1.75 1.75 0 0 1-1.75-1.75v-10A1.75 1.75 0 0 1 6.5 5.75Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 13h2.5M13 13h2.5M8.5 16.25H11"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (icon === "shield") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 3.75 6.75 5.5v5.1c0 4.35 2.5 7.45 5.25 8.9 2.75-1.45 5.25-4.55 5.25-8.9V5.5L12 3.75Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m9.75 11.75 1.5 1.5 3-3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "bell") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M8.75 17.25h6.5M9.25 17.25V10.5a2.75 2.75 0 1 1 5.5 0v6.75M7.75 17.25h8l-1-1.75V10.5a3.75 3.75 0 1 0-7.5 0v5L7.75 17.25Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.5 19a1.5 1.5 0 0 0 3 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (icon === "chart") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M5.25 18.75h13.5M7.5 16V10.75M12 16V7.25M16.5 16v-4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "help") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 19.25a7.25 7.25 0 1 0 0-14.5 7.25 7.25 0 0 0 0 14.5ZM9.85 9.95a2.15 2.15 0 1 1 3.5 2.2c-.63.49-1.35.98-1.35 1.85v.25M12 16.8h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4.75 7.25h6.5v6.5h-6.5v-6.5ZM12.75 7.25h6.5v4.5h-6.5v-4.5ZM12.75 13.75h6.5v3.5h-6.5v-3.5ZM4.75 15.75h6.5v3.5h-6.5v-3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default NavigationIcon;
