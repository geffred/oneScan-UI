import Homepage from "./HomePage/Homepage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./Dashboard/DashboardPage";
import LoginPage from "./LoginPage/LoginPage";
import RegisterPage from "./RegisterPage/RegisterPage";
import TermsPage from "./TermsPage/TermsPage";
import PrivateRoute from "../components/Config/PrivateRoute";
import Compte from "./Compte/Compte";
import CommandeDetails from "../components/CommandeDetails/CommandeDetails";
import SuiviCommandesPage from "./SuiviCommandesPage/SuiviCommandesPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppareilGalleryPage from "./AppareilGalleryPage/AppareilGalleryPage";
import CompteCabinet from "./CompteCabinet/CompteCabinet";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/" element={<Homepage />}>
            <Route index element={<Homepage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/compte" element={<Compte />} />
          <Route path="/suivi-commandes" element={<SuiviCommandesPage />} />
          <Route path="/appareils" element={<AppareilGalleryPage />} />
          <Route element={<PrivateRoute />}>
            <Route
              path="/dashboard/:activeComponent"
              element={<DashboardPage />}
            />
            <Route
              path="/dashboard/commande/:externalId"
              element={<CommandeDetails />}
            />

            <Route path="/compte/cabinet" element={<CompteCabinet />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
