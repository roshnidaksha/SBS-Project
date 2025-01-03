import React from "react";
import {
  Button,
  Container,
  Grid,
  Box,
  Avatar,
  Heading,
  Text,
  SimpleGrid,
  Image, // Import the Image component
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import NavBar from "./NavBar";
import {
  FiLogOut,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiUsers,
} from "react-icons/fi"; // Import icons

// Define the main features with corresponding images from the public folder
const features = [
  {
    title: "InvenTrack",
    description:
      "Inventrack helps businesses track and manage inventory in real-time, providing insights into stock levels, order quantities, and trends for smarter decision-making.",
    image: "inventory.jpg", // Image path in the public folder
    buttonLabel: "Explore Inventory",
    buttonRoute: "/inventory",
    icon: <FiAward size={40} />,
  },
  {
    title: "Preventify",
    description:
      "View maintenance tasks forecasted for the entire year and allocate manpower across all tasks with ease",
    image: "schedule.webp", // Image path in the public folder
    buttonLabel: "View Schedule",
    buttonRoute: "/PM",
    icon: <FiBookOpen size={40} />,
  },
  {
    title: "WorkSync", // Add the Manpower feature
    description:
      "Track and manage workforce data effectively with real-time analytics and reports.",
    image: "manpower.jpg", // Placeholder image in the public folder
    buttonLabel: "Manage Workforce",
    buttonRoute: "/manpower", // Route to Manpower page
    icon: <FiUsers size={40} />,
  },
  {
    title: "Fin Scope",
    description:
      "Monitor budget for manpower and spare parts through comprehensive insights",
    image: "finScope.png", // Image path in the public folder
    buttonLabel: "Check Status",
    buttonRoute: "/financialManagement",
    icon: <FiUsers size={40} />,
  },
];

const HomePage = () => {
  const navigate = useNavigate(); // Get the navigate function

  const handleNavigation = (path) => {
    navigate(path); // Use navigate to change routes
  };

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing user session)
    // Then navigate to the login page or another route
    navigate("/"); // Navigate to the login page
  };

  return (
    <>
      <NavBar />
      <Container maxW="container.xl" mt={1} position="relative">
        {/* Log Out Button Positioned Higher */}
        <Button
          colorScheme="darkPurple"
          position="absolute"
          top={1}
          right={5}
          variant="solid"
          borderRadius="md"
          boxShadow="md"
          _hover={{
            bg: "purple.800",
            transform: "scale(1.05)",
            transition: "all 0.2s ease-in-out",
          }}
          leftIcon={<FiLogOut />}
          onClick={handleLogout}
        >
          Log Out
        </Button>

        {/* Welcome message positioned lower */}
        <Heading as="h4" textAlign="center" mt={12} mb={4}>
          Welcome!
        </Heading>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mt={8}>
          {features.map((feature, index) => (
            <Box
              key={index}
              p={4}
              textAlign="center"
              borderWidth="1px"
              borderRadius="lg"
              height="450px"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              bg="#f5f5f5"
              boxShadow="md"
            >
              {/* Add Image for each feature */}
              <Image
                src={feature.image} // Source from feature object
                alt={feature.title} // Alt text for accessibility
                height={"200px"}
                mx="auto" // Center the image
                mb={2} // Margin below the image
              />
              <Text fontSize="xl" fontWeight="bold" mb={1}>
                {feature.title}
              </Text>
              <Text fontSize="md" mb={2}>
                {feature.description}
              </Text>

              {/* Button inside the feature box */}
              <Button
                colorScheme="darkPurple"
                variant="outline"
                width="100%"
                onClick={() => handleNavigation(feature.buttonRoute)}
              >
                {feature.buttonLabel}
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </>
  );
};

export default HomePage;
