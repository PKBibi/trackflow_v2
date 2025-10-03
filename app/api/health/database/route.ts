import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Test basic connectivity
    const startTime = Date.now();
    const { data: connectTest, error: connectError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (connectError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: connectError.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test write operation (safe test)
    const { error: writeError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user
        action: 'health_check',
        resource_type: 'system',
        resource_id: 'database',
        metadata: { response_time: responseTime }
      });

    // Clean up test log entry
    if (!writeError) {
      await supabase
        .from('activity_logs')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .eq('action', 'health_check');
    }

    // Check database statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_database_stats');

    const healthData = {
      status: 'healthy',
      database: {
        connected: true,
        response_time_ms: responseTime,
        write_test: !writeError,
        stats: stats || null
      },
      timestamp: new Date().toISOString()
    };

    // Determine overall health
    if (responseTime > 5000) {
      healthData.status = 'warning';
    }

    if (writeError) {
      healthData.status = 'warning';
    }

    return NextResponse.json(healthData);

  } catch (error) {
    console.error('Database health check failed:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Create database stats function if it doesn't exist
export async function POST() {
  try {
    const supabase = await createClient();

    // Create the database stats function
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_database_stats()
        RETURNS JSON AS $$
        DECLARE
          result JSON;
        BEGIN
          SELECT json_build_object(
            'table_stats', (
              SELECT json_agg(
                json_build_object(
                  'table_name', schemaname || '.' || tablename,
                  'row_count', n_live_tup,
                  'size', pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
                )
              )
              FROM pg_stat_user_tables
              WHERE schemaname = 'public'
              LIMIT 10
            ),
            'connection_count', (
              SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()
            ),
            'database_size', (
              SELECT pg_size_pretty(pg_database_size(current_database()))
            )
          ) INTO result;

          RETURN result;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (error) {
      return NextResponse.json({
        error: 'Failed to create database stats function',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database stats function created successfully'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to set up database monitoring',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}