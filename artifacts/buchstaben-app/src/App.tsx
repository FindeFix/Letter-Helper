import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import LetterDetailPage from "@/pages/LetterDetailPage";

function App() {
  const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  
  return (
    <TooltipProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:letter" element={<LetterDetailPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
