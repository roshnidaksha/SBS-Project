import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import HomePage from "./HomePage";
import NavBar from "./NavBar";
import FinancialManagement from "./Features/FinancialManagement";

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
            <Route path="/financialManagement" element={<FinancialManagement />} />
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
