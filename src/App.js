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
import Manpower from "./Features/Manpower";
import PM from "./Components/PM";
import Maintenance from "./Components/Maintenance";
import TaskAllocator from "./Components/Allocation";
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
            <Route path="/" element={<Navigate to="/PM" />} />
            {/* Render other routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/manpower" element={<Manpower />} /> 
            <Route path="/maintenance/:date" element={<Maintenance />} />
            <Route path="/PM" element={<PM />} /> 
            <Route path="/TaskAllocator" element={<TaskAllocator />} /> 
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
