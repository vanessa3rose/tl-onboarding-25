
/////////////////////////////// IMPORTS ///////////////////////////////

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import './../index.css';
import Header from "./Header";


/////////////////////////////// PAGE ///////////////////////////////

export default function ListPage ({ params }: { params: { page: string } }) {


  /////////////////////////////// VARIABLES ///////////////////////////////

  const MIN_PAGE = 1;
  const MAX_PAGE = 10;

  type Movie = {
    title: string;
    id: number;
    year: number;
    poster: string;
  };


  /////////////////////////////// MOVIE LISTS ///////////////////////////////

  const [currPage, setCurrPage] = useState(0);
  const [currList, setCurrList] = useState<Movie[]>([])

  // when the page is loaded in, set the requested page
  useEffect(() => {
    setCurrPage(Number(params.page));
  }, [params.page]);

  
  // when the selected page is updated, refresh the list that is displayed
  useEffect(() => {

    // quits if invalid page
    if (!currPage || isNaN(currPage) || currPage < MIN_PAGE || currPage > MAX_PAGE) {
      return;
    }

    // otherwise, fetches the list
    try {
      fetch(`/api/list?page=${currPage}`)
        .then(res => res.json())
        .then(data => setCurrList(data));
    } catch (e) {
      console.error("Error loading page:", e);
    }
  }, [currPage]);


  /////////////////////////////// VIEWING MOVIE ///////////////////////////////

  const [_, setLocation] = useLocation();


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
              <button 
                className="flex flex-col h-full w-full justify-between bg-theme-gray3 border-theme-navy2 border-2 rounded-t-lg px-2 pt-2"
                onClick={() => setLocation(`/movies/${index + (25 * (currPage - 1))}`)}
              >
                
                {/* poster */}
                <img 
                  src={movie.poster}
                  className="rounded-t-lg border-theme-charcoal border-2"
                />

                {/* details */}
                <div className="flex flex-col w-full pt-4 pb-2 px-2 space-y-2 h-full">

                  {/* title */}
                  <p className="flex justify-center items-center text-theme-pine text-[16px] h-full text-center font-bold">
                    {movie.title}
                  </p>

                  {/* year */}
                  <p className="text-theme-orange2 text-[13px] text-right font-medium italic">
                    {`(${movie.year})`}
                  </p>
                </div>
              </button>

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