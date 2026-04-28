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

  if (icon === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 12.25a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5.75 19.25a6.25 6.25 0 0 1 12.5 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M9 11a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 9 11ZM16 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4.75 18.75a4.75 4.75 0 0 1 8.5-2.9M14.25 18.25a3.75 3.75 0 0 1 5-3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "file") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M8 3.75h5.25L18 8.5v9.75A1.75 1.75 0 0 1 16.25 20H8A1.75 1.75 0 0 1 6.25 18.25V5.5A1.75 1.75 0 0 1 8 3.75Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 3.75V8.5H17.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "download") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 4.5v10.25M8.25 11.75 12 15.5l3.75-3.75M5 19.5h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "upload") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 19.5V9.25M8.25 12.25 12 8.5l3.75 3.75M5 19.5h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "edit") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="m4.75 16.75 7.5-7.5 3.5 3.5-7.5 7.5-4 .5.5-4ZM14.25 7.25l1-1a1.77 1.77 0 1 1 2.5 2.5l-1 1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "trash") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M6.75 7.25h10.5M9.25 7.25V5.5a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v1.75M8.25 9.5v7.5M12 9.5v7.5M15.75 9.5v7.5M7.5 19.25h9a1.25 1.25 0 0 0 1.25-1.25V7.25h-11.5V18A1.25 1.25 0 0 0 7.5 19.25Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "eye") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M2.75 12s3-5.25 9.25-5.25S21.25 12 21.25 12s-3 5.25-9.25 5.25S2.75 12 2.75 12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 14.75A2.75 2.75 0 1 0 12 9.25a2.75 2.75 0 0 0 0 5.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "arrow") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M5 12h14M13 6.75 18.25 12 13 17.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "back" || icon === "arrow-left") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M19 12H5M11 6.75 5.75 12 11 17.25"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "graduation") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="m3.5 9.75 8.5-4.25 8.5 4.25-8.5 4.25-8.5-4.25ZM7 11.5v4l5 2.5 5-2.5v-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M4.75 6.25h14.5A1.75 1.75 0 0 1 21 8v8a1.75 1.75 0 0 1-1.75 1.75H4.75A1.75 1.75 0 0 1 3 16V8a1.75 1.75 0 0 1 1.75-1.75Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m4 7 8 6 8-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M7.5 4.75h2.25L11 8.5 9.25 10.25a14.17 14.17 0 0 0 4.5 4.5L15.5 13l3.75 1.25v2.25a1.75 1.75 0 0 1-1.75 1.75A13.75 13.75 0 0 1 5.75 6.5 1.75 1.75 0 0 1 7.5 4.75Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "clock") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 19.25a7.25 7.25 0 1 0 0-14.5 7.25 7.25 0 0 0 0 14.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8.25v4l2.75 1.75"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5ZM18.25 12a6.92 6.92 0 0 0-.08-1l1.83-1.42-1.5-2.6-2.22.56a7.14 7.14 0 0 0-1.73-1l-.31-2.27h-3l-.31 2.27a7.14 7.14 0 0 0-1.73 1l-2.22-.56-1.5 2.6L5.83 11a7.72 7.72 0 0 0 0 2l-1.83 1.42 1.5 2.6 2.22-.56c.52.42 1.1.76 1.73 1l.31 2.27h3l.31-2.27c.63-.24 1.21-.58 1.73-1l2.22.56 1.5-2.6L18.17 13c.05-.33.08-.66.08-1Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "refresh") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M19.25 11a7.25 7.25 0 0 0-12.5-4.9M4.75 13a7.25 7.25 0 0 0 12.5 4.9M6.5 4.75v3h3M17.5 19.25v-3h-3"
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
