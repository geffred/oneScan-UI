import AppareilGallery from "../../components/AppareilGallery/AppareilGallery";
import "./AppareilGalleryPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const AppareilGalleryPage = () => {
  return (
    <div className="appareil-gallery-page" id="header-appareils">
      <main className="appareil-gallery-page-main">
        <Header />
        <AppareilGallery />
        <Footer />
      </main>
    </div>
  );
};

export default AppareilGalleryPage;
