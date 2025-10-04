import { log } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveTeam } from '@/lib/auth/team'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const teamContext = await getActiveTeam(request)
    if (!teamContext.ok) return teamContext.response
    const { teamId } = teamContext

    const body = await request.json()
    const { entries, mappings } = body

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: 'No entries to import' }, { status: 400 })
    }

    // Get user's clients and projects for validation and auto-creation
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('user_id', user.id)
      .eq('team_id', teamId)

    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, name, client_id')
      .eq('user_id', user.id)
      .eq('team_id', teamId)

    const clientMap = new Map(existingClients?.map(c => [c.name.toLowerCase(), c]) || [])
    const projectMap = new Map(existingProjects?.map(p => [p.name.toLowerCase(), p]) || [])

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
      clientsCreated: 0,
      projectsCreated: 0
    }

    const processedEntries = []

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      
      try {
        // Map the data based on user's field mappings
        const mappedEntry = {
          date: entry[mappings.date] || entry.date,
          startTime: entry[mappings.startTime] || entry.startTime,
          endTime: entry[mappings.endTime] || entry.endTime,
          duration: entry[mappings.duration] || entry.duration,
          activity: entry[mappings.activity] || entry.activity,
          description: entry[mappings.description] || entry.description,
          client: entry[mappings.client] || entry.client,
          project: entry[mappings.project] || entry.project,
          category: entry[mappings.category] || entry.category || 'Content',
          billable: entry[mappings.billable] !== undefined ? 
            (entry[mappings.billable] === 'true' || entry[mappings.billable] === true) : true,
          rate: entry[mappings.rate] || entry.rate || 15000 // $150/hour default
        }

        // Validate required fields
        if (!mappedEntry.date || !mappedEntry.activity) {
          results.errors.push(`Row ${i + 1}: Missing required fields (date, activity)`)
          results.failed++
          continue
        }

        // Parse duration if provided as string
        let durationMinutes = 0
        if (mappedEntry.duration) {
          if (typeof mappedEntry.duration === 'number') {
            durationMinutes = mappedEntry.duration
          } else {
            // Try to parse duration from string (e.g., "2:30", "150", "2.5h")
            const durationStr = String(mappedEntry.duration).trim()
            if (durationStr.includes(':')) {
              const [hours, minutes] = durationStr.split(':').map(Number)
              durationMinutes = (hours * 60) + minutes
            } else if (durationStr.toLowerCase().includes('h')) {
              const hours = parseFloat(durationStr.replace(/[^\d.]/g, ''))
              durationMinutes = Math.round(hours * 60)
            } else {
              durationMinutes = parseInt(durationStr) || 0
            }
          }
        }

        // Calculate duration from start/end times if not provided
        if (!durationMinutes && mappedEntry.startTime && mappedEntry.endTime) {
          const start = new Date(`${mappedEntry.date}T${mappedEntry.startTime}`)
          const end = new Date(`${mappedEntry.date}T${mappedEntry.endTime}`)
          durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
        }

        if (!durationMinutes || durationMinutes <= 0) {
          results.errors.push(`Row ${i + 1}: Invalid or missing duration`)
          results.failed++
          continue
        }

        // Handle client creation/lookup
        let clientId = null
        if (mappedEntry.client) {
          const clientName = mappedEntry.client.trim()
          const existingClient = clientMap.get(clientName.toLowerCase())
          
          if (existingClient) {
            clientId = existingClient.id
          } else {
            // Create new client
            const { data: newClient, error: clientError } = await supabase
              .from('clients')
              .insert({
                user_id: user.id,
                team_id: teamId,
                name: clientName,
                email: `${clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                status: 'active'
              })
              .select()
              .single()

            if (clientError) {
              results.errors.push(`Row ${i + 1}: Failed to create client "${clientName}"`)
              results.failed++
              continue
            }

            clientId = newClient.id
            clientMap.set(clientName.toLowerCase(), newClient)
            results.clientsCreated++
          }
        }

        // Handle project creation/lookup
        let projectId = null
        if (mappedEntry.project && clientId) {
          const projectName = mappedEntry.project.trim()
          const existingProject = projectMap.get(projectName.toLowerCase())
          
          if (existingProject && existingProject.client_id === clientId) {
            projectId = existingProject.id
          } else {
            // Create new project
            const { data: newProject, error: projectError } = await supabase
              .from('projects')
              .insert({
                user_id: user.id,
                team_id: teamId,
                client_id: clientId,
                name: projectName,
                status: 'active'
              })
              .select()
              .single()

            if (projectError) {
              results.errors.push(`Row ${i + 1}: Failed to create project "${projectName}"`)
              results.failed++
              continue
            }

            projectId = newProject.id
            projectMap.set(projectName.toLowerCase(), newProject)
            results.projectsCreated++
          }
        }

        // Create the time entry
        const startTime = mappedEntry.startTime ? 
          `${mappedEntry.date}T${mappedEntry.startTime}:00.000Z` : 
          `${mappedEntry.date}T09:00:00.000Z`

        const endTime = mappedEntry.endTime ? 
          `${mappedEntry.date}T${mappedEntry.endTime}:00.000Z` :
          new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString()

        const timeEntry = {
          user_id: user.id,
          team_id: teamId,
          client_id: clientId,
          project_id: projectId,
          start_time: startTime,
          end_time: endTime,
          duration: durationMinutes,
          marketing_category: mappedEntry.category,
          marketing_channel: 'Content', // Default channel
          task_title: mappedEntry.activity,
          task_description: mappedEntry.description || '',
          billable: mappedEntry.billable,
          hourly_rate: parseInt(String(mappedEntry.rate)) || 15000,
          amount: Math.round((parseInt(String(mappedEntry.rate)) || 15000) * durationMinutes / 60),
          status: 'stopped'
        }

        processedEntries.push(timeEntry)
        results.successful++

      } catch (error) {
        log.error(`Error processing entry ${i + 1}:`, error)
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.failed++
      }
    }

    // Bulk insert the processed entries
    if (processedEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('time_entries')
        .insert(processedEntries)

      if (insertError) {
        log.error('Bulk insert error:', insertError)
        return NextResponse.json({ 
          error: 'Failed to import entries', 
          details: insertError.message 
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    log.error('Import error:', error)
    return NextResponse.json({ 
      error: 'Import failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}