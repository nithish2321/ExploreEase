import "./App.css";
import Layout from "./components/Layout/Layout";
import { CityProvider } from "./CityContext";

function App() {
  return (
  <CityProvider>
    <Layout />
  </CityProvider>
  );
};

export default App;
