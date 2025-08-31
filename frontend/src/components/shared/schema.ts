import { pgTable, text, serial, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table - includes agents with role = 1
export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: integer("role").notNull(), // 1 = agent
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sites table
export const sites = pgTable("site", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  region: text("region"),
});

// Activities table
export const activities = pgTable("activity", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  isActive: boolean("is_active").default(true),
});

// Agent contracts table
export const agentContracts = pgTable("agentcontract", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  contractType: text("contract_type").notNull(), // CDI, CDD, Intérim
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  siteId: integer("site_id").notNull(),
  status: text("status").default("active"),
});

// Agent skills table
export const agentSkills = pgTable("skill", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  activityId: integer("activity_id").notNull(),
  skillLevel: integer("skill_level").notNull(), // 0, 1, 2, or 3
  lastAssessed: timestamp("last_assessed").defaultNow(),
});

// Agent schedule publication table
export const agentSchedulePublication = pgTable("agentschedulepublication", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  siteId: integer("site_id").notNull(),
  scheduleDate: timestamp("schedule_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }),
  status: text("status").default("planned"),
});

// Agent assignment publication table
export const agentAssignmentPublication = pgTable("agentassignmentpublication", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  activityId: integer("activity_id").notNull(),
  siteId: integer("site_id").notNull(),
  assignmentDate: timestamp("assignment_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }),
  status: text("status").default("assigned"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSchema = createInsertSchema(sites).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertAgentContractSchema = createInsertSchema(agentContracts).omit({
  id: true,
});

export const insertAgentSkillSchema = createInsertSchema(agentSkills).omit({
  id: true,
  lastAssessed: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type AgentContract = typeof agentContracts.$inferSelect;
export type InsertAgentContract = z.infer<typeof insertAgentContractSchema>;
export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = z.infer<typeof insertAgentSkillSchema>;
export type AgentSchedulePublication = typeof agentSchedulePublication.$inferSelect;
export type AgentAssignmentPublication = typeof agentAssignmentPublication.$inferSelect;

// Extended types for UI
export type AgentWithDetails = User & {
  site?: { id: number; name: string };
  contract?: { contractType: string };
  team?: { id: number; name: string };
  group?: { id: number; name: string };
  experience?: { id: number; name: string };
  context?: { id: number; name: string };
  skills: (AgentSkill & { activity: Activity })[];
  totalScheduledHours: number;
  totalAssignedHours: number;
};

export type  Agent = {
  id: number;
  firstName: string;
  lastName: string;
  siteName?: string;
  teamName?: string;
  groupName?: string;
  experienceName?: string;
  contextName?: string;
  contractType?: string;
  contract?: string;
  departureDate?: string;
}

export type  AgentTableProps = {
  filters: FilterOptions;
}

export type DashboardKPIs = {
  totalAgents?: number;
  totalSites?: number;
  totalTeams?: number;
  totalActivities?: number;
};

export type PlanningsKPIs = {
  totalAgents?: number;
  totalTeams?: number;
  totalActivities?: number;
};

export interface ChartData {
  skillsDistribution?: Array<{
    level: string;
    count: number;
  }>;
  contractTypes?: Array<{
    type: string;
    count: number;
  }>;
  skillsByActivity?: Array<{
    activityName: string;
    aucun: number;
    enCours: number;
    acquis: number;
    expert: number;
  }>;
}

export type FilterOptions = {
  siteId?: number;
  contractType?: string;
  teamId?: number;
  groupId?: number;
  experienceId?: string; 
  contextId?: string;
  activityId?: number;
  skillLevel?: number;
  startDate?: string;
  endDate?: string;
  };

export interface SkillsMatrix {
  activities?: { id: number; name: string }[]; // optionnel, si utilisé ailleurs
  levels: string[];
  data: SkillsMatrixRow[];
}

export interface SkillsMatrixRow {
  activityId: number;
  activityName: string;
  level: {
    [key: string]: number;
  };
}

export interface SkillsMatrixRowDG {
  activityId: number;
  activityName: string;
  level: string;
  count: number;
}
export interface RawSkillsMatrixRow {
  activityId: number;
  activityName: string;
  levels: Record<string, number>;
}

export type SkillsMatrixProps = {
  filters: FilterOptions;
}

export type Skill = {
  id: number;
  firstName: string;
  lastName: string;
  siteName?: string;
  teamName?: string;
  groupName?: string;
  experienceName?: string;
  contextName?: string;
  contractType?: string;
  contract?: string;
}

export type SkillProps = {
  filters: FilterOptions;
}

export type Team = {
  id: number;
  name: string;
  description?: string;
};

export type Group = {
  id: number;
  name: string;
  description?: string;
};
export type Experience = {
  id: number;
  name: string;
  description?: string;
};
export type Context = {
  id: number;
  name: string;
  description?: string;
};

export type AgentEvolution = {
  date: string;
  agentCount: number;
};

export type AgentEvolutionData = {
  evolution: AgentEvolution[];
  startDate: string;
  endDate: string;
  totalDays: number;
  averageAgents: number;
};

export type PlanningScheduleSummary = {
  totalHours: number; // Heures planifiées
  assignedHours: number; // Heures d'activités affectées
  totalShifts: number;
  averageHoursPerAgent: number;
  peakDay: string;
  peakHours: number;
  utilizationRate: number; // assignedHours / totalHours * 100
};

export type PlanningActivitiesSummary = {
  totalActivities: number;
  mostUsedActivity: { name: string; count: number };
  activitiesDistribution: { name: string; hours: number; percentage: number }[];
  remoteWorkHours: number;
  remoteWorkPercentage: number;
};

export type DailyScheduleData = {
  date: string;
  dayOfWeek: string;
  plannedHours: number;
  assignedHours: number;
  utilizationRate: number;
};

export type DailyScheduleBreakdown = {
  data: DailyScheduleData[];
  totalPlannedHours: number;
  totalAssignedHours: number;
  averageUtilizationRate: number;
};

export type Week = {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
};

export interface AgentActivityBreakdown {
  agentId: number;
  agentName: string;
  plannedHours: number;
  totalAssignedHours: number;
  activities: Array<{
    activityId: number;
    activityName: string;
    assignedHours: number;
    percentage: number;
  }>;
}

export interface DailyHoursResponse {
  data: {
    date: string;
    dayOfWeek: string;
    plannedHours: number;
    assignedHours: number;
    utilizationRate: number;
  }[];
  totalPlannedHours: number;
  totalAssignedHours: number;
  averageUtilizationRate: number;
}

export interface ActivityRepartition {
  id: number;
  name: string;
  date: string;
  duration: number;
};

export interface Activity {
  id: number;
  name: string;
  code?: string;
  enabled?: boolean;
  activityFamilyId?: number;
  activityNatureId?: number;
  description?: string;
}
