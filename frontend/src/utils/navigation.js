const utilityItems = [
  { path: "/njoftime", label: "Njoftime", icon: "bell" },
  { path: "/raporte", label: "Raporte", icon: "chart" },
  { path: "/ndihme", label: "Ndihme", icon: "help" },
];

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
    {
      id: "admin-account",
      label: "Profili",
      description: "Llogaria dhe te dhenat personale.",
      icon: "shield",
      items: [{ path: "/llogaria", label: "Llogaria" }],
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
    {
      id: "profesor-account",
      label: "Profili",
      description: "Llogaria dhe qasja personale.",
      icon: "shield",
      items: [{ path: "/llogaria", label: "Llogaria" }],
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
    {
      id: "student-account",
      label: "Profili",
      description: "Llogaria dhe cilesimet personale.",
      icon: "shield",
      items: [{ path: "/llogaria", label: "Llogaria" }],
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

function isPathActive(pathname, path) {
  return pathname === path;
}

function isGroupActive(pathname, group) {
  return group.items.some((item) => isPathActive(pathname, item.path));
}

export {
  getNavigationGroups,
  getUtilityItems,
  isGroupActive,
  isPathActive,
  roleDescriptions,
};
