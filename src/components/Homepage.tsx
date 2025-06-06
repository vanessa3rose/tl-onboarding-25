
/////////////////////////////// IMPORTS ///////////////////////////////

import Header from "./Header";
import { Link } from "wouter";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";


/////////////////////////////// PAGE ///////////////////////////////

export default function Homepage() {


  /////////////////////////////// CLERK ///////////////////////////////

  const { user } = useUser();
  

  /////////////////////////////// HTML ///////////////////////////////

  return (
    <div className="flex flex-col w-screen h-screen bg-theme-charcoal">

      {/* Header */}
      <Header params={{ selected: -1 }}/>

      {/* Signed In: Welcome the User */}
      <SignedIn>
        <div className="flex flex-col w-full h-full justify-center items-center">
          <div className="bg-theme-gray2 px-10 py-8 rounded-md border-2 border-theme-navy2 justify-center items-center">
            <p className="font-semibold text-theme-pine text-[24px]">
              {`Welcome to JumboBoxd, ${user?.firstName}!`}
            </p>
          </div>
        </div>
      </SignedIn>

      {/* Signed Out: Prompt Sign-in */}
      <SignedOut>
        <div className="flex flex-col w-full h-full justify-center items-center">
          <div className="bg-theme-gray2 px-10 py-8 space-y-2 rounded-md border-2 border-theme-navy2 justify-center items-center">

            {/* prompt */}
            <p className="font-semibold text-theme-navy2 text-[24px]">
              WELCOME
            </p>

            {/* button to sign in */}
            <div className="flex justify-center items-center bg-theme-navy1 rounded-3xl p-1">
              <Link href="/sign-in" className="text-center text-[18px] text-white font-medium">
                SIGN IN
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>
      
    </div>
  );
}