
export type Language = 'en' | 'zh';

export interface ModuleOutput {
  aiTutor: string;
  exercise: string;
  simulation: string;
}

export interface UserState {
  name: string;
  dept: string;
  role: string;
  points: number;
  completedModules: number[];
  savedOutputs: Record<string, ModuleOutput>;
  lang: Language;
}

export interface ModuleData {
  id: number;
  key: string;
  icon: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  badge: Record<Language, string>;
  color: string;
  lightColor: string;
}

export interface Translation {
  [key: string]: Record<Language, string>;
}
