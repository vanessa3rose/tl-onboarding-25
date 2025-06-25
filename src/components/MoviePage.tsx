
/////////////////////////////// IMPORTS ///////////////////////////////

import { useEffect, useState } from "react";
import { SignedIn, useUser } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import './../index.css';
import Header from "./Header";


/////////////////////////////// PAGE ///////////////////////////////

export default function MoviePage ({ params }: { params: { id: string; prev: string } }) {


  /////////////////////////////// VARIABLES ///////////////////////////////

  const { user } = useUser();

  const [_, setLocation] = useLocation();

  type Movie = {
    title: string;
    description: string;
    id: number;
    year: number;
    poster: string;
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

  const [currId, setCurrId] = useState(0);
  const [currMovie, setCurrMovie] = useState<Movie>({ title: "", description: "", id: 0, year: 0, poster: "" });

  // when the page is loaded in, set the requested page
  useEffect(() => {
    setCurrId(Number(params.id));
  }, [params.id]);

  
  // when the selected page is updated, refresh the list that is displayed
  useEffect(() => {

    // quits if invalid page
    if (!currId || isNaN(currId)) return;

    // otherwise, fetches the list
    try {
      fetch(`/api/movie?id=${currId}`)
        .then(res => res.json())
        .then(data => setCurrMovie(data));

    // error
    } catch (e) {
      console.error("Error loading id:", e);
    }
  }, [currId]);
  

  /////////////////////////////// REVIEW DATA ///////////////////////////////

  const [reviewData, setReviewData] = useState<Metadata>({ toWatch: false, watched: false, liked: false, rating: 0, notes: "", collections: []});
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  const loadReview = async () => {
    const reviews = await fetch(`/api/review?userId=${user?.id}`)
      .then(res => res.json())

    setUserReviews(reviews);
    setReviewData(reviews.find((review: any) => review.movieId === currId)?.metadata);
  }

  // fetches the current movie review when the movie data loads in
  useEffect(() => {
    loadReview();
  }, [currMovie])


  /////////////////////////////// METADATA BUTTONS ///////////////////////////////

  // to toggle one of the first 3 buttons on the movie card
  const toggleMetadataButton = async (key: "toWatch" | "watched" | "liked") => {
    
    // updates the button in the frontend
    setReviewData((prev) => {
      const updated = {...prev};
      updated[key] = !updated[key]
      return updated;
    })
  
    // get user reviews
    const foundReview = userReviews.find((review: any) => review.movieId === currId);
  
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
      let { id, ...movie } = await fetch(`/api/movie?id=${currId}`).then(res => res.json());
  
      // adds it to the backend
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          movieId: currId,
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

  // star hovering
  const [hoveredRating, setHoveredRating] = useState(0);

  // to toggle the rating on a movie card
  const toggleMetadataRating = async (starIndex: number) => {
    
    // updates the button in the frontend
    setReviewData((prev) => {
      const updated = {...prev};
      updated["rating"] = starIndex;
      return updated;
    })
  
    // get user reviews
    const foundReview = userReviews.find((review: any) => review.movieId === currId);
  
    // if the movie has already been reviewed by the user
    if (foundReview) {

      // toggle the given metadata key
      const updatedMetadata = {
        ...foundReview.metadata,
        ["rating"]: starIndex,
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
      let { id, ...movie } = await fetch(`/api/movie?id=${currId}`).then(res => res.json());
  
      // adds it to the backend
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          movieId: currId,
          movieData: movie,
          metadata: {
            toWatch: false,
            watched: false,
            liked: false,
            rating: starIndex,
            notes: "",
            collections: [],
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


  /////////////////////////////// NOTES ///////////////////////////////

  const [showNotes, setShowNotes] = useState(false);
  const [currNotes, setCurrNotes] = useState("");

  // when the check button is clicked
  const submitNotes = () => {
    updateMetadataNotes(currNotes);   // api call
    setShowNotes(false);           // closes section
  }

  // when the x button is clicked
  const clearNotes = () => {
    setCurrNotes("");           // updates the state
    updateMetadataNotes("");    // api call
  }

  // to update the notes on a movie card
  const updateMetadataNotes = async (notes: string) => {
    
    // updates the button in the frontend
    setReviewData((prev) => {
      const updated = {...prev};
      updated["notes"] = notes;
      return updated;
    })
  
    // get user reviews
    const foundReview = userReviews.find((review: any) => review.movieId === currId);
  
    // if the movie has already been reviewed by the user
    if (foundReview) {

      // toggle the given metadata key
      const updatedMetadata = {
        ...foundReview.metadata,
        ["notes"]: notes,
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
      let { id, ...movie } = await fetch(`/api/movie?id=${currId}`).then(res => res.json());
  
      // adds it to the backend
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          movieId: currId,
          movieData: movie,
          metadata: {
            toWatch: false,
            watched: false,
            liked: false,
            rating: 0,
            notes: notes,
            collections: [],
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


  /////////////////////////////// COLLECTIONS ///////////////////////////////

  const [showCollections, setShowCollections] = useState(false);
  
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollection, setNewCollection] = useState<string>("");

  // when the check button is clicked
  const addCollection = () => {
    updateMetadataCollections(newCollection);   // api call
    setNewCollection("");                       // clears name
    setShowNewCollection(false);                // closes section
  }

  // when the delete button is clicked on a specific collection
  const removeCollection = (collection: string) => {
    updateMetadataCollections(collection);   // api call
  }

  // to update the collections on a movie card
  const updateMetadataCollections = async (collection: string) => {

    // determines whether the current collection is included (for adding/removing)
    const isIncluded = reviewData.collections.indexOf(collection) !== -1;
    
    // updates the button in the frontend
    setReviewData((prev) => {
      const updated = {...prev};
      updated["collections"] = 
        isIncluded 
          ? [...prev.collections].filter(currCollection => currCollection !== collection)
          : [...prev.collections, collection].sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      return updated;
    })
  
    // get user reviews
    const foundReview = userReviews.find((review: any) => review.movieId === currId);
  
    // if the movie has already been reviewed by the user
    if (foundReview) {

      // toggle the given metadata key
      const updatedMetadata = {
        ...foundReview.metadata,
        ["collections"]: 
          isIncluded 
            ? [...foundReview.metadata.collections].filter(currCollection => currCollection !== collection)
            : [...foundReview.metadata.collections, collection].sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase())),
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
      let { id, ...movie } = await fetch(`/api/movie?id=${currId}`).then(res => res.json());
  
      // adds it to the backend
      await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          movieId: currId,
          movieData: movie,
          metadata: {
            toWatch: false,
            watched: false,
            liked: false,
            rating: 0,
            notes: "",
            collections: [collection],
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
    <div className="flex flex-col w-screen h-screen bg-theme-charcoal">

      {/* Header */}
      <Header params={{ selected: 0 }}/>

      <div>
        {/* Back to List Button */}
        <button className="absolute mt-5 right-5" onClick={() => setLocation(decodeURIComponent(params.prev))}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
          </svg>
        </button>

        {/* Movie Details */}
        {currMovie?.title !== "" &&
        <div className="flex flex-row w-full h-full justify-center items-center p-10 space-x-10">
          
          {/* LEFT HAND SIDE */}
          <div className="w-1/3 h-auto justify-center items-center">
            {/* Poster */}
            <img 
              src={currMovie.poster}
              className="rounded-lg border-theme-mint border-4"
            />
          </div>

          {/* RIGHT HAND SIDE */}
          <div className="flex flex-col w-1/2 h-full justify-center items-center space-y-2">

            {/* Details */}
            <div className="flex flex-col w-full h-1/2 py-2 px-10 justify-around items-center bg-theme-gray2 border-4 border-theme-navy2">

              {/* title */}
              <p className="text-theme-pine text-[24px] text-center font-bold underline">
                {currMovie.title}
              </p>

              {/* description */}
              <p className="text-theme-navy2 text-[16px] text-center">
                {currMovie.description}
              </p>

              {/* year */}
              <p className="text-theme-orange1 text-[18px] text-right italic">
                {currMovie.year}
              </p>
            </div>

            {/* Buttons */}
            <SignedIn>
              <div className="flex flex-col w-full bg-theme-gray3 border-4 border-theme-navy2">

                <div className="flex w-full h-[50px] flex-row justify-center items-center px-5">
                  {/* LEFT */}
                  <div className="flex flex-row w-1/3 justify-start items-center space-x-1">
                    {/* watch list */}
                    <button className="group" onClick={() => toggleMetadataButton("toWatch")}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        fill={reviewData?.toWatch ? "var(--theme-gray1)" : "none"} 
                        className="size-6 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </button>

                    {/* watched */}
                    <button className="group" onClick={() => toggleMetadataButton("watched")}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        fill={reviewData?.watched ? "var(--theme-gray1)" : "none"} 
                        className="size-6 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>

                    {/* liked */}
                    <button className="group" onClick={() => toggleMetadataButton("liked")}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        fill={reviewData?.liked ? "var(--theme-gray1)" : "none"} 
                        className="size-6 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </button>
                  </div>

                  {/* MIDDLE */}
                  <div className="group flex flex-row w-1/3 justify-center items-center">
                    {/* rating */}
                    {Array(5).fill("").map((_, index) => (
                      <button 
                        key={index} className="group" onClick={() => toggleMetadataRating(index + 1)} 
                        onMouseEnter={() => setHoveredRating(index + 1)} onMouseLeave={() => setHoveredRating(0)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                          strokeWidth={index < hoveredRating ? 2 : 1.5} stroke="currentColor" 
                          fill={index < (hoveredRating !== 0 ? hoveredRating : (reviewData?.rating || 0)) ? "var(--theme-gray1)" : "none"} 
                          className={`size-6 ${index < hoveredRating && "drop-shadow-md stroke-theme-pine"}`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-row w-1/3 justify-end items-center space-x-2">
                    {/* notes */}
                    <button className="group" onClick={() => {setShowNotes(!showNotes); setShowCollections(false);}}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} 
                        stroke={showNotes ? "var(--theme-orange2)" : "currentColor"}
                        fill={reviewData?.notes !== "" ? "var(--theme-gray1)" : "none"} 
                        className="size-6 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>

                    {/* collections */}
                    <button className="group" onClick={() => {setShowCollections(!showCollections); setShowNotes(false);}}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} 
                        stroke={showCollections ? "var(--theme-orange2)" : "currentColor"} fill="none"
                        className={`size-6 group-hover:stroke-theme-orange2 group-hover:stroke-[2px] group-hover:drop-shadow-lg ${(reviewData?.collections?.length || 0) > 0 && "bg-theme-gray2 rounded-sm"}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Editing Notes Section */}
                {showNotes &&
                  <div className="flex flex-col mt-2 mb-5 mx-5 space-y-5 justify-center items-center">
                    <div className="w-full h-[1.5px] bg-theme-orange2"/>

                    <div className="flex flex-row w-[95%] bg-theme-gray1 rounded-r-lg justify-between items-center">
                      {/* text input */}
                      <textarea
                        className="flex flex-wrap py-1 px-2 text-left text-[13px] border-4 border-theme-gray1 bg-theme-gray2 w-full h-full"
                        value={currNotes}
                        onChange={(e) => setCurrNotes(e.target.value)}
                      />

                      {/* buttons */}
                      <div className="flex flex-col p-1">
                        {/* submit */}
                        <button className="group" onClick={() => submitNotes()}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-charcoal)" 
                            className="size-5 group-hover:stroke-theme-mint group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        </button>
                        {/* delete */}
                        <button className="group" onClick={() => clearNotes()}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-charcoal)" 
                            className="size-5 group-hover:stroke-theme-mint group-hover:stroke-[2px] group-hover:drop-shadow-lg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                }

                {/* Editing Collections Section */}
                {showCollections &&
                  <div className="flex flex-col mt-2 mb-1 mx-5 space-y-5 justify-center items-center">
                    <div className="w-full h-[1.5px] bg-theme-orange2"/>

                    <div className="flex flex-wrap space-x-4 py-[1px] w-[95%] justify-center items-center">

                      {/* map of current collections */}
                      {reviewData?.collections?.map((collection, index) => (
                        <div 
                          key={index} 
                          className="flex px-2 mb-4 space-x-2 rounded-xl bg-theme-gray2 border-[1px] border-theme-gray1"
                        >
                          {/* Name */}
                          <p className="text-[13px]">
                            {collection}
                          </p>

                          {/* Delete */}
                          <button className="group" onClick={() => removeCollection(collection)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--theme-orange1)" className="size-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* collection addition */}
                      {!showNewCollection
                      ?
                        // when viewing all collections
                        <button 
                          className="flex px-3 py-[2px] mb-4 rounded-xl bg-theme-mint border-[1px] border-theme-gray1"
                          onClick={() => setShowNewCollection(true)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      :
                        // when adding a new collection
                        <div className="flex flex-row mb-4 justify-between items-center rounded-xl bg-theme-gray2 border-[2px] border-theme-mint">

                          {/* Name Input */}
                          <input
                            className="rounded-l-xl text-center text-[13px]"
                            value={newCollection}
                            onChange={(e) => setNewCollection(e.target.value)}
                          />

                          {/* Buttons */}
                          <div className="flex flex-row px-2">

                            {/* submit - if not empty */}
                            {newCollection !== "" &&
                              <button className="group" onClick={() => addCollection()}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              </button>
                            }

                            {/* clear */}
                            <button className="group" onClick={() => setShowNewCollection(false)}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </SignedIn>
          </div>
        </div>
        }
      </div>
    </div>
  );
}