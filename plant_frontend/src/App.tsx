import { Route, Routes } from "react-router-dom";
import { PageShell } from "./components/layout/PageShell";
import { AboutPage } from "./pages/AboutPage";
import { DiseaseDetailPage } from "./pages/DiseaseDetailPage";
import { DiseasesPage } from "./pages/DiseasesPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ScanPage } from "./pages/ScanPage";

export function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/diseases" element={<DiseasesPage />} />
        <Route path="/diseases/:className" element={<DiseaseDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageShell>
  );
}

export default App;
