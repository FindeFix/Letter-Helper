import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/lib/AppContext";
import HomePage from "@/pages/HomePage";
import LetterDetailPage from "@/pages/LetterDetailPage";

function App() {
  const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

  return (
    <AppContextProvider>
      <TooltipProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:letter" element={<LetterDetailPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </AppContextProvider>
  );
}

export default App;
