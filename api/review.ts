
/////////////////////////////// IMPORTS ///////////////////////////////

import { PrismaClient } from '@prisma/client';
import { verifyToken } from "@clerk/backend";
const prisma = new PrismaClient();


/////////////////////////////// GET ///////////////////////////////

export async function GET(request: Request) {
  try {
    
    // retrieves the authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      
      // retrieves the token
      const token = authHeader.replace("Bearer ", "");
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY || "",
      });

      // retrieves the current user id using the token
      const userId = payload.sub;
      if (userId) {

        // fetches the reviews from the DB for this user
        const reviews = await prisma.review.findMany({
          where: { userId },
        });

        // success
        return new Response(JSON.stringify(reviews), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }
    }

  // failure
  } catch (err: any) {
    console.error("GET /api/review error:", err);
  }
}


/////////////////////////////// PATCH ///////////////////////////////

export async function PATCH(request: Request) {
  try {
    
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // update details
    const updates = await request.json();
    const existingReview = await prisma.review.findUnique({
      where: { id: Number(id) },
    });

    // fails if there is no review to update
    if (!existingReview) {
      return new Response(JSON.stringify({ error: "Review not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // merges old metadata with new updates
    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        metadata: {
          ...((existingReview.metadata as Record<string, any>) ?? {}),
          ...updates,
        },
      }
    });

    // success
    return new Response(JSON.stringify(updatedReview), {
      headers: { "Content-Type": "application/json" },
    });

  // failure
  } catch (err) {
    console.log(err);
  }
}


/////////////////////////////// POST ///////////////////////////////

export async function POST(request: Request) {
  try {
    
    // retrieves the authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      
      // retrieves the token
      const token = authHeader.replace("Bearer ", "");
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY || "",
      });

      // retrieves the current user id using the token
      const userId = payload.sub;
      if (userId) {
        
        // the parameters
        const body = await request.json();
        const { movieId, movieData, metadata } = body;

        // creates the review using the formatted data
        const newReview = await prisma.review.create({
          data: { movieId, movieData, userId, metadata, },
        });
        
        // success
        return new Response(JSON.stringify(newReview), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

  // failure
  } catch (err) {
    console.log(err);
  }
}