export interface Task {
  id: number;
  name: string;
  reads: string[];
  builds: string;
  description: string;
  credits: number;
  status: boolean;
}

export interface ProjectConfig {
  projectName: string;
  goal: string;
  stack: string;
  agentTool: string;
  budget: number;
  tasksFile: string;
}

export interface TaskBudget {
  estimate: number;
  actual: number | null;
  status: string;
}

export interface BudgetConfig {
  total: number;
  spent: number;
  remaining: number;
  tasks: Record<string, TaskBudget>;
}

export interface CheckWarning {
  rule: string;
  message: string;
  fix: string;
}

export interface TemplateTask {
  name: string;
  reads: string[];
  builds: string;
  description: string;
  credits: number;
}

export interface Template {
  name: string;
  stack: string;
  description: string;
  tasks: TemplateTask[];
}
