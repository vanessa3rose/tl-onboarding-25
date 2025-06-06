
/////////////////////////////// IMPORTS ///////////////////////////////

import { Route, Switch } from "wouter";
import Homepage from "./components/Homepage";
import ListPage from "./components/ListPage";
import MoviePage from "./components/MoviePage";
import SignInPage from "./components/SignInPage";


/////////////////////////////// FUNCTION ///////////////////////////////

const App = () => {
  return (
    <>
      <Switch>
        <Route path="/" component={Homepage} />
        <Route path="/lists/:page" component={ListPage} />
        <Route path="/movies/:id" component={MoviePage} />
        <Route path="/sign-in/:step?" component={SignInPage} />

        {/* Shows a 404 error if the path doesn't match anything */}
        {
          <Route>
            <p className="p-4">404: Page Not Found</p>
          </Route>
        }
      </Switch>
    </>
  );
};

export default App;