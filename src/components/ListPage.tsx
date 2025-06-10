
/////////////////////////////// IMPORTS ///////////////////////////////

import { useEffect, useState } from "react";
import { SignedIn, useUser } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import './../index.css';
import Header from "./Header";


/////////////////////////////// PAGE ///////////////////////////////

export default function ListPage ({ params }: { params: { page: string } }) {


  /////////////////////////////// VARIABLES ///////////////////////////////

  const { user } = useUser();

  const [location, setLocation] = useLocation();

  const MIN_PAGE = 1;
  const MAX_PAGE = 10;

  type Movie = {
    title: string;
    id: number;
    year: number;
    poster: string;
  };

  type MovieDetail = {
    toWatch: boolean;
    watched: boolean;
    liked: boolean;
  };  
  
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


  /////////////////////////////// MOVIE LISTS ///////////////////////////////

  const [currPage, setCurrPage] = useState(0);
  const [currList, setCurrList] = useState<Movie[]>([]);

  // when the page is loaded in, set the requested page
  useEffect(() => {
    setCurrPage(Number(params.page));
  }, [params.page]);

  
  // when the selected page is updated, refresh the movie list
  useEffect(() => {

    // quits if invalid page
    if (!currPage || isNaN(currPage) || currPage < MIN_PAGE || currPage > MAX_PAGE) {
      return;
    }

    // otherwise, fetches the list
    try {

      // page list
      fetch(`/api/list?page=${currPage}`)
        .then(res => res.json())
        .then(data => setCurrList(data));

    // if error
    } catch (err) {
      console.error("Error loading page:", err);
    }
  }, [currPage]);


  /////////////////////////////// USER REVIEWS ///////////////////////////////

  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [movieDetails, setMovieDetails] = useState<MovieDetail[]>([]);

  // loads in reviews when the user or list of movies changes
  useEffect(() => {
    loadReviews();
  }, [user, currList])
  
  // gets the current reviews from the signed in user
  const loadReviews = async () => {
    try {

      // uses the api call with the current user's id
      const reviews = await fetch(`/api/review?userId=${user?.id}`).then(res => res.json());
      setUserReviews(reviews);

      // stores a sorted version for easy access
      setMovieDetails(
        currList.map((movie) => ({
          toWatch: reviews.find((review: any) => review?.movieId === movie.id)?.metadata?.toWatch || false,
          watched: reviews.find((review: any) => review?.movieId === movie.id)?.metadata?.watched || false,
          liked: reviews.find((review: any) => review?.movieId === movie.id)?.metadata?.liked || false,
        }))
      );
      
      return reviews;
      
    // error
    } catch (err) {
      console.error(err);
    }
  }


  /////////////////////////////// MOVIE BUTTONS ///////////////////////////////

  // to toggle one of the buttons on a movie card
  const toggleMetadata = async (index: number, key: "toWatch" | "watched" | "liked") => {

    // the calculated id of the movie
    const numId = index + (25 * (currPage - 1));
    
    // updates the button in the frontend
    setMovieDetails((prev) => {
      const updated = {...prev};
      updated[index] = {
        ...updated[index],
        [key]: !updated[index][key],
      }
      return updated;
    })
  
    // get user reviews
    const foundReview = userReviews.find((review: any) => review.movieId === numId);
  
    // if the movie has already been reviewed by the user
    if (foundReview) {

      // toggle the given metadata key
      const updatedMetadata = {
        ...foundReview.metadata,
        [key]: !foundReview.metadata[key],
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
  

    // if it has not
    } else {

      // fetch movie data (excluding id)
      let { id, ...movie } = await fetch(`/api/movie?id=${numId}`).then(res => res.json());
  
      // adds it to the backend
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          movieId: numId,
          movieData: movie,
          metadata: {
            toWatch: false,
            watched: false,
            liked: false,
            rating: 0,
            notes: "",
            collections: [],
            [key]: true,
          },
        }),
      })
      .then(res => res.json())
      .then(data => console.log('Added review:', data))
      .catch(err => console.error(err));
    }
  
    // reload reviews after the update
    const reviews = await fetch(`/api/review?userId=${user?.id}`).then(res => res.json());
    setUserReviews(reviews);
  };
  

  /////////////////////////////// HTML ///////////////////////////////
  
  return (
    <div className="flex flex-col h-min-screen w-min-screen bg-theme-charcoal">

      {/* Header */}
      <Header params={{ selected: 0 }}/>
      
      {/* List Array */}
      {currList.length > 0 
      ?
        <div className="grid grid-cols-5 p-5">
          {currList?.map((movie: any, index: number) => (
            <div key={index} className="flex flex-col px-2 py-4">

              {/* Card */}
              <div className="flex flex-col h-full w-full justify-between bg-theme-gray3 border-theme-navy2 border-2 rounded-t-lg px-2 pt-2">
                
                {/* poster */}
                <div className="hover:bg-theme-orange1 hover:rounded-t-lg">
                  <button 
                    className="hover:mix-blend-luminosity h-fit"
                    onClick={() => setLocation(`/movies/${index + (25 * (currPage - 1))}/${encodeURIComponent(location)}`)}
                  >
                    <img 
                      src={movie.poster}
                      className="rounded-t-lg border-theme-charcoal border-2 mb-[-5px]"
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="flex flex-col w-full p-2 space-y-4 h-full">

                  {/* title */}
                  <p className="flex justify-center items-center text-theme-pine text-[16px] h-full text-center font-bold">
                    {movie.title}
                  </p>

                  {/* Bottom Row */}
                  <div className="flex flex-row w-full justify-between">

                    {/* Signed In: Buttons */}
                    <SignedIn>
                      <div className="flex flex-row space-x-1">

                        {/* watch list */}
                        <button className="group" onClick={() => toggleMetadata(index, "toWatch")}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" fill={movieDetails?.[index]?.toWatch ? "var(--theme-gray1)" : "none"} 
                            viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        </button>

                        {/* watched */}
                        <button className="group" onClick={() => toggleMetadata(index, "watched")}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" fill={movieDetails?.[index]?.watched ? "var(--theme-gray1)" : "none"} 
                            viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>

                        {/* liked */}
                        <button className="group" onClick={() => toggleMetadata(index, "liked")}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                            fill={movieDetails?.[index]?.liked ? "var(--theme-gray1)" : "none"} 
                            className="size-5 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                        </button>
                      </div>
                    </SignedIn>

                    {/* year */}
                    <p className="flex-1 text-theme-orange2 text-[13px] text-right font-medium italic">
                      {`(${movie.year})`}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      : 
        // empty list
        <div className="w-screen h-screen bg-theme-charcoal"/>  
      }

      {/* Page Selection */}
      <div className="flex flex-row w-full h-[50px] items-center justify-end space-x-2 px-5 bg-zinc-900">
        
        {currPage > MIN_PAGE &&
          <button onClick={() => setCurrPage(currPage - 1)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
            </svg>
          </button>
        }

        <input
          className="text-center"
          size={2}
          value={currPage}
          onChange={(e) => setCurrPage(Number(e.target.value))}
          onBlur={() => setCurrPage(prev => prev < MIN_PAGE ? MIN_PAGE : prev > MAX_PAGE ? MAX_PAGE : prev)}
        />
        
        {currPage < MAX_PAGE &&
          <button onClick={() => setCurrPage(currPage + 1)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        }

      </div>
    </div>
  );
}