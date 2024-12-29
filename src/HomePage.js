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
      "Employees earn verified badges for new skills. Skill Wallet using blockchain for transparency.",
    image: "skills.png", // Image path in the public folder
    buttonLabel: "Access Skills",
    buttonRoute: "/inventory",
    icon: <FiAward size={40} />,
  },
  {
    title: "Career Voyage",
    description:
      "Simulate various career paths and visualize potential career outcomes based on skills.",
    image: "career.webp", // Image path in the public folder
    buttonLabel: "View Career Paths",
    buttonRoute: "/career-voyage",
    icon: <FiTrendingUp size={40} />,
  },
  {
    title: "Development Dashboard",
    description:
      "Managers track engagement across generations and skill levels. AI recommends formats based on preferences.",
    image: "development.png", // Image path in the public folder
    buttonLabel: "Explore Courses",
    buttonRoute: "/learning",
    icon: <FiBookOpen size={40} />,
  },
  {
    title: "Fin Scope",
    description:
      "Resources for younger interns and feedback tools for managers, fostering skill-sharing across generations.",
    image: "mentor.jpg", // Image path in the public folder
    buttonLabel: "Engage Now",
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
          Welcome, Nancy Drew!
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
