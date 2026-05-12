import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ResizeTool from "./pages/ResizeTool";
import CompressTool from "./pages/CompressTool";
import ConvertTool from "./pages/ConvertTool";
import CropTool from "./pages/CropTool";
import ExifTool from "./pages/ExifTool";
import FaviconTool from "./pages/FaviconTool";
import RotateTool from "./pages/RotateTool";
import WatermarkTool from "./pages/WatermarkTool";
import Layout from "./components/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/resize" component={ResizeTool} />
        <Route path="/compress" component={CompressTool} />
        <Route path="/convert" component={ConvertTool} />
        <Route path="/crop" component={CropTool} />
        <Route path="/rotate" component={RotateTool} />
        <Route path="/watermark" component={WatermarkTool} />
        <Route path="/exif" component={ExifTool} />
        <Route path="/favicon" component={FaviconTool} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
