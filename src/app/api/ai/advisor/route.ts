import { NextRequest, NextResponse } from 'next/server';
import { runEcoCampusAdvisor } from '@/server/services/aiAdvisorService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, history } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const result = await runEcoCampusAdvisor(query.trim(), Array.isArray(history) ? history : []);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      toolsUsed: result.toolsUsed,
      suggestedActions: result.suggestedActions || [],
    });
  } catch (error: any) {
    console.error('Error in AI Advisor API:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to process AI query',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Quick automated insights query for dashboard banners
    const result = await runEcoCampusAdvisor(
      'Provide a 3-bullet executive sustainability status summary for the university dashboard with current alerts.'
    );

    return NextResponse.json({
      success: true,
      summary: result.answer,
      toolsUsed: result.toolsUsed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to generate insights' }, { status: 500 });
  }
}
