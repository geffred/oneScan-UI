import SuiviCommandes from "../../components/SuiviCommandes/SuiviCommandes";
import "./SuiviCommandesPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const SuiviCommandesPage = () => {
  return (
    <div className="suivi-page">
      <main className="suivi-page-main">
        <Header />
        <SuiviCommandes />
        <Footer />
      </main>
    </div>
  );
};

export default SuiviCommandesPage;
