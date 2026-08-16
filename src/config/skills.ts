/** Accent used for a skill tile's offset shadow. */
export type SkillAccent = "teal" | "orange" | "yellow";

export interface Skill {
  readonly name: string;
  /** Devicon class name, e.g. `devicon-csharp-plain`. */
  readonly icon: string;
}

export const SKILLS: readonly Skill[] = [
  { name: ".NET Core", icon: "devicon-dotnetcore-plain" },
  { name: "C#", icon: "devicon-csharp-plain" },
  { name: "Angular", icon: "devicon-angularjs-plain" },
  { name: "TypeScript", icon: "devicon-typescript-plain" },
  { name: "Node.js", icon: "devicon-nodejs-plain" },
  { name: "Google Cloud", icon: "devicon-googlecloud-plain" },
  { name: "MongoDB", icon: "devicon-mongodb-plain" },
  { name: "SQL Server", icon: "devicon-microsoftsqlserver-plain" },
  { name: "Docker", icon: "devicon-docker-plain" },
  { name: "Git", icon: "devicon-git-plain" },
] as const;

const ACCENT_CYCLE: readonly SkillAccent[] = ["teal", "orange", "yellow"];

/** Deterministic accent rotation so the tile wall stays visually varied. */
export function skillAccent(index: number): SkillAccent {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length] as SkillAccent;
}
