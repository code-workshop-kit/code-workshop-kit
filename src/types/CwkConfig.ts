export type ScriptCommand = string | ((name: string, index: number) => string);

export interface TargetOptions {
  cmd?: ScriptCommand;
  mode?: 'module' | 'iframe';
  autoReload?: boolean;
  fromParticipantFolder?: boolean;
  excludeFromWatch?: string[];
}

export interface WorkshopConfig {
  absoluteDir: string;
  dir?: string;
  title?: string;
  logStartup?: boolean;
  target?: 'frontend' | 'terminal';
  participants: string[];
  admins?: string[];
  adminPassword?: string;
  appKey?: string;
  targetOptions?: TargetOptions;
  templateData?: { [key: string]: unknown };
  argv?: string[];
  _unknown?: string[];
}
