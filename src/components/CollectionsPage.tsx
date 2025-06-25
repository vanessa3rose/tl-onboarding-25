
/////////////////////////////// IMPORTS ///////////////////////////////

import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import './../index.css';
import Header from "./Header";


/////////////////////////////// PAGE ///////////////////////////////

export default function CollectionsPage () {


  /////////////////////////////// VARIABLES ///////////////////////////////

  const { user } = useUser();

  const [location, setLocation] = useLocation();
  
  interface MovieData {
    title: string;
    description: string;
    year: number;
    poster: string;
  }
  
  interface Metadata {
    toWatch: boolean;
    watched: boolean;
    liked: boolean;
    rating: number;
    notes: string;
    collections: string[];
  }
  
  interface Review {
    id: number;
    createdAt: string;
    userId: string;
    movieId: number;
    movieData: MovieData;
    metadata: Metadata;
  }
  

  /////////////////////////////// REVIEW DATA ///////////////////////////////

  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userCollections, setUserCollections] = useState<string[]>([]);

  // loads in the list of reviews by the current user
  const loadReviews = async () => {
    const reviews = await fetch(`/api/review?userId=${user?.id}`).then(res => res.json());
    setUserReviews(reviews);
    
    // retrieves the unique list of collections from all movies
    let collections: string[] = [];
    reviews.forEach((review: any) => {
      review.metadata.collections.forEach((collection: string) => {
        if (collections.indexOf(collection) === -1) {
          collections.push(collection); 
        }
      })
    });

    // alphabetizes and sets the list
    setUserCollections(collections.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
  }

  // fetches the current movie review when the movie data loads in
  useEffect(() => {
    loadReviews();
  }, [user])


  /////////////////////////////// BUTTONS ///////////////////////////////
  
  // when a button is clicked to modify a review (remove attribute of metadata)
  const modMetadata = async (movie: Review, collection: string) => {
  
    // get user reviews
    const foundIndex = userReviews.findIndex((review: any) => review.movieId === movie.movieId);
    const foundReview = userReviews[foundIndex];
    
    // updates the display in the frontend
    setUserReviews((prev) => {
      const updated = [...prev];
      updated[foundIndex].metadata = {
        ...updated[foundIndex].metadata,
        ["collections"]: updated[foundIndex].metadata.collections.filter(currCollection => currCollection !== collection),
      }
      return updated;
    })
  
    // if the movie has already been reviewed by the user
    if (foundReview) {

      // toggle the given metadata key
      const updatedMetadata = {
        ...foundReview.metadata,
        ["collections"]: foundReview.metadata.collections.filter(currCollection => currCollection !== collection),
      };
  
      // updates it in the backend
      await fetch(`/api/review?id=${foundReview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMetadata),
      })
      .then(res => res.json())
      .then(data => console.log('Updated movie:', data))
      .catch(err => console.error(err));
    }

    // reloads to refetch collections
    loadReviews();
  }


  /////////////////////////////// HTML ///////////////////////////////

  return (
    <div className="flex flex-col w-full h-screen overflow-y-scroll bg-theme-charcoal">

      {/* Header */}
      <Header params={{ selected: 2 }}/>
      
      
      {/* Map of Collection Lists */}
      {userCollections.map((collection: string, index: number) => (
        <div key={index} className="flex flex-col p-5 border border-double border-b-4 border-theme-navy2">

          {/* Header - Collection Name */}
          <div className="flex justify-center items-center pt-10 pb-2">
            <p className="px-2 py-1 rounded-xl bg-theme-pine border-2 border-theme-navy1 text-center text-[20px] font-semibold text-theme-gray2">
              {collection}
            </p>
          </div>

          {/* List */}
          <div className="flex w-full overflow-x-scroll bg-charcoal">
            {userReviews?.filter(movie => movie.metadata.collections.includes(collection))?.map((movie: any, idx: number) => (
              <div key={idx} className="flex flex-col px-2 py-4">
  
                {/* Card */}
                <div className="flex flex-col w-[200px] justify-between bg-theme-gray3 border-theme-navy2 border-2 rounded-lg p-2">
                  
                  {/* poster */}
                  <div className="hover:bg-theme-orange1 hover:rounded-lg">
                    <button 
                      className="hover:mix-blend-luminosity h-fit"
                      onClick={() => setLocation(`/movies/${movie.movieId}/${encodeURIComponent(location)}`)}
                    >
                      <img 
                        src={movie.movieData.poster}
                        className="rounded-lg border-theme-charcoal border-2 mb-[-5px]"
                      />
                    </button>
                  </div>

                  {/* remove button */}
                  <button 
                    className="flex justify-center items-center pt-1 mb-[-4px]" 
                    onClick={() => modMetadata(movie, collection)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--theme-pine)" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
  
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}