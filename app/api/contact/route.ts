import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TODO: integrate with email service / ticketing. For now, log server-side.
    console.log('[Contact] submission', {
      name: body.name,
      email: body.email,
      message: body.message,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit contact' }, { status: 500 })
  }
}
