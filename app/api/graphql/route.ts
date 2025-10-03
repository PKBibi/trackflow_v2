// GraphQL feature flag gate and basic protections
import { rateLimitPerUser } from '@/lib/validation/middleware'
import { createClient } from '@/lib/supabase/server'
import { HttpError, isHttpError } from '@/lib/errors'
import { NextRequest, NextResponse } from 'next/server'
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLID, graphql } from 'graphql'
import { getAuthenticatedUser } from '@/lib/auth/api-key'
import { getActiveTeam } from '@/lib/auth/team'

// Forward declare types to avoid circular reference
const TimeEntryType: GraphQLObjectType = new GraphQLObjectType({
  name: 'TimeEntry',
  fields: () => ({
    id: { type: GraphQLID },
    description: { type: GraphQLString },
    startTime: { type: GraphQLString },
    endTime: { type: GraphQLString },
    duration: { type: GraphQLInt },
    amount: { type: GraphQLFloat },
    projectId: { type: GraphQLID },
    clientId: { type: GraphQLID },
    billable: { type: GraphQLBoolean },
    channel: { type: GraphQLString },
    notes: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    project: {
      type: ProjectType as any,
      resolve: async (parent, args, context) => {
        if (!parent.projectId) return null
        const { data } = await context.supabase
          .from('projects')
          .select('*')
          .eq('id', parent.projectId)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .single()
        return data
      }
    },
    client: {
      type: ClientType as any,
      resolve: async (parent, args, context) => {
        if (!parent.clientId) return null
        const { data } = await context.supabase
          .from('clients')
          .select('*')
          .eq('id', parent.clientId)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .single()
        return data
      }
    }
  })
})

const ProjectType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    client: { type: GraphQLString },
    status: { type: GraphQLString },
    hourlyRate: { type: GraphQLFloat },
    budget: { type: GraphQLFloat },
    estimatedHours: { type: GraphQLFloat },
    deadline: { type: GraphQLString },
    color: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    clientDetails: {
      type: ClientType,
      resolve: async (parent, args, context) => {
        if (!parent.client) return null
        const { data } = await context.supabase
          .from('clients')
          .select('*')
          .eq('name', parent.client)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .single()
        return data
      }
    },
    timeEntries: {
      type: new GraphQLList(TimeEntryType),
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('time_entries')
          .select('*')
          .eq('project_id', parent.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
        return data || []
      }
    },
    totalHours: {
      type: GraphQLFloat,
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('time_entries')
          .select('duration')
          .eq('project_id', parent.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (!data) return 0
        return data.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) / 60
      }
    },
    totalRevenue: {
      type: GraphQLFloat,
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('time_entries')
          .select('amount')
          .eq('project_id', parent.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (!data) return 0
        return data.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0)
      }
    }
  })
})

const ClientType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    company: { type: GraphQLString },
    address: { type: GraphQLString },
    hourlyRate: { type: GraphQLFloat },
    currency: { type: GraphQLString },
    retainerAmount: { type: GraphQLFloat },
    retainerUsed: { type: GraphQLFloat },
    retainerReset: { type: GraphQLString },
    notes: { type: GraphQLString },
    status: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('projects')
          .select('*')
          .eq('client', parent.name)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
        return data || []
      }
    }
  })
})

const InvoiceLineItemType: GraphQLObjectType = new GraphQLObjectType({
  name: 'InvoiceLineItem',
  fields: {
    id: { type: GraphQLID },
    description: { type: GraphQLString },
    quantity: { type: GraphQLFloat },
    unitPrice: { type: GraphQLFloat },
    total: { type: GraphQLFloat },
    timeEntryId: { type: GraphQLID }
  }
})

const InvoiceType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Invoice',
  fields: () => ({
    id: { type: GraphQLID },
    number: { type: GraphQLString },
    clientId: { type: GraphQLString },
    projectId: { type: GraphQLString },
    status: { type: GraphQLString },
    issueDate: { type: GraphQLString },
    dueDate: { type: GraphQLString },
    subtotal: { type: GraphQLFloat },
    tax: { type: GraphQLFloat },
    total: { type: GraphQLFloat },
    currency: { type: GraphQLString },
    notes: { type: GraphQLString },
    items: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: GraphQLString },
    paidAt: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve: async (parent, args, context) => {
        if (!parent.clientId) return null
        const { data } = await context.supabase
          .from('clients')
          .select('*')
          .eq('id', parent.clientId)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .single()
        return data
      }
    },
    lineItems: {
      type: new GraphQLList(InvoiceLineItemType),
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('invoice_line_items')
          .select('*')
          .eq('invoice_id', parent.id)
        return data || []
      }
    }
  })
})

const UserStatsType: GraphQLObjectType = new GraphQLObjectType({
  name: 'UserStats',
  fields: {
    totalHours: { type: GraphQLFloat },
    totalProjects: { type: GraphQLInt },
    totalClients: { type: GraphQLInt },
    totalRevenue: { type: GraphQLFloat },
    averageHoursPerDay: { type: GraphQLFloat },
    mostProductiveDay: { type: GraphQLString },
    topProjects: { type: new GraphQLList(ProjectType) }
  }
})

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Get single client
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('clients')
          .select('*')
          .eq('id', args.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .single()
        return data
      }
    },

    // Get all clients
    clients: {
      type: new GraphQLList(ClientType),
      args: {
        status: { type: GraphQLString },
        search: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: async (parent, args, context) => {
        let query = context.supabase
          .from('clients')
          .select('*')
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (args.status) query = query.eq('status', args.status)
        if (args.search) query = query.ilike('name', `%${args.search}%`)
        if (args.limit) query = query.limit(args.limit)
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 10) - 1)

        const { data } = await query.order('name')
        return data || []
      }
    },

    // Get single project
    project: {
      type: ProjectType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('projects')
          .select('*')
          .eq('id', args.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .single()
        return data
      }
    },

    // Get all projects
    projects: {
      type: new GraphQLList(ProjectType),
      args: {
        status: { type: GraphQLString },
        client: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: async (parent, args, context) => {
        let query = context.supabase
          .from('projects')
          .select('*')
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (args.status) query = query.eq('status', args.status)
        if (args.client) query = query.eq('client', args.client)
        if (args.limit) query = query.limit(args.limit)
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 10) - 1)

        const { data } = await query
        return data || []
      }
    },
    
    // Get single time entry
    timeEntry: {
      type: TimeEntryType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('time_entries')
          .select('*')
          .eq('id', args.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .single()
        return data
      }
    },

    // Get time entries
    timeEntries: {
      type: new GraphQLList(TimeEntryType),
      args: {
        projectId: { type: GraphQLString },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
        billable: { type: GraphQLBoolean },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: async (parent, args, context) => {
        let query = context.supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (args.projectId) query = query.eq('project_id', args.projectId)
        if (args.startDate) query = query.gte('start_time', args.startDate)
        if (args.endDate) query = query.lte('start_time', args.endDate)
        if (args.billable !== undefined) query = query.eq('billable', args.billable)
        if (args.limit) query = query.limit(args.limit)
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 10) - 1)

        const { data } = await query.order('start_time', { ascending: false })
        return data || []
      }
    },
    
    // Get invoices
    invoices: {
      type: new GraphQLList(InvoiceType),
      args: {
        status: { type: GraphQLString },
        clientId: { type: GraphQLString },
        projectId: { type: GraphQLString },
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt }
      },
      resolve: async (parent, args, context) => {
        let query = context.supabase
          .from('invoices')
          .select('*')
          .eq('user_id', context.user.id)
        
        if (args.status) query = query.eq('status', args.status)
        if (args.clientId) query = query.eq('client_id', args.clientId)
        if (args.projectId) query = query.eq('project_id', args.projectId)
        if (args.limit) query = query.limit(args.limit)
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 10) - 1)
        
        const { data } = await query.order('created_at', { ascending: false })
        return data || []
      }
    },
    
    // Get user statistics
    userStats: {
      type: UserStatsType,
      args: {
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        // Calculate various statistics
        const stats = {
          totalHours: 0,
          totalProjects: 0,
          totalClients: 0,
          totalRevenue: 0,
          averageHoursPerDay: 0,
          mostProductiveDay: '',
          topProjects: []
        }

        // Get time entries for period
        let timeQuery = context.supabase
          .from('time_entries')
          .select('duration, project_id')
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (args.startDate) timeQuery = timeQuery.gte('start_time', args.startDate)
        if (args.endDate) timeQuery = timeQuery.lte('start_time', args.endDate)

        const { data: timeEntries } = await timeQuery

        if (timeEntries) {
          stats.totalHours = timeEntries.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) / 3600
        }

        // Get projects count
        const { count: projectCount } = await context.supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        stats.totalProjects = projectCount || 0

        // Get clients count
        const { data: clients } = await context.supabase
          .from('projects')
          .select('client')
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (clients) {
          stats.totalClients = new Set(clients.map((p: any) => p.client)).size
        }

        // Calculate revenue from paid invoices
        const { data: invoices } = await context.supabase
          .from('invoices')
          .select('total')
          .eq('user_id', context.user.id)
          .eq('status', 'paid')

        if (invoices) {
          stats.totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)
        }

        return stats
      }
    }
  }
})

// Root Mutation
const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    // Create client
    createClient: {
      type: ClientType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        company: { type: GraphQLString },
        address: { type: GraphQLString },
        hourlyRate: { type: GraphQLFloat },
        currency: { type: GraphQLString },
        retainerAmount: { type: GraphQLFloat },
        notes: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        const { data, error } = await context.supabase
          .from('clients')
          .insert({
            ...args,
            user_id: context.user.id,
            team_id: context.teamId,
            status: 'active',
            retainer_used: 0
          })
          .select()
          .single()

        if (error) throw new HttpError(400, error.message)
        return data
      }
    },
    
    // Update client
    updateClient: {
      type: ClientType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        company: { type: GraphQLString },
        address: { type: GraphQLString },
        hourlyRate: { type: GraphQLFloat },
        currency: { type: GraphQLString },
        retainerAmount: { type: GraphQLFloat },
        status: { type: GraphQLString },
        notes: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        const { id, ...updates } = args
        const { data, error } = await context.supabase
          .from('clients')
          .update(updates)
          .eq('id', id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .select()
          .single()

        if (error) throw new HttpError(400, error.message)
        return data
      }
    },

    // Delete client
    deleteClient: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: async (parent, args, context) => {
        const { error } = await context.supabase
          .from('clients')
          .delete()
          .eq('id', args.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (error) throw new HttpError(400, error.message)
        return true
      }
    },

    // Create project
    createProject: {
      type: ProjectType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        client: { type: GraphQLString },
        hourlyRate: { type: GraphQLFloat },
        budget: { type: GraphQLFloat },
        estimatedHours: { type: GraphQLFloat },
        deadline: { type: GraphQLString },
        color: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        const { data, error } = await context.supabase
          .from('projects')
          .insert({
            name: args.name,
            description: args.description,
            client: args.client,
            hourly_rate: args.hourlyRate,
            budget: args.budget,
            estimated_hours: args.estimatedHours,
            deadline: args.deadline,
            color: args.color,
            user_id: context.user.id,
            team_id: context.teamId,
            status: 'active'
          })
          .select()
          .single()

        if (error) throw new HttpError(400, error.message)
        return data
      }
    },

    // Update project
    updateProject: {
      type: ProjectType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        client: { type: GraphQLString },
        status: { type: GraphQLString },
        hourlyRate: { type: GraphQLFloat },
        budget: { type: GraphQLFloat },
        estimatedHours: { type: GraphQLFloat },
        deadline: { type: GraphQLString },
        color: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        const { id, hourlyRate, estimatedHours, ...updates } = args

        const updateData = {
          ...updates,
          ...(hourlyRate !== undefined && { hourly_rate: hourlyRate }),
          ...(estimatedHours !== undefined && { estimated_hours: estimatedHours })
        }

        const { data, error } = await context.supabase
          .from('projects')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .select()
          .single()

        if (error) throw new HttpError(400, error.message)
        return data
      }
    },
    
    // Create time entry
    createTimeEntry: {
      type: TimeEntryType,
      args: {
        description: { type: new GraphQLNonNull(GraphQLString) },
        projectId: { type: new GraphQLNonNull(GraphQLString) },
        clientId: { type: GraphQLString },
        startTime: { type: new GraphQLNonNull(GraphQLString) },
        endTime: { type: GraphQLString },
        duration: { type: GraphQLInt },
        billable: { type: GraphQLBoolean },
        channel: { type: GraphQLString },
        notes: { type: GraphQLString },
        tags: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (parent, args, context) => {
        // Calculate duration if end_time is provided
        let duration = args.duration;
        let amount = null;

        if (args.endTime && !duration) {
          const start = new Date(args.startTime)
          const end = new Date(args.endTime)
          duration = Math.round((end.getTime() - start.getTime()) / 60000) // Convert to minutes
        }

        // Get project details for hourly rate calculation
        if (duration && args.projectId) {
          const { data: project } = await context.supabase
            .from('projects')
            .select('hourly_rate')
            .eq('id', args.projectId)
            .eq('team_id', context.teamId)
            .single()

          if (project && project.hourly_rate) {
            amount = (duration / 60) * project.hourly_rate
          }
        }

        const { data, error } = await context.supabase
          .from('time_entries')
          .insert({
            description: args.description,
            project_id: args.projectId,
            client_id: args.clientId,
            start_time: args.startTime,
            end_time: args.endTime,
            duration,
            amount,
            billable: args.billable,
            channel: args.channel,
            notes: args.notes,
            tags: args.tags,
            user_id: context.user.id,
            team_id: context.teamId
          })
          .select()
          .single()

        if (error) throw new HttpError(400, error.message)
        return data
      }
    },
    
    // Stop running timer
    stopTimer: {
      type: TimeEntryType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        endTime: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (parent, args, context) => {
        const { data, error } = await context.supabase
          .from('time_entries')
          .update({
            end_time: args.endTime,
            duration: Math.floor((new Date(args.endTime).getTime() - new Date().getTime()) / 1000)
          })
          .eq('id', args.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)
          .select()
          .single()

        if (error) throw new HttpError(400, error.message)
        return data
      }
    },

    // Delete time entry
    deleteTimeEntry: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: async (parent, args, context) => {
        const { error } = await context.supabase
          .from('time_entries')
          .delete()
          .eq('id', args.id)
          .eq('user_id', context.user.id)
          .eq('team_id', context.teamId)

        if (error) throw new HttpError(400, error.message)
        return true
      }
    }
  }
})

// Create schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
})

// API Route handlers
export async function POST(request: NextRequest) {
  if (process.env.GRAPHQL_ENABLED !== 'true') {
    return new Response(JSON.stringify({ error: 'GraphQL disabled' }), { status: 503 })
  }
  await rateLimitPerUser()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  try {
    // Get active team context
    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) return teamContext.response
    const { teamId } = teamContext

    // Parse GraphQL query
    const { query, variables, operationName } = await request.json()

    // Execute GraphQL query with context
    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      operationName,
      contextValue: { supabase, user, teamId }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GraphQL Error:', error)
    return NextResponse.json({
      errors: [{ message: 'Internal server error' }]
    }, { status: 500 })
  }
}

// Support GET for GraphQL introspection in development
export async function GET() {
  if (process.env.GRAPHQL_ENABLED !== 'true') {
    return new Response(JSON.stringify({ error: 'GraphQL disabled' }), { status: 503 })
  }
  await rateLimitPerUser()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      error: 'GraphQL introspection disabled in production' 
    }, { status: 403 })
  }

  // Return GraphQL schema for introspection
  const introspectionQuery = `
    {
      __schema {
        types {
          name
          description
          fields {
            name
            description
            type {
              name
            }
          }
        }
      }
    }
  `

  const result = await graphql({
    schema,
    source: introspectionQuery
  })

  return NextResponse.json(result)
}



