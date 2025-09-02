import { NextRequest, NextResponse } from 'next/server'
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLList, GraphQLNonNull, GraphQLID, graphql } from 'graphql'
import { createClient } from '@/lib/supabase/server'

// GraphQL Types
const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    client: { type: GraphQLString },
    status: { type: GraphQLString },
    hourlyRate: { type: GraphQLFloat },
    budget: { type: GraphQLFloat },
    color: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    timeEntries: {
      type: new GraphQLList(TimeEntryType),
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('time_entries')
          .select('*')
          .eq('project_id', parent.id)
          .eq('user_id', context.user.id)
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
        
        if (!data) return 0
        return data.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600
      }
    }
  })
})

const TimeEntryType = new GraphQLObjectType({
  name: 'TimeEntry',
  fields: () => ({
    id: { type: GraphQLID },
    description: { type: GraphQLString },
    projectId: { type: GraphQLString },
    startTime: { type: GraphQLString },
    endTime: { type: GraphQLString },
    duration: { type: GraphQLInt },
    billable: { type: GraphQLBoolean },
    tags: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    project: {
      type: ProjectType,
      resolve: async (parent, args, context) => {
        const { data } = await context.supabase
          .from('projects')
          .select('*')
          .eq('id', parent.projectId)
          .single()
        return data
      }
    }
  })
})

const InvoiceType = new GraphQLObjectType({
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
    paidAt: { type: GraphQLString }
  })
})

const UserStatsType = new GraphQLObjectType({
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
        
        if (args.startDate) timeQuery = timeQuery.gte('start_time', args.startDate)
        if (args.endDate) timeQuery = timeQuery.lte('start_time', args.endDate)
        
        const { data: timeEntries } = await timeQuery
        
        if (timeEntries) {
          stats.totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600
        }
        
        // Get projects count
        const { count: projectCount } = await context.supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', context.user.id)
        
        stats.totalProjects = projectCount || 0
        
        // Get clients count
        const { data: clients } = await context.supabase
          .from('projects')
          .select('client')
          .eq('user_id', context.user.id)
        
        if (clients) {
          stats.totalClients = new Set(clients.map(p => p.client)).size
        }
        
        // Calculate revenue from paid invoices
        const { data: invoices } = await context.supabase
          .from('invoices')
          .select('total')
          .eq('user_id', context.user.id)
          .eq('status', 'paid')
        
        if (invoices) {
          stats.totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
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
    // Create project
    createProject: {
      type: ProjectType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        client: { type: GraphQLString },
        hourlyRate: { type: GraphQLFloat },
        budget: { type: GraphQLFloat },
        color: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        const { data, error } = await context.supabase
          .from('projects')
          .insert({
            ...args,
            user_id: context.user.id,
            status: 'active'
          })
          .select()
          .single()
        
        if (error) throw new Error(error.message)
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
        color: { type: GraphQLString }
      },
      resolve: async (parent, args, context) => {
        const { id, ...updates } = args
        const { data, error } = await context.supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .eq('user_id', context.user.id)
          .select()
          .single()
        
        if (error) throw new Error(error.message)
        return data
      }
    },
    
    // Create time entry
    createTimeEntry: {
      type: TimeEntryType,
      args: {
        description: { type: new GraphQLNonNull(GraphQLString) },
        projectId: { type: new GraphQLNonNull(GraphQLString) },
        startTime: { type: new GraphQLNonNull(GraphQLString) },
        endTime: { type: GraphQLString },
        duration: { type: GraphQLInt },
        billable: { type: GraphQLBoolean },
        tags: { type: new GraphQLList(GraphQLString) }
      },
      resolve: async (parent, args, context) => {
        const { data, error } = await context.supabase
          .from('time_entries')
          .insert({
            ...args,
            project_id: args.projectId,
            start_time: args.startTime,
            end_time: args.endTime,
            user_id: context.user.id
          })
          .select()
          .single()
        
        if (error) throw new Error(error.message)
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
          .select()
          .single()
        
        if (error) throw new Error(error.message)
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
        
        if (error) throw new Error(error.message)
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
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        errors: [{ message: 'Unauthorized' }] 
      }, { status: 401 })
    }

    // Parse GraphQL query
    const { query, variables, operationName } = await request.json()

    // Execute GraphQL query with context
    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      operationName,
      contextValue: {
        supabase,
        user
      }
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
export async function GET(request: NextRequest) {
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

