import type { APIRoute } from 'astro';
import { prisma } from '../../lib/db';
import { z } from 'zod';

const analyticsSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  data: z.record(z.any()).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = analyticsSchema.parse(body);
    
    // Save analytics event
    await prisma.analytics.create({
      data: {
        event: validatedData.event,
        data: validatedData.data ? JSON.stringify(validatedData.data) : null,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event logged successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Validation error',
          errors: error.errors 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const event = searchParams.get('event');
    
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);
    
    // Build where clause
    const where: any = {
      createdAt: { gte: dateFilter }
    };
    
    if (event) {
      where.event = event;
    }
    
    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        event: true,
        data: true,
        createdAt: true,
      }
    });
    
    // Get event counts
    const eventCounts = await prisma.analytics.groupBy({
      by: ['event'],
      where,
      _count: { event: true },
      orderBy: { _count: { event: 'desc' } }
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          events: analytics,
          counts: eventCounts,
          period: `${days} days`
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Analytics GET error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};