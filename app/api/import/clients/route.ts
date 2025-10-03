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
      return NextResponse.json({ error: 'No clients to import' }, { status: 400 })
    }

    // Get existing clients to avoid duplicates
    const { data: existingClients } = await supabase
      .from('clients')
      .select('email, name')
      .eq('user_id', user.id)
      .eq('team_id', teamId)

    const existingEmails = new Set(existingClients?.map(c => c.email.toLowerCase()) || [])
    const existingNames = new Set(existingClients?.map(c => c.name.toLowerCase()) || [])

    const results = {
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    }

    const processedClients = []

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      
      try {
        // Map the data based on user's field mappings
        const mappedClient = {
          name: entry[mappings.name] || entry.name,
          email: entry[mappings.email] || entry.email,
          phone: entry[mappings.phone] || entry.phone,
          company: entry[mappings.company] || entry.company,
          address: entry[mappings.address] || entry.address,
          hourlyRate: entry[mappings.hourlyRate] || entry.hourlyRate || 15000
        }

        // Validate required fields
        if (!mappedClient.name) {
          results.errors.push(`Row ${i + 1}: Missing required field (name)`)
          results.failed++
          continue
        }

        // Generate email if not provided
        if (!mappedClient.email) {
          const emailBase = mappedClient.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
          mappedClient.email = `${emailBase}@example.com`
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(mappedClient.email)) {
          results.errors.push(`Row ${i + 1}: Invalid email format`)
          results.failed++
          continue
        }

        // Check for duplicates
        if (existingEmails.has(mappedClient.email.toLowerCase())) {
          results.errors.push(`Row ${i + 1}: Client with email "${mappedClient.email}" already exists`)
          results.skipped++
          continue
        }

        if (existingNames.has(mappedClient.name.toLowerCase())) {
          results.errors.push(`Row ${i + 1}: Client with name "${mappedClient.name}" already exists`)
          results.skipped++
          continue
        }

        // Parse hourly rate
        let hourlyRate = 15000 // Default $150/hour in cents
        if (mappedClient.hourlyRate) {
          if (typeof mappedClient.hourlyRate === 'number') {
            hourlyRate = mappedClient.hourlyRate < 1000 ? mappedClient.hourlyRate * 100 : mappedClient.hourlyRate
          } else {
            const rateStr = String(mappedClient.hourlyRate).replace(/[^\d.]/g, '')
            const rate = parseFloat(rateStr) || 150
            hourlyRate = rate < 1000 ? rate * 100 : rate // Convert to cents if needed
          }
        }

        // Create the client record
        const clientData = {
          user_id: user.id,
          team_id: teamId,
          name: mappedClient.name.trim(),
          email: mappedClient.email.toLowerCase().trim(),
          phone: mappedClient.phone?.trim() || null,
          company: mappedClient.company?.trim() || null,
          address: mappedClient.address?.trim() || null,
          hourly_rate: Math.round(hourlyRate),
          status: 'active',
          currency: 'USD'
        }

        processedClients.push(clientData)
        existingEmails.add(clientData.email)
        existingNames.add(clientData.name.toLowerCase())
        results.successful++

      } catch (error) {
        console.error(`Error processing client ${i + 1}:`, error)
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.failed++
      }
    }

    // Bulk insert the processed clients
    if (processedClients.length > 0) {
      const { error: insertError } = await supabase
        .from('clients')
        .insert(processedClients)

      if (insertError) {
        console.error('Bulk insert error:', insertError)
        return NextResponse.json({ 
          error: 'Failed to import clients', 
          details: insertError.message 
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: 'Import failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}