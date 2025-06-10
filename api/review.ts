import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


/////////////////////////////// GET ///////////////////////////////

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    // gets list of reviews
    let reviews: any;

    // filters by userId if provided
    if (userId) {
      reviews = await prisma.review.findMany({
        where: { userId },
      });
    // otherwise, returns all
    } else {
      reviews = await prisma.review.findMany();
    }
    
    // succcess
    return new Response(JSON.stringify(reviews), {
      headers: { "Content-Type": "application/json" },
    });

  // failure
  } catch (err) {
    console.log(err);
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
    const body = await request.json();
    const { userId, movieId, movieData, metadata } = body;

    // creates the review using the formatted data
    const newReview = await prisma.review.create({
      data: { movieId, movieData, userId, metadata, },
    });

    // success
    return new Response(JSON.stringify(newReview), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  // failure
  } catch (err) {
    console.log(err);
  }
}