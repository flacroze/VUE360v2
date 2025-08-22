import { Switch, Route } from "wouter";

// Pages
import Dimensionnements from "./pages/Dimensionnements";
import Accueil from "./pages/Accueil";
import Agents from "./pages/Agents";
import Skills from "./pages/Skills"; // Assuming Skills page uses Agents component
import Plannings from "./pages/Plannings";
import Equity from "./pages/Equity"; // New Equity page
// NotFound page
import NotFound from "./pages/NotFound";

// Layout principal
import MainLayout from "./components/layout/main-layout";

export default function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Accueil} />
        <Route path="/dimensionnements" component={Dimensionnements} />
        <Route path="/agents" component={Agents} />
        <Route path="/skills" component={Skills} /> {/* Assuming Skills page uses Agents component */}
        <Route path="/plannings" component={Plannings} />
        <Route path="/equity" component={Equity} /> {/* New route for Equity page */}
        {/* Add more routes as needed */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}
