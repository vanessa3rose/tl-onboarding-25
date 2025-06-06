
/////////////////////////////// IMPORTS ///////////////////////////////

import { useEffect, useState } from "react";
import './../index.css';
import Header from "./Header";


/////////////////////////////// PAGE ///////////////////////////////

export default function MoviePage ({ params }: { params: { id: string } }) {


  /////////////////////////////// TYPES ///////////////////////////////

  type Movie = {
    title: string;
    description: string;
    id: number;
    year: number;
    poster: string;
  };
  

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
    } catch (e) {
      console.error("Error loading id:", e);
    }
  }, [currId]);


  /////////////////////////////// HTML ///////////////////////////////

  return (
    <div className="flex flex-col w-screen h-screen bg-theme-charcoal">

      {/* Header */}
      <Header params={{ selected: 0 }}/>
      
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
        </div>
      </div>
      }

      {/* Buttons */}
    </div>
  );
}