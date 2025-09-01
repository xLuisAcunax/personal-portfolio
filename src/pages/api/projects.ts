import type { APIRoute } from 'astro';
import { prisma } from '../../lib/db';
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  techStack: z.array(z.string()),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
  isPublic: z.boolean().default(false),
  userId: z.string().min(1, 'User ID is required'),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = projectSchema.parse(body);
    
    // Create the project
    const project = await prisma.userProject.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        techStack: JSON.stringify(validatedData.techStack),
        status: validatedData.status,
        isPublic: validatedData.isPublic,
        userId: validatedData.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Log analytics event
    await prisma.analytics.create({
      data: {
        event: 'project_created',
        data: JSON.stringify({ 
          projectId: project.id, 
          userId: project.userId,
          title: project.title 
        }),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Project created successfully',
        data: {
          ...project,
          techStack: JSON.parse(project.techStack)
        }
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Project creation error:', error);
    
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
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') === 'true';
    const status = searchParams.get('status');
    
    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Get projects
    const projects = await prisma.userProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Transform the data
    const transformedProjects = projects.map(project => ({
      ...project,
      techStack: JSON.parse(project.techStack)
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedProjects
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Projects GET error:', error);
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