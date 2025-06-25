
/////////////////////////////// IMPORTS ///////////////////////////////

import { Route, Switch } from "wouter";
import Homepage from "./components/Homepage";
import ListPage from "./components/ListPage";
import MoviePage from "./components/MoviePage";
import SignInPage from "./components/SignInPage";
import ReviewsPage from "./components/ReviewsPage";
import CollectionsPage from "./components/CollectionsPage";


/////////////////////////////// FUNCTION ///////////////////////////////

const App = () => {
  return (
    <>
      <Switch>
        <Route path="/" component={Homepage} />
        <Route path="/lists/:page" component={ListPage} />
        <Route path="/movies/:id/:prev" component={MoviePage} />
        <Route path="/reviews/" component={ReviewsPage} />
        <Route path="/sign-in/:step?" component={SignInPage} />
        <Route path="/collections/" component={CollectionsPage} />

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