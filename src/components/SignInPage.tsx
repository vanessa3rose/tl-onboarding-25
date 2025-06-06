
/////////////////////////////// IMPORTS ///////////////////////////////

import Header from "./Header";
import { SignIn } from "@clerk/clerk-react";


/////////////////////////////// PAGE ///////////////////////////////

export default function SignInPage() {


  /////////////////////////////// HTML ///////////////////////////////

  return (
    <div className="flex flex-col w-screen h-screen bg-theme-charcoal">

      {/* Header */}
      <Header params={{ selected: -1 }}/>

      {/* Sign In */}
      <div className="flex w-full h-full justify-center items-center">
        <SignIn path="/sign-in" routing="path"/>
      </div>
    </div>
  );
}
