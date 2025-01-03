import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import HomePage from "./HomePage";
import NavBar from "./NavBar";
import Inventory from "./Features/Inventory";
import PM from "./Features/PM";
import Manpower from "./Features/Manpower";
import FinancialManagement from "./Features/FinancialManagement";
import MaintenanceScheduler from "./Features/Maintenance";
import TaskAllocator from "./Features/Allocation";

const theme = extendTheme({
  config: {
    initialColorMode: "light", // Ensure this is properly set
    useSystemColorMode: false,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            {/* Render other routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/pm" element={<PM />} />
            <Route path="/TaskAllocator" element={<TaskAllocator />} />
            <Route path="/maintenance/:date" element={<MaintenanceScheduler />} />
            <Route path="/manpower" element={<Manpower />} />
            <Route path="/financialManagement" element={<FinancialManagement />} />
            {/* <Route path="/career-voyage" element={<CareerVoyage />} />
            <Route path="/gen-ex" element={<GenerationalEngagement />} />
            <Route path="/learning" element={<LearningDashboard />} /> */}
            
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
