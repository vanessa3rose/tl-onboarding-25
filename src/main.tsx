
/////////////////////////////// IMPORTS ///////////////////////////////

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ClerkProvider } from "@clerk/clerk-react";
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;


/////////////////////////////// PAGE ///////////////////////////////

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App/>
    </ClerkProvider>
  </React.StrictMode>
);