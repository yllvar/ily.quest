import type { Provider } from "./types"

export const PROVIDERS: Record<string, Provider> = {
  auto: {
    id: "auto",
    name: "Auto",
    max_tokens: 100000,
  },
  "fireworks-ai": {
    id: "fireworks-ai",
    name: "Fireworks AI",
    max_tokens: 131000,
  },
  sambanova: {
    id: "sambanova",
    name: "SambaNova",
    max_tokens: 8000,
  },
  nebius: {
    id: "nebius",
    name: "Nebius AI Studio",
    max_tokens: 131000,
  },
  novita: {
    id: "novita",
    name: "NovitaAI",
    max_tokens: 16000,
  },
}

