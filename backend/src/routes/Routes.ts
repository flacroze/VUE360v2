// @file Routes.ts
// @description Routes for the backend API, handling various endpoints related to agents, sites, teams, groups, experiences, contexts, activities, KPIs, skills matrix, activity staffing, and planning.
// @author PinkLake, 2024-2025
import express, { Router, Request, Response } from 'express';
import { RowDataPacket, Pool, PoolConnection } from 'mysql2/promise';
import pool from '../config/database';
import {getContractCode } from '../utils/utils';

interface Activity extends RowDataPacket { 
  id: number;
  name: string;
  enabled?: number;
  date_: string;
  jour: string;
  heure: string;
  cible: number;
  min: number;
  max: number;
  count: number;
  delta: number;
}

interface Agent extends RowDataPacket { 
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  siteId: number;
  siteName?: string;
  teamId?: number;
  groupId?: number;
  teamName?: string;
  groupName?: string;
}

interface Site extends RowDataPacket { 
  id: number;
  name: string;
}

interface Team extends RowDataPacket { 
  id: number;
  name: string;
}

interface Group extends RowDataPacket { 
  id: number;
  name: string;
}

interface Experience extends RowDataPacket { 
  id: number;
  name: string;
}

interface Context extends RowDataPacket { 
  id: number;
  name: string;
}

interface ActivityRepartition {
  id: number;
  name: string;
  date: string;
  duration: number;
};

interface KPIs extends RowDataPacket {
  totalAgents: number;
  totalSites: number;
  totalTeams: number;
  activeActivities: number;
}

interface SkillsMatrixRow {
  activityId: number;
  activityName: string;
  levels: Record<string, number>;
}
interface SkillsMatrix {
  activities: { id: number; name: string }[];
  levels: string[];
  data: SkillsMatrixRow[];
};

const router: Router = express.Router();

function isValidDate(dateString: string): boolean {
    return !isNaN(Date.parse(dateString));
}

async function getConnection(): Promise<PoolConnection> {
  const pool = await import('../config/database');
  return pool.default.getConnection();
}

////////////////////////////////////////////////////////////////////////////
// ROUTES ELEMENTAIRES
////////////////////////////////////////////////////////////////////////////
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const filters = {
      siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
      activityId: req.query.activityId ? parseInt(req.query.activityId as string) : undefined,
      skillLevel: req.query.skillLevel ? parseInt(req.query.skillLevel as string) : undefined,
    };
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    let query = `
      SELECT 
        agentId as id,
        CASE ac.contractNature
          WHEN 0 THEN 'CDI'
          WHEN 1 THEN 'CDD'
          WHEN 2 THEN 'Intérim'
          WHEN 3 THEN 'Alternance'
          WHEN 4 THEN 'Stage'
          WHEN 5 THEN 'Autre'
          ELSE 'Autre'
        END as contractType,
        ci.name as contract,
        DATE_FORMAT(departureDate, '%d-%m-%Y') as departureDate,
        u.email as email,
        u.firstName as firstName,
        u.lastName as lastName,
        s.name as siteName,
        t.name as teamName,
        g.name as groupName,
        e.name as experienceName,
        c.name as contextName 
      FROM agentContract ac
      LEFT JOIN user u ON agentId = u.id
      LEFT JOIN site s ON u.siteId = s.id
      LEFT JOIN agentUser au ON u.id = au.id
      LEFT JOIN team t ON au.teamId = t.id
      LEFT JOIN \`group\` g ON au.groupId = g.id
      LEFT JOIN contractInfo ci ON ac.contractId = ci.id
      LEFT JOIN experience e ON au.experienceId = e.id
      LEFT JOIN context c ON au.contextId = c.id
      WHERE hireDate <= CURDATE() AND (departureDate IS NULL OR departureDate >= CURDATE())
    `;
    
    const params: any[] = [];

    if (cleanFilters.siteId) {
      query += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        query += ' AND ac.contractNature = ?';
        params.push(natureValue);
      }
    }

    if (cleanFilters.teamId) {
      query += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      query += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      query += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      query += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }  

    // if (cleanFilters.activityId) {
    //   query += ' AND ac.activityId = ?';
    //   params.push(cleanFilters.activityId);
    // }
    // if (cleanFilters.skillLevel) {
    //   query += ' AND ac.skillLevel = ?';
    //   params.push(cleanFilters.skillLevel);
    // }


    const [rows] = await pool.query<Agent[]>(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des agents:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get sites
router.get("/sites", async (req, res) => {
  try {
    const [rows] = await pool.query<Site[]>(
      `SELECT id, name FROM site ORDER BY name`
    );
    res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch sites',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get teams
router.get("/teams", async (req, res) => {
  try {
    const [rows] = await pool.query<Team[]>(
      `SELECT id, name FROM team ORDER BY name`
    );
    res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch teams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get groups
router.get("/groups", async (req, res) => {
      try {
    const [rows] = await pool.query<Group[]>(
      `SELECT id, name FROM \`group\` ORDER BY name`
    );
    res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch teams',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get experiences
router.get("/experiences", async (req, res) => {
      try {
    const [rows] = await pool.query<Experience[]>(
      `SELECT id, name FROM experience ORDER BY name`
    );
    res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch experiences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get contexts
router.get("/contexts", async (req, res) => {
      try {
    const [rows] = await pool.query<Context[]>(
      `SELECT id, name FROM context ORDER BY name`
    );
    res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch contexts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get activities
router.get("/activities", async (req, res) => {
  try {
    const [rows] = await pool.query<Activity[]>(
      `SELECT id, name FROM activity WHERE enabled = 1 ORDER BY name`
    );
    res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

////////////////////////////////////////////////////////////////////
// ROUTES POUR LES KPIs
////////////////////////////////////////////////////////////////////
//KPI agents
router.get("/kpis/agents", async (req, res) => {
    try {
      const [rows] = await pool.query<KPIs[]>(
        `
        SELECT COUNT(DISTINCT u.id) as totalAgents
        FROM user u
        WHERE u.role = 1
        AND u.id IN (
          SELECT agentId 
          FROM agentContract 
          WHERE hireDate <= CURDATE() 
          AND (departureDate IS NULL OR departureDate >= CURDATE())
        )
      `
      );
      //console.log("Total Agents Result:", rows);
      res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch agents',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//KPI sites
router.get("/kpis/sites", async (req, res) => {
  try {
      const [rows] = await pool.query<KPIs[]>(
        `
        SELECT COUNT(DISTINCT u.siteId) as totalSites 
        FROM user u 
        WHERE u.role = 1 
        AND u.siteId IS NOT NULL
        AND u.id IN (
          SELECT agentId 
          FROM agentContract 
          WHERE hireDate <= CURDATE() 
          AND (departureDate IS NULL OR departureDate >= CURDATE())
        )
      `
      );
      //console.log("Total Sites Result:", rows);
      res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch sites',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//KPI teams
router.get("/kpis/teams", async (req, res) => {
  try {
      const [rows] = await pool.query<KPIs[]>(
        `
        SELECT COUNT(DISTINCT au.teamId) as totalTeams 
        FROM agentUser au
        INNER JOIN user u ON u.id = au.id
        WHERE u.role = 1 
        AND au.teamId IS NOT NULL
        AND u.id IN (
          SELECT agentId 
          FROM agentContract 
          WHERE hireDate <= CURDATE() 
          AND (departureDate IS NULL OR departureDate >= CURDATE())
        )
      `);
      //console.log("Total Teams Result:", rows);
      res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch sites',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//KPI activities
router.get("/kpis/activities", async (req, res) => {
  try {
      const [rows] = await pool.query<KPIs[]>(
        `
        SELECT COUNT(*) as totalActivities
        FROM activity
        WHERE enabled = 1
      `
      );
      //console.log("Total Activities Result:", rows);    
      res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


///////////////////////////////////////////////////////
// ROUTES POUR LA MATRICE DES COMPÉTENCES
///////////////////////////////////////////////////////
// Get skills matrix
router.get('/skills/matrix', async (req: Request, res: Response) => {
  try {
    const filters = {
      siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
    };
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    const params: any[] = [];
    let agentfilters = " 1=1";

    if (cleanFilters.siteId) {
      agentfilters += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        agentfilters += ' AND ac.contractNature = ?';
        params.push(natureValue);
      }
    }    
    if (cleanFilters.teamId) {
      agentfilters += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      agentfilters += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      agentfilters += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      agentfilters += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    //console.log("Agent Filters:", agentfilters, "Params:", params);  

    // Construire la requête SQL
    let query = `
      SELECT 
          a.id as activityId,
          a.name as activityName,
          COALESCE(s.level, 0) as level,
          COUNT(CASE WHEN s.level IS NOT NULL THEN 1 ELSE ac.agentId END) as count
        FROM activity a
        CROSS JOIN (
          SELECT ac.agentId
          FROM agentContract ac
          LEFT JOIN user u ON ac.agentId = u.id
          LEFT JOIN agentUser au ON ac.agentId = au.id
          WHERE ac.hireDate <= CURDATE() AND (ac.departureDate IS NULL OR ac.departureDate >= CURDATE()) AND ${agentfilters}
        ) ac
        LEFT JOIN skill s ON a.id = s.activityId AND ac.agentId = s.agentId
        WHERE a.enabled = 1
        GROUP BY a.id, a.name, COALESCE(s.level, 0)
        ORDER BY a.name, level
    `;

      // Fetch skills data from database
      const [skillsData] = await pool.query<any[]>(query, params);

      // Transform data into matrix format
      const matrix: SkillsMatrix = {
        activities: [],
        levels: ['Aucun', 'En cours', 'Acquis', 'Expert'],
        data: []
      };

      const activitiesMap = new Map();
      const dataMap = new Map();

      (skillsData as any[]).forEach(row => {
        if (!activitiesMap.has(row.activityId)) {
          activitiesMap.set(row.activityId, {
            id: row.activityId,
            name: row.activityName
          });
        }

        const levelName = row.level === 0 ? 'Aucun' : 
                         row.level === 1 ? 'En cours' : 
                         row.level === 2 ? 'Acquis' : 'Expert';

        const key = `${row.activityId}-${levelName}`;
        if (!dataMap.has(key)) {
          dataMap.set(key, 0);
        }
        dataMap.set(key, dataMap.get(key) + row.count);
      });

      matrix.activities = Array.from(activitiesMap.values());

      // Build matrix data
      matrix.activities.forEach(activity => {
        const levels: Record<string, number> = {};
        matrix.levels.forEach(level => {
          const key = `${activity.id}-${level}`;
          levels[level] = dataMap.get(key) || 0;
        });

        const row: SkillsMatrixRow = {
          activityId: activity.id,
          activityName: activity.name,
          levels
        };

        matrix.data.push(row);
      });
      res.json(matrix);
    } catch (error) {
      console.error('Error fetching skills matrix:', error);
      res.status(500).json({ error: 'Failed to fetch skills matrix' });
    }
  }
);

// Get skills by agent
router.get('/skills/agent', async (req: Request, res: Response) => {
  try {
    const filters = {
      siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
    };
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    const params: any[] = [];
    let agentfilters = " 1=1";

    if (cleanFilters.siteId) {
      agentfilters += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        agentfilters += ' AND ac.contractNature = ?';
        params.push(natureValue);
      }
    }    
    if (cleanFilters.teamId) {
      agentfilters += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      agentfilters += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      agentfilters += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      agentfilters += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    //console.log("Agent Filters:", agentfilters, "Params:", params);  

    // Construire la requête SQL
    let query = `
      SELECT u.lastName, u.firstName, a.name AS activityName, COALESCE(s.level,0) as level
      FROM skill s
      JOIN user u ON s.agentId = u.id
      JOIN agentUser au ON s.agentId = au.id 
      JOIN activity a ON s.activityId = a.id
      JOIN agentContract ac ON s.agentId = ac.agentId
      WHERE u.role = 1
        AND u.id IN (
        SELECT agentId
        FROM agentContract
        WHERE hireDate <= CURDATE() AND (departureDate IS NULL OR departureDate >= CURDATE())
        )
        AND ${agentfilters}
    `;

      // Fetch skills data from database
      const [rows] = await pool.query<any[]>(query, params);

      //console.log("Result:", rows);    
      res.json(rows); // <-- on renvoie seulement les données
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
//////////////////////////////////////////////////////////////////////////////////////
// ROUTES POUR DIMENSIONNEMENT DES ACTIVITÉS
//////////////////////////////////////////////////////////////////////////////////////
router.get('/staffing/activity', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    const defaultStartDate = new Date('2025-06-30');
    const defaultEndDate = new Date('2025-06-30');
    defaultEndDate.setDate(defaultEndDate.getDate() + 1);

    // Utiliser les valeurs fournies ou les valeurs par défaut
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];
    const effectiveStartDate: string = startDate ? (startDate as string) : formatDate(defaultStartDate);
    const effectiveEndDate: string = endDate ? (endDate as string) : formatDate(defaultEndDate);

    let query = `
      SELECT aps.id,
            subquery.name,
            DATE_FORMAT(aps.beginDateTime, '%d-%m-%Y') as date_,
            CASE DAYOFWEEK(aps.beginDateTime)
                WHEN 1 THEN 'Dimanche'
                WHEN 2 THEN 'Lundi'
                WHEN 3 THEN 'Mardi'
                WHEN 4 THEN 'Mercredi'
                WHEN 5 THEN 'Jeudi'
                WHEN 6 THEN 'Vendredi'
                WHEN 7 THEN 'Samedi'
            END AS jour,
            TIME(aps.beginDateTime) as heure,
            aps.size as cible,
            NULLIF(aps.minSize, -2147483648) as min,
            NULLIF(aps.maxSize, 2147483647) as max,
            subquery.count,
            (subquery.count - aps.size ) as delta
      FROM activityPublicationSizing aps 
      JOIN (
          SELECT ac.id, ac.name, aap.start, COUNT(*) as count
          FROM agentAssignmentPublication aap
          JOIN activity ac ON ac.id = aap.activityId
          GROUP BY ac.id, ac.name, aap.start
          ORDER BY ac.name, aap.start
      ) AS subquery ON aps.activityId = subquery.id AND aps.beginDateTime = subquery.start
      WHERE 1=1
    `;
    const params: string[] = [];

    query += ` AND aps.beginDateTime BETWEEN ? AND ?`;
    params.push(effectiveStartDate, effectiveEndDate);

    query += ` ORDER BY heure`;

    const [rows] = await pool.query<Activity[]>(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des dimensionnements des activités:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//////////////////////////////////////////////////////////////////////////////////////
// ROUTES POUR PLANNING
//////////////////////////////////////////////////////////////////////////////////////

router.get('/planning/schedule-summary', async (req: Request, res: Response) => {
  try {
    const filters = {
      siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    let query = `
      SELECT 
        COUNT(DISTINCT u.id) AS totalAgents,
        COUNT(DISTINCT s.id) AS totalSites,
        COUNT(DISTINCT t.id) AS totalTeams,
        COUNT(DISTINCT a.id) AS activeActivities
      FROM user u
      LEFT JOIN site s ON u.siteId = s.id
      LEFT JOIN agentUser au ON u.id = au.id
      LEFT JOIN team t ON au.teamId = t.id
      LEFT JOIN \`group\` g ON au.groupId = g.id
      LEFT JOIN agentContract ac ON u.id = ac.agentId
      LEFT JOIN activity a ON a.enabled = 1
      WHERE u.role = 1 AND ac.hireDate <= CURDATE() AND (ac.departureDate IS NULL OR ac.departureDate >= CURDATE())
    `;

    const params: any[] = [];

    if (cleanFilters.siteId) {
      query += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }
    
    if (cleanFilters.contractType) {
      //const natureValue = contractTypeMap[cleanFilters.contractType];
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        query += ' AND ac.contractNature = ?';
        params.push(natureValue.toString());
      }
    }
    if (cleanFilters.teamId) {
      query += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      query += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      query += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      query += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    if (cleanFilters.startDate) {
      query += ' AND a.startDate >= ?';
      params.push(cleanFilters.startDate);
    }
    if (cleanFilters.endDate) {
      query += ' AND a.endDate <= ?';
      params.push(cleanFilters.endDate);
    }
    const [rows] = await pool.query<KPIs[]>(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'No data found' });
    }
    res.json(rows[0]); // on renvoie seulement la première ligne
  } catch (error) {
    console.error('Erreur lors de la récupération des KPIs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour les heures planifiées et assignées chaque jour
router.get('/planning/daily-breakdown', async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
    };
    
    // Validation des dates
    const startDate = filters.startDate && isValidDate(filters.startDate) ? filters.startDate : '2025-07-07';
    const endDate = filters.endDate && isValidDate(filters.endDate) ? filters.endDate : '2025-07-13';
    //console.log("Dates utilisées:", startDate, endDate);

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date');
    }

    const params: any[] = [startDate, endDate];
    let agentfilters = "1=1";

    if (cleanFilters.siteId) {
      agentfilters += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        agentfilters += ' AND ac.contractNature = ?';
        params.push(natureValue.toString());
      }
    }    
    if (cleanFilters.teamId) {
      agentfilters += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      agentfilters += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      agentfilters += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      agentfilters += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    
    let query =
      `
      SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') as date_formatted,
        date, 
        COALESCE(SUM(scheduled_seconds), 0) / 3600.0 as planned_hours,
        COALESCE(SUM(duration_seconds), 0) / 3600.0 as assigned_hours
      FROM (
        SELECT
          DATE(aap.start) AS date, 
          SUM(TIME_TO_SEC(SEC_TO_TIME(TIME_TO_SEC(aap.end) - TIME_TO_SEC(aap.start)))) AS duration_seconds,
          NULL AS scheduled_seconds
        FROM agentAssignmentPublication aap
        JOIN agentContract ac ON ac.agentId = aap.agentId
        JOIN agentUser au ON au.id = aap.agentId
        JOIN user u ON u.id = aap.agentId
        WHERE DATE(aap.start) BETWEEN ? AND ?
        AND ${agentfilters}
        GROUP BY DATE(aap.start)
        UNION ALL
        SELECT
          DATE(asp.date) AS date, 
          NULL AS duration_seconds,
          SUM(asp.end - asp.start - COALESCE(asp.lunchEnd, 0) + COALESCE(asp.lunchStart, 0)) AS scheduled_seconds
        FROM agentSchedulePublication asp
        JOIN agentContract ac ON ac.agentId = asp.agentId
        JOIN agentUser au ON au.id = asp.agentId
        JOIN user u ON u.id = asp.agentId
        WHERE DATE(asp.date) BETWEEN ? AND ?
        AND ${agentfilters}
        GROUP BY DATE(asp.date)
      ) combined
      GROUP BY date
      ORDER BY date
      `
    // Préparer les paramètres dans le bon ordre
    const queryParams = params.concat(params);
    //console.log('Executing query:', query);
    //console.log('Query params:', queryParams);
    
      // Exécuter la requête
      const [results] = await pool.query<any[]>(query, queryParams);
      const queryResults = results as any[];

      console.log('Query results:', queryResults);

    // dates valables pour la période demandée
    const allDates = queryResults.map(item => item.date_formatted);

    // Créer un map des résultats par date (utiliser le format déjà correct de la DB)
    const resultsByDate = queryResults.reduce((acc, row) => {
        // Utiliser directement le date_formatted de la requête SQL
        const dateKey = row.date_formatted;
        acc[dateKey] = {
            plannedHours: parseFloat(row.planned_hours) || 0,
            assignedHours: parseFloat(row.assigned_hours) || 0
        };
        return acc;
    }, {} as { [date: string]: { plannedHours: number; assignedHours: number } });

    //console.log('Results by date after processing:', resultsByDate);

    // Construire les données journalières finales
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dailyData: any[] = [];
    let totalPlannedHours = 0;
    let totalAssignedHours = 0;

    for (const date of allDates) {
        const dayData = resultsByDate[date] || { plannedHours: 0, assignedHours: 0 };
        const plannedHours = dayData.plannedHours;
        const assignedHours = dayData.assignedHours;
        const dayOfWeek = dayNames[new Date(date).getDay()];
        const utilizationRate = plannedHours > 0 ? Math.round((assignedHours / plannedHours) * 1000) / 10 : 0;

        dailyData.push({
            date,
            dayOfWeek,
            plannedHours: Math.round(plannedHours * 10) / 10,
            assignedHours: Math.round(assignedHours * 10) / 10,
            utilizationRate
        });

        totalPlannedHours += plannedHours;
        totalAssignedHours += assignedHours;
    }

    const averageUtilizationRate = totalPlannedHours > 0 ? Math.round((totalAssignedHours / totalPlannedHours) * 1000) / 10 : 0;

    // Retourner la réponse
    res.json({
        data: dailyData,
        totalPlannedHours: Math.round(totalPlannedHours * 10) / 10,
        totalAssignedHours: Math.round(totalAssignedHours * 10) / 10,
        averageUtilizationRate
    });

    } catch (error) {
        console.error('Error fetching daily schedule breakdown:', {
            message: (error as Error).message,
            stack: (error as Error).stack,
        });
        res.status(500).json({
            error: 'Failed to fetch daily breakdown',
            message: (error as Error).message,
            data: [],
            totalPlannedHours: 0,
            totalAssignedHours: 0,
            averageUtilizationRate: 0
        });
    } 
});

// Route pour la répartition des activités par date
router.get("/planning/activity/repartition", async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
    };
    
    // Validation des dates
    const startDate = filters.startDate && isValidDate(filters.startDate) ? filters.startDate : '2025-07-07';
    const endDate = filters.endDate && isValidDate(filters.endDate) ? filters.endDate : '2025-07-13';
    //console.log("Dates utilisées:", startDate, endDate);

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date');
    }

    const params: any[] = [];
    let agentfilters = "1=1";

    if (cleanFilters.siteId) {
      agentfilters += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        agentfilters += ' AND ac2.contractNature = ?';
        params.push(natureValue.toString());
      }
    }    
    if (cleanFilters.teamId) {
      agentfilters += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      agentfilters += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      agentfilters += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      agentfilters += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    
    let query =
        `
        SELECT
          ac.id,
          ac.name,
          DATE_FORMAT(aap.start, '%d-%m-%Y') as date,
          SEC_TO_TIME(SUM(TIME_TO_SEC(aap.end) - TIME_TO_SEC(aap.start))) as duration
        FROM
          agentAssignmentPublication aap
        JOIN activity ac ON
          ac.id = aap.activityId
        JOIN user u ON u.id = aap.agentId
        JOIN agentUser au ON au.id = aap.agentId
        JOIN agentContract ac2 ON ac2.agentId = aap.agentId
        WHERE DATE(aap.start) BETWEEN ? AND ? AND ${agentfilters}
        GROUP BY
          ac.id,
          ac.name,
          date
        ORDER BY
          date,
          ac.name
      `
      // Préparer les paramètres dans le bon ordre
      const queryParams = [ startDate, endDate, ...params ];
      
      const [rows] = await pool.query<any[]>(query, queryParams);

      res.json(rows); // <-- on renvoie seulement les données
      //console.log("Activities repartition data:", rows);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch activities repartition',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route pour la répartition des activités par date
router.get("/planning/schedule/repartition", async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
    };
    
    // Validation des dates
    const startDate = filters.startDate && isValidDate(filters.startDate) ? filters.startDate : '2025-07-07';
    const endDate = filters.endDate && isValidDate(filters.endDate) ? filters.endDate : '2025-07-13';
    //console.log("Dates utilisées:", startDate, endDate);

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date');
    }

    const params: any[] = [];
    let agentfilters = "1=1";

    if (cleanFilters.siteId) {
      agentfilters += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        agentfilters += ' AND ac2.contractNature = ?';
        params.push(natureValue.toString());
      }
    }    
    if (cleanFilters.teamId) {
      agentfilters += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      agentfilters += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      agentfilters += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      agentfilters += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    
    let query =
        `
        SELECT
          asp.agentId AS id,
          u.firstName AS firstName,
          u.lastName AS lastName,
          DATE_FORMAT(asp.date, '%d-%m-%Y') as date,
          CONCAT(
              COALESCE(TIME_FORMAT(SEC_TO_TIME(MIN(asp.start)), '%H:%i'), '00:00'),
              ' - ',
              COALESCE(TIME_FORMAT(SEC_TO_TIME(MAX(asp.end)), '%H:%i'), '00:00')
          ) AS schedule
        FROM agentSchedulePublication asp
        JOIN user u ON u.id = asp.agentId
        JOIN agentUser au ON au.id = asp.agentId
        JOIN agentContract ac2 ON ac2.agentId = asp.agentId
        WHERE asp.date BETWEEN ? AND ? AND ${agentfilters}
        GROUP BY asp.agentId, u.firstName, u.lastName, asp.date
        ORDER BY asp.agentId, asp.date
      `
      // Préparer les paramètres dans le bon ordre
      const queryParams = [ startDate, endDate, ...params ];
      
      const [rows] = await pool.query<any[]>(query, queryParams);

      res.json(rows); // <-- on renvoie seulement les données
      //console.log("Activities repartition data:", rows);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch schedules repartition',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route pour le calcul de l'occupation des agents
// Cette route retourne l'occupation des agents pour une période donnée
router.get("/planning/agent/occupancy", async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
      activityId: req.query.activityId ? parseInt(req.query.activityId as string) : undefined,
    };
    //console.log("Received filters for agents occupancy:", filters);
    
    // Validation des dates
    const startDate = filters.startDate && isValidDate(filters.startDate) ? filters.startDate : '2025-07-07';
    const endDate = filters.endDate && isValidDate(filters.endDate) ? filters.endDate : '2025-07-13';
    //console.log("Dates utilisées:", startDate, endDate);

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date');
    }

    const params: any[] = [];
    let query1 = "1=1";

    if (cleanFilters.siteId) {
      query1 += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        query1 += ' AND ac.contractNature = ?';
        params.push(natureValue.toString());
      }
    }    
    if (cleanFilters.teamId) {
      query1 += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      query1 += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      query1 += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      query1 += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    let query2 = query1; // filtre pour la deuxième sous-requête sans activityId
    
    if (cleanFilters.activityId) {
      query1 += ' AND a.id = ?';
      params.push(cleanFilters.activityId);
    }

    let query =
      `
      SELECT 
          COALESCE(a1.agentId, a2.agentId) AS agentId,
          a1.lastName,
          a1.firstName,
          COALESCE(a2.planned, 0) AS planned,
          COALESCE(a1.assigned, 0) AS assigned
      FROM (
          SELECT 
              aap.agentId AS agentId,
              u.lastName AS lastName,
              u.firstName AS firstName,
              SUM(TIME_TO_SEC(TIMEDIFF(aap.end, aap.start)) / 3600.0) AS assigned
          FROM agentAssignmentPublication aap
          JOIN user u ON u.id = aap.agentId
          JOIN agentUser au ON au.id  = aap.agentId 
          JOIN agentContract ac ON ac.agentId = aap.agentId
          JOIN activity a ON a.id = aap.activityId 
          WHERE aap.start >= ? AND aap.start <= ? AND ${query1}
          GROUP BY aap.agentId
      ) a1
      LEFT JOIN (
          SELECT 
              asp.agentId AS agentId,
              SUM((asp.end - asp.start) / 3600.0) AS planned
          FROM agentSchedulePublication asp
          JOIN user u ON u.id = asp.agentId
          JOIN agentUser au ON au.id  = asp.agentId 
          JOIN agentContract ac ON ac.agentId = asp.agentId  
          WHERE asp.date >= ? AND asp.date <= ? AND ${query2}
          GROUP BY asp.agentId
      ) a2 ON a1.agentId = a2.agentId;
      `
      // Préparer les paramètres dans le bon ordre
      const queryParams = [ startDate, endDate, ...params, startDate, endDate, ...params ];
      //console.log("Filters for agents occupancy:", queryParams);
      const [rows] = await pool.query<any[]>(query, queryParams);

      res.json(rows); // <-- on renvoie seulement les données
      //console.log("Activities repartition data:", rows);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch activities repartition',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Route pour le calcul des activités affectées agents
// Cette route retourne par activité et par agent le ratio heures activité / heures planifiées des agents pour une période donnée
router.get("/planning/agent/assignments", async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
      activityId: req.query.activityId ? parseInt(req.query.activityId as string) : undefined,
    };
    
    // Validation des dates
    const startDate = filters.startDate && isValidDate(filters.startDate) ? filters.startDate : '2025-07-07';
    const endDate = filters.endDate && isValidDate(filters.endDate) ? filters.endDate : '2025-07-13';

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );

    if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date');
    }

    const params: any[] = [];
    let queryFilters = "1=1";

    if (cleanFilters.siteId) {
      queryFilters += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        queryFilters += ' AND ac.contractNature = ?';
        params.push(natureValue.toString());
      }
    }    
    if (cleanFilters.teamId) {
      queryFilters += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      queryFilters += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      queryFilters += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      queryFilters += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }

    let query =
      `
      SELECT 
        aap.agentId AS agentId,
        a.name,
        u.lastName,
        u.firstName,
        SUM(TIME_TO_SEC(TIMEDIFF(aap.end, aap.start)) / 3600.0) AS assigned,
        COALESCE(asp.plannedHours, 0) AS planned,
        CASE 
            WHEN COALESCE(asp.plannedHours, 0) > 0 THEN 
                SUM(TIME_TO_SEC(TIMEDIFF(aap.end, aap.start)) / 3600.0) / COALESCE(asp.plannedHours, 0)
            ELSE NULL 
        END AS ratio
    FROM agentAssignmentPublication aap
    JOIN user u ON u.id = aap.agentId 
    JOIN activity a ON a.id = aap.activityId
    JOIN agentUser au ON au.id = aap.agentId
    JOIN agentContract ac ON ac.agentId = aap.agentId
    LEFT JOIN (
        SELECT
            asp.agentId AS id,
            SUM(asp.end - asp.start - COALESCE(asp.lunchEnd, 0) + COALESCE(asp.lunchStart, 0)) / 3600.0 AS plannedHours
        FROM agentSchedulePublication asp
        WHERE asp.date BETWEEN ? AND ?
        GROUP BY asp.agentId
    ) asp ON asp.id = aap.agentId
    WHERE aap.start >= ? AND aap.end <= ? AND ${queryFilters}
    GROUP BY aap.agentId, a.name, u.lastName, u.firstName, asp.plannedHours
    ORDER BY aap.agentId, a.name;

      `
      // Préparer les paramètres dans le bon ordre
      const queryParams = [ startDate, endDate, startDate, endDate, ...params ];
      //console.log("Filters for agents occupancy:", queryParams);
      const [rows] = await pool.query<any[]>(query, queryParams);

      res.json(rows); // <-- on renvoie seulement les données
      //console.log("Activities repartition data:", rows);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch activities ratio by agent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Route pour le nombre maximum d'agents planifiés
// Cette route retourne le nombre maximum d'agents planifiés pour une période donnée
router.get('/planning/kpi/agents/max', async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      contractType: req.query.contractType as string,
      teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
      groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
      experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
      contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
    };
    // Validation des dates
    const startDate = filters.startDate && isValidDate(filters.startDate) ? filters.startDate : '2025-06-01';
    const endDate = filters.endDate && isValidDate(filters.endDate) ? filters.endDate : '2025-07-01';

    if (new Date(endDate) < new Date(startDate)) {
        throw new Error('End date cannot be before start date');
    }

    //console.log("Filters for max agents:", filters);
    
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
    );
    //console.log("Cleaned filters for max agents:", cleanFilters);

    const params: any[] = [];
    let agentfilters = "1=1";

    if (cleanFilters.siteId) {
      agentfilters += ' AND u.siteId = ?';
      params.push(cleanFilters.siteId);
    }

    if (cleanFilters.contractType) {
      const natureValue = getContractCode(cleanFilters.contractType.toString());
      if (natureValue !== undefined) {
        agentfilters += ' AND ac.contractNature = ?';
        params.push(natureValue.toString());
      }
    }    
    if (cleanFilters.teamId) {
      agentfilters += ' AND au.teamId = ?';
      params.push(cleanFilters.teamId);
    }
    if (cleanFilters.groupId) {
      agentfilters += ' AND au.groupId = ?';
      params.push(cleanFilters.groupId);
    }
    if (cleanFilters.experienceId) {
      agentfilters += ' AND au.experienceId = ?';
      params.push(cleanFilters.experienceId);
    }
    if (cleanFilters.contextId) {
      agentfilters += ' AND au.contextId = ?';
      params.push(cleanFilters.contextId);
    }
    //console.log("Agent Filters:", agentfilters, "Params:", params);  

    // Construire la requête SQL
    let query = `
      WITH compte_activites AS (
      SELECT COUNT(*) as agentsNombre
      FROM (
      SELECT aap.agentId 
      FROM agentAssignmentPublication aap
      JOIN agentContract ac ON aap.agentId = ac.agentId
      JOIN agentUser au ON aap.agentId = au.id
      JOIN user u ON aap.agentId = u.id
      WHERE aap.start >= ? AND aap.end <= ? AND ${agentfilters}
      GROUP BY aap.agentId
      ) as agentIdListe
      ),
      compte_horaires AS (
      SELECT COUNT(*) as agentsNombre
      FROM (
      SELECT asp.agentId 
      FROM agentSchedulePublication asp
      JOIN agentContract ac ON asp.agentId = ac.agentId
      JOIN agentUser au ON asp.agentId = au.id
      JOIN user u ON asp.agentId = u.id
      WHERE asp.date >= ? AND asp.date <= ? AND ${agentfilters}
      GROUP BY asp.agentId
      ) as agentIdListe
      )
      SELECT 
        GREATEST(
            (SELECT agentsNombre FROM compte_activites),
            (SELECT agentsNombre FROM compte_horaires)
        ) as totalAgents
    `;

    // Préparer les paramètres dans le bon ordre
    const queryParams = [startDate, endDate, ...params, startDate, endDate, ...params];
    //console.log("Parametres:", queryParams);

    // Fetch skills data from database
      const [data] = await pool.query<any[]>(query, queryParams);
      //console.log("Max number of agents:", data);
      //console.log("Parametres:", queryParams);
      res.json(data);
    } catch (error) {
      console.error('Error fetching KPI:', error);
      res.status(500).json({ error: 'Failed to fetch KPI' });
    }
  }
);



// router.get('/skills/repart', async (req: Request, res: Response) => {
//   try {
//     const filters = {
//       siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
//       contractType: req.query.contractType as string,
//       teamId: req.query.teamId ? parseInt(req.query.teamId as string) : undefined,
//       groupId: req.query.groupId ? parseInt(req.query.groupId as string) : undefined,
//       experienceId: req.query.experienceId ? parseInt(req.query.experienceId as string) : undefined,
//       contextId: req.query.contextId ? parseInt(req.query.contextId as string) : undefined,
//     };
    
//     const cleanFilters = Object.fromEntries(
//       Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && (typeof value !== 'string' || value !== ''))
//     );

//     let query = `
//       SELECT 
//         a.name as name,
//         s.level as level, 
//         COUNT(DISTINCT s.agentId) as count
//       FROM skill s
//       JOIN activity a ON s.activityId = a.id
//       GROUP BY name, level
//     `;

//     const params: any[] = [];

//     if (cleanFilters.siteId) {
//       query += ' AND u.siteId = ?';
//       params.push(cleanFilters.siteId);
//     }

//     // mapping texte -> valeur numérique
//     const contractTypeMap: Record<string, number> = {
//       "CDI": 0,
//       "CDD": 1,
//       "Intérim": 2,
//       "Alternance": 3,
//       "Stage": 4,
//       "Autre": 5,
//     };

//     if (cleanFilters.contractType) {
//       const natureValue = contractTypeMap[cleanFilters.contractType];
//       if (natureValue !== undefined) {
//         query += ' AND ac.contractNature = ?';
//         params.push(natureValue);
//       }
//     }

//     if (cleanFilters.teamId) {
//       query += ' AND au.teamId = ?';
//       params.push(cleanFilters.teamId);
//     }
//     if (cleanFilters.groupId) {
//       query += ' AND au.groupId = ?';
//       params.push(cleanFilters.groupId);
//     }
//     if (cleanFilters.experienceId) {
//       query += ' AND au.experienceId = ?';
//       params.push(cleanFilters.experienceId);
//     } 
//     if (cleanFilters.contextId) {
//       query += ' AND au.contextId = ?';
//       params.push(cleanFilters.contextId);
//     }
//     ;  
//     const [rows] = await pool.query<RowDataPacket[]>(query, params);
//     res.json(rows);
//   } catch (error) {
//     console.error('Erreur lors de la récupération de la répartition des compétences:', error);
//     res.status(500).json({ error: 'Erreur serveur' });
//   } 
// });

export default router;

