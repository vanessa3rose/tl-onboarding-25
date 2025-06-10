
/////////////////////////////// IMPORTS ///////////////////////////////

import { Link } from "wouter";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import './../index.css'


/////////////////////////////// PAGE ///////////////////////////////

export default function Header ({ params }: { params: { selected: number } }) {


  /////////////////////////////// VARIABLES ///////////////////////////////

  const { isSignedIn } = useUser();

  const TABS = isSignedIn ? ["LISTS", "REVIEWS", "COLLECTIONS"] : ["LISTS"];
  const REF = isSignedIn ? ["/lists/1", "/reviews", "/"] : ["/lists/1"];


  /////////////////////////////// HTML ///////////////////////////////

  return (
    <div className="flex flex-row shadow-sm shadow-black w-justify-between items-center px-5 py-2 space-x-5 bg-theme-navy2">
      
      {/* Left Side (Logo) */}
      <div className="flex w-1/5">
        <Link href="/" className="font-bold text-left text-[30px] text-theme-mint">
          JumboBoxd
        </Link>
      </div>
      
      {/* Middle (Tabs) */}
      <div className="flex flex-row w-3/5 justify-center space-x-20">
        {TABS.map((tab, index) => (
          <Link href={REF[index]} key={index} className={`font-medium text-[14px] text-theme-gray2 ${params.selected === index && "bg-theme-charcoal rounded-xl px-3"}`}>
            {tab}
          </Link>
        ))}
      </div>
      
      {/* Right Side (Profile Button) */}
      <div className="flex w-1/5 items-center justify-end">

        {/* Signed In: User */}
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "ring-2 ring-theme-mint",
                userButtonPopoverCard: "text-theme-mint",
                userButtonPopoverActionButton: "hover:bg-theme-gray1",
              },
            }}
          />
        </SignedIn>

        {/* Signed Out: Sign In */}
        <SignedOut>
          <div className="flex justify-center items-center bg-theme-orange1 rounded-3xl px-3">
            <Link href="/sign-in" className="text-center text-[16px] text-white font-medium">
              Sign In
            </Link>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}