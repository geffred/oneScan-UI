export const platformTypes = [
  { value: "THREESHAPE", label: "3Shape" },
  { value: "MEDITLINK", label: "MeditLink" },
  { value: "ITERO", label: "Itero" },
  { value: "DEXIS", label: "Dexis" },
  { value: "CSCONNECT", label: "CS Connect" },
  { value: "MYSMILELAB", label: "MySmileLab" },
];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const STATUS_TYPES = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  LOADING: "loading",
  ERROR: "error",
};

export const PLATFORM_NAMES = {
  THREESHAPE: "THREESHAPE",
  MEDITLINK: "MEDITLINK",
  ITERO: "ITERO",
  DEXIS: "DEXIS",
  CSCONNECT: "CSCONNECT",
  MYSMILELAB: "MYSMILELAB",
};

export const PLATFORM_DISPLAY_NAMES = {
  [PLATFORM_NAMES.THREESHAPE]: "3Shape",
  [PLATFORM_NAMES.MEDITLINK]: "MeditLink",
  [PLATFORM_NAMES.ITERO]: "Itero",
  [PLATFORM_NAMES.DEXIS]: "Dexis",
  [PLATFORM_NAMES.CSCONNECT]: "CS Connect",
  [PLATFORM_NAMES.MYSMILELAB]: "MySmileLab",
};
