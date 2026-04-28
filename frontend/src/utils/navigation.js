const utilityItems = [
  { path: "/njoftime", label: "Njoftime", icon: "bell" },
  { path: "/raporte", label: "Analitika", icon: "chart" },
  { path: "/llogaria", label: "Llogaria", icon: "settings" },
  { path: "/ndihme", label: "Ndihme", icon: "help" },
];

const roleConnectionMap = {
  admin: [
    { to: "/", label: "Overview", icon: "grid" },
    { to: "/raporte", label: "Analitika", icon: "chart" },
    { to: "/studentet", label: "Studentet", icon: "users" },
    { to: "/lendet", label: "Lendet", icon: "book" },
    { to: "/sherbimet", label: "Sherbimet", icon: "file" },
  ],
  profesor: [
    { to: "/profesor/lendet", label: "Lendet", icon: "book" },
    { to: "/profesor/provimet", label: "Provimet", icon: "calendar" },
    { to: "/profesor/notat", label: "Notat", icon: "graduation" },
    { to: "/profesor/orari", label: "Orari", icon: "clock" },
  ],
  student: [
    { to: "/student/profili", label: "Profili", icon: "user" },
    { to: "/student/regjistrimet", label: "Regjistrimet", icon: "book" },
    { to: "/student/notat", label: "Notat", icon: "graduation" },
    { href: "/student/profili#documents", label: "Dokumentet", icon: "file" },
  ],
};

const navigationByRole = {
  admin: [
    {
      id: "admin-core",
      label: "Kryesore",
      description: "Modulet qe hapen me shpesh gjate dites.",
      icon: "grid",
      items: [
        { path: "/", label: "Dashboard" },
        { path: "/studentet", label: "Studentet" },
        { path: "/regjistrimet", label: "Regjistrimet" },
        { path: "/sherbimet", label: "Sherbimet" },
        { path: "/provimet", label: "Provimet" },
      ],
    },
    {
      id: "admin-teaching",
      label: "Mesimdhenie",
      description: "Lendet, vleresimi dhe planifikimi akademik.",
      icon: "book",
      items: [
        { path: "/profesoret", label: "Profesoret" },
        { path: "/lendet", label: "Lendet" },
        { path: "/notat", label: "Notat" },
        { path: "/oraret", label: "Oraret" },
      ],
    },
    {
      id: "admin-structure",
      label: "Struktura Akademike",
      description: "Baza institucionale dhe organizimi i fakulteteve.",
      icon: "building",
      items: [
        { path: "/gjeneratat", label: "Gjeneratat" },
        { path: "/drejtimet", label: "Drejtimet" },
        { path: "/fakultetet", label: "Fakultetet" },
        { path: "/departamentet", label: "Departamentet" },
      ],
    },
    {
      id: "admin-programs",
      label: "Programe Studentore",
      description: "Mbeshtetje, aplikime dhe mundesi shtese.",
      icon: "spark",
      items: [
        { path: "/rindjekjet", label: "Rindjekje" },
        { path: "/bursat", label: "Bursat" },
        { path: "/praktikat", label: "Internships" },
        { path: "/erasmus", label: "Erasmus" },
      ],
    },
  ],
  profesor: [
    {
      id: "profesor-core",
      label: "Kryesore",
      description: "Pamja ditore dhe veprimet qe kryhen me shpesh.",
      icon: "grid",
      items: [
        { path: "/", label: "Dashboard" },
        { path: "/profesor/lendet", label: "Lendet e Mia" },
        { path: "/profesor/notat", label: "Vendos Nota" },
      ],
    },
    {
      id: "profesor-planning",
      label: "Planifikim",
      description: "Provimet dhe organizimi i orarit personal.",
      icon: "calendar",
      items: [
        { path: "/profesor/provimet", label: "Provimet e Mia" },
        { path: "/profesor/orari", label: "Orari Im" },
      ],
    },
  ],
  student: [
    {
      id: "student-core",
      label: "Kryesore",
      description: "Pamja e shpejte per progresin personal.",
      icon: "grid",
      items: [
        { path: "/", label: "Dashboard" },
        { path: "/student/profili", label: "Profili Im" },
        { path: "/student/notat", label: "Notat e Mia" },
        { path: "/student/orari", label: "Orari Im" },
      ],
    },
    {
      id: "student-studies",
      label: "Studime",
      description: "Regjistrimet dhe provimet e lidhura me semestrin.",
      icon: "book",
      items: [
        { path: "/student/regjistrimet", label: "Regjistrimet" },
        { path: "/student/provimet", label: "Provimet" },
      ],
    },
    {
      id: "student-opportunities",
      label: "Aplikime dhe Mundesi",
      description: "Sherbime studentore, perkrahje dhe programe.",
      icon: "spark",
      items: [
        { path: "/student/sherbimet", label: "Sherbimet" },
        { path: "/student/rindjekjet", label: "Rindjekje" },
        { path: "/student/bursat", label: "Bursat" },
        { path: "/student/praktikat", label: "Internships" },
        { path: "/student/erasmus", label: "Erasmus" },
      ],
    },
  ],
};

const roleDescriptions = {
  admin: "Modulet jane grupuar sipas prioritetit, ndersa njoftimet dhe raportet jane lart.",
  profesor: "Qasja fokusohet te mesimdhenia, planifikimi dhe mjetet e shpejta ne topbar.",
  student: "Fokus te progresi, aplikimet dhe mjetet ndihmese ne krye te faqes.",
};

function getNavigationGroups(role) {
  return navigationByRole[role] || navigationByRole.student;
}

function getUtilityItems() {
  return utilityItems;
}

function getRoleConnections(role) {
  return roleConnectionMap[role] || roleConnectionMap.student;
}

function isPathActive(pathname, path) {
  return pathname === path;
}

function isGroupActive(pathname, group) {
  return group.items.some((item) => isPathActive(pathname, item.path));
}

export {
  getNavigationGroups,
  getRoleConnections,
  getUtilityItems,
  isGroupActive,
  isPathActive,
  roleDescriptions,
};
