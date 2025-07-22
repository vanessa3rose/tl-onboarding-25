
/////////////////////////////// IMPORTS ///////////////////////////////

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import './../index.css';
import Header from "./Header";


/////////////////////////////// PAGE ///////////////////////////////

export default function ReviewsPage () {


  /////////////////////////////// VARIABLES ///////////////////////////////

  const { user } = useUser();
  const { getToken } = useAuth();

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

  // loads in the list of reviews by the current user
  const loadReviews = async () => {
    try {

      // gets the current token
      const token = await getToken();

      // uses it to retrieve the user's reviews
      const res = await fetch("/api/review", {
        headers: { Authorization: `Bearer ${token}`, },
      });
      
      const reviews = await res.json();
      setUserReviews(reviews);
      
    // error
    } catch (err) {
      console.error(err);
    }
  }

  // fetches the current movie review when the movie data loads in
  useEffect(() => {
    loadReviews();
  }, [user])


  /////////////////////////////// BUTTONS ///////////////////////////////

  const [typeOption, setTypeOption] = useState<"toWatch" | "watched" | "liked">("toWatch");
  const [ratedOption, setRatedOption] = useState<number>(1);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const [showRatingId, setShowRatingId] = useState<string>("");
  const [hoveredShowRating, setHoveredShowRating] = useState<number>(0);

  const [showNotesId, setShowNotesId] = useState<string>("");
  const [currNotes, setCurrNotes] = useState<string>("");
  
  // when a button is clicked to modify a review (remove/change attribute of metadata)
  const modMetadata = async (movie: Review, attribute: string, modValue: any) => {
  
    // get user reviews
    const foundIndex = userReviews.findIndex((review: any) => review.movieId === movie.movieId);
    const foundReview = userReviews[foundIndex];
    
    // updates the display in the frontend
    setUserReviews((prev) => {
      const updated = [...prev];
      updated[foundIndex].metadata = {
        ...updated[foundIndex].metadata,
        [attribute]: modValue,
      }
      return updated;
    })
  
    // if the movie has already been reviewed by the user
    if (foundReview) {

      // toggle the given metadata key
      const updatedMetadata = {
        ...foundReview.metadata,
        [attribute]: modValue,
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

    // resets state variables
    setShowRatingId("");
    setHoveredShowRating(0);
    setShowNotesId("");
  }


  /////////////////////////////// HTML ///////////////////////////////

  return (
    <div className="flex flex-col w-full h-screen overflow-y-scroll bg-theme-charcoal">

      {/* Header */}
      <Header params={{ selected: 1 }}/>
      
      
      {/* Type List */}
      <div className="flex flex-col p-5 border border-double border-b-4 border-theme-navy2">

        {/* Header */}
        <div className="flex flex-row pt-10 pb-2 space-x-4 justify-center items-center">

          {/* To Watch Button */}
          <button className={`flex flex-row justify-center items-center space-x-1 px-2 py-1 rounded-xl hover:bg-theme-orange1 ${typeOption === "toWatch" && "bg-theme-pine border-2 border-theme-navy1"}`} onClick={() => setTypeOption("toWatch")}>
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-gray2)" fill="none" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {/* text */}
            <p className="text-center text-[20px] font-semibold text-theme-gray2">
              TO WATCH
            </p>
          </button>
          
          {/* Watched Button */}
          <button className={`flex flex-row justify-center items-center space-x-1 px-2 py-1 rounded-xl hover:bg-theme-orange1 ${typeOption === "watched" && "bg-theme-pine border-2 border-theme-navy1"}`} onClick={() => setTypeOption("watched")}>
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-gray2)" fill="none" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            {/* text */}
            <p className="text-center text-[20px] font-semibold text-theme-gray2">
              WATCHED
            </p>
          </button>
          
          {/* Liked Button */}
          <button className={`group flex flex-row justify-center items-center space-x-1 px-2 py-1 rounded-xl hover:bg-theme-orange1 ${typeOption === "liked" && "bg-theme-pine border-2 border-theme-navy1"}`} onClick={() => setTypeOption("liked")}>
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-gray2)" fill="none" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            {/* text */}
            <p className="text-center text-[20px] font-semibold text-theme-gray2 hover:text-theme-white">
              LIKED
            </p>
          </button>
        </div>

        {/* List */}
        {userReviews.length > 0 
        ? (
          <div className="flex w-full overflow-x-scroll bg-charcoal">
            {userReviews?.filter(movie => movie.metadata[typeOption])?.map((movie: any, index: number) => (
              <div key={index} className="flex flex-col px-2 py-4">
  
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
                    onClick={() => modMetadata(movie, typeOption, false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--theme-pine)" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
  
              </div>
            ))}
          </div>
        ) : ( 
          // empty list
          <div className="w-full py-10 justify-center items center">
            <p className="text-center text-[20px] text-theme-gray2 font-medium italic">
              NO MOVIES MATCH THE CURRENT SELECTION
            </p>
          </div> 
        )}
      </div>

      {/* Rating List */}
      <div className="flex flex-col p-5 border border-double border-b-4 border-theme-navy2">

        {/* Star Buttons */}
        <div className="group flex flex-row pt-10 pb-2 justify-center items-center">
          {Array(5).fill("").map((_, index: number) => (
            <button 
              key={index} className="group" onClick={() => setRatedOption(index + 1)} 
              onMouseEnter={() => setHoveredRating(index + 1)} onMouseLeave={() => setHoveredRating(0)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                strokeWidth={index < hoveredRating ? 2 : 1.5} stroke="var(--theme-gray2)" 
                fill={(hoveredRating !== 0 && index < hoveredRating) ? "var(--theme-orange1)" : index < ratedOption ? "var(--theme-pine" : "none"} 
                className={`size-8 ${index < hoveredRating && "drop-shadow-md stroke-theme-navy2"}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </button>
          ))}
        </div>

        {/* List */}
        {userReviews?.filter(movie => movie.metadata.rating === ratedOption)?.length > 0
        ? (
          <div className="flex w-full overflow-x-scroll bg-charcoal">
            {userReviews?.filter(movie => movie.metadata.rating === ratedOption)?.map((movie: any, index: number) => (
              <div key={index} className="flex flex-col px-2 py-4">

                {/* Card */}
                <div className="flex flex-col h-full w-[200px] justify-between bg-theme-gray3 border-theme-navy2 border-2 rounded-lg p-2">
                  
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

                  {/* change button */}
                  {showRatingId === movie.movieId 
                  ? (
                    // if current viewing index
                    <div className="flex flex-row space-x-4 justify-center items-center pt-[5px] mb-[-1px]">

                      {/* back button */}
                      <button className="pt-0.5" onClick={() => setShowRatingId("")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-navy1)" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                        </svg>
                      </button>

                      {/* stars */}
                      <div className="group flex flex-row justify-center items-center">
                        {Array(5).fill("").map((_, index: number) => (
                          <button 
                            key={index} className="group" onClick={() => modMetadata(movie, "rating", index + 1)} 
                            onMouseEnter={() => setHoveredShowRating(index + 1)} onMouseLeave={() => setHoveredShowRating(0)}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                              strokeWidth={2} stroke={index < ratedOption ? "var(--theme-pine)" : "var(--theme-charcoal)"}
                              fill={(hoveredShowRating !== 0 && index < hoveredShowRating) ? "var(--theme-orange1)" : index < ratedOption ? "var(--theme-gray1)" : "none"} 
                              className={`size-[18px] ${index < hoveredShowRating && "drop-shadow-md stroke-theme-navy2"}`}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                          </button>
                        ))}
                      </div>

                      {/* remove button */}
                      <button className="pt-0.5" onClick={() => modMetadata(movie, "rating", 0)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--theme-navy2)" className="size-[18px]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // if unviewed index
                    <button 
                      className="flex justify-center items-center pt-1 mb-[-4px]" 
                      onClick={() => setShowRatingId(movie.movieId)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--theme-pine)" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          // empty list
          <div className="w-full py-10 justify-center items center">
            <p className="text-center text-[20px] text-theme-gray2 font-medium italic">
              NO MOVIES MATCH THE CURRENT RATING
            </p>
          </div>  
        )}
      </div>

      {/* Notes List */}
      <div className="flex flex-col p-5">

        {/* Header */}
        <div className="flex flex-row pt-10 pb-2 space-x-4 justify-center items-center">
          <button className="flex flex-row justify-center items-center space-x-1 px-2 py-1 rounded-xl bg-theme-pine border-2 border-theme-navy1">
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-gray2)" fill="none" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            {/* text */}
            <p className="text-center text-[20px] font-semibold text-theme-gray2">
              NOTES
            </p>
          </button>
        </div>

        {/* List */}
        {userReviews?.filter(movie => movie.metadata.notes !== "")?.length > 0
        ? (
          <div className="flex w-full overflow-x-scroll bg-charcoal">
            {userReviews?.filter(movie => movie.metadata.notes !== "")?.map((movie: any, index: number) => (
              <div key={index} className="flex flex-col px-2 py-4">

                {/* Card */}
                <div className="flex flex-col h-full w-[200px] justify-between bg-theme-gray3 border-theme-navy2 border-2 rounded-lg p-2">
                  
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

                  {/* notes */}
                  <div className="flex mt-2 mx-2">
                    {showNotesId === movie.movieId 
                    ? (
                      // if current editing index
                      <textarea
                        className="flex flex-wrap py-1 px-2 text-left text-[13px] border-4 border-theme-gray1 bg-theme-gray2 w-full h-full"
                        value={currNotes}
                        onChange={(e) => setCurrNotes(e.target.value)}
                      />
                    ) : (
                      // if unedited index
                      <p className="break-words w-full text-[12px] font-medium italic text-theme-navy2">
                        {movie.metadata.notes}
                      </p>
                    )}
                  </div>

                  {/* change button */}
                  {showNotesId === movie.movieId 
                  ? ( 
                    // if current editing index
                    <div className="flex flex-row space-x-4 justify-center items-center pt-[5px] mb-[-1px]">

                      {/* back button */}
                      <button className="pt-0.5" onClick={() => setShowNotesId("")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-navy1)" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                        </svg>
                      </button>

                      {/* submit button */}
                      <button className="pt-0.5" onClick={() => modMetadata(movie, "notes", currNotes)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--theme-navy2)" className="size-[18px]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </button>

                      {/* delete button */}
                      <button className="pt-0.5" onClick={() => modMetadata(movie, "notes", "")}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--theme-navy2)" className="size-[18px]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // if unedited index
                    <button 
                      className="flex justify-center items-center pt-1 mb-[-4px]" 
                      onClick={() => {setShowNotesId(movie.movieId); setCurrNotes(movie.metadata.notes);}}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="var(--theme-pine)" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          // empty list
          <div className="w-full py-10 justify-center items center">
            <p className="text-center text-[20px] text-theme-gray2 font-medium italic">
              NO MOVIES CURRENTLY HAVE NOTES
            </p>
          </div>  
        )}
      </div>
    </div>
  );
}