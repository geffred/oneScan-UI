import Homepage from "./HomePage/Homepage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./Dashboard/DashboardPage";
import LoginPage from "./LoginPage/LoginPage";
import RegisterPage from "./RegisterPage/RegisterPage";
import TermsPage from "./TermsPage/TermsPage";
import ContactPage from "./ContactPage/ContactPage";
import PrivateRoute from "../components/Config/PrivateRoute";
import Compte from "./Compte/Compte";
import CommandeDetails from "../components/CommandeDetails/CommandeDetails";
import SuiviCommandesPage from "./SuiviCommandesPage/SuiviCommandesPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppareilGalleryPage from "./AppareilGalleryPage/AppareilGalleryPage";
import CompteCabinet from "./CompteCabinet/CompteCabinet";
import MeditLinkCallback from "./MeditLinkCallback/MeditLinkCallback";
import ThreeShapeCallback from "./ThreeShapeCallback/ThreeShapeCallback";
import CabinetRegisterPage from "./CabinetRegisterPage/CabinetRegisterPage";

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
          <Route path="/meditLink/callback" element={<MeditLinkCallback />} />
          <Route path="/3shapde/callback" element={<ThreeShapeCallback />} />
          <Route path="/cabinet/register" element={<CabinetRegisterPage />} />
          <Route path="/compte/cabinet" element={<CompteCabinet />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
