// Import necessary libraries 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import manpower_projected from '../data/manpower_projected.json';

const MaintenanceScheduler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // State for PM Teams 
  const { date } = useParams(); // Retrieve date from the URL
  const events = location.state?.events;

  const selectedDate = date; // Use this date in your scheduling logic

  const formattedDate = new Date(date).toLocaleDateString('en-CA');
  const team_details = manpower_projected[formattedDate]?.team_details || {};

  const [pmTeams, setPmTeams] = useState([]);
  const [ohTeam, setOhTeam] = useState({});

  useEffect(() => {
    // Only show toast if team details are loaded and have not been shown yet
    if (Object.keys(team_details).length !== 0) {
      toast.closeAll();
      toast({
        title: "Manpower Data Loaded",
        description: `Successfully retrieved manpower data for date ${formattedDate}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    // Set PM Teams state
    setPmTeams([
      { id: 'Team 1', men: team_details.T1 || '' },
      { id: 'Team 2', men: team_details.T2 || '' },
      { id: 'Team 3', men: team_details.T3 || '' },
      { id: 'Team 4', men: team_details.T4 || '' },
    ]);

    // Set OH Team state
    setOhTeam({ id: 'Team 1', men: team_details.OH || '' });
  }, [formattedDate, team_details, toast]);

  // State for warnings 
  const [warning, setWarning] = useState('');

  // State for loading screen 
  const [isLoading, setIsLoading] = useState(false);

  // State for schedule screen 
  const [scheduleLoaded, setScheduleLoaded] = useState(false);

  // State to store the total number of men
  const [totalMen, setTotalMen] = useState(0);

  const handlePmInputChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const numericValue = value === '' ? '' : Number(value);
      setPmTeams((prevTeams) => {
        const newTeams = [...prevTeams];
        newTeams[index].men = numericValue;
        return newTeams;
      });
    }
  };

  const handleOhInputChange = (value) => {
    if (/^\d*$/.test(value)) {
      const numericValue = value === '' ? '' : Number(value);
      setOhTeam({ ...ohTeam, men: numericValue });
    }
  };

  const handleCreateSchedule = () => {
    // Check if any field is empty 
    const isPmIncomplete = pmTeams.some((team) => team.men === '');
    const isOhIncomplete = ohTeam.men === '';

    if (isPmIncomplete || isOhIncomplete) {
      setWarning('All fields must be filled with a non-empty value.');
      return;
    }

    setWarning('');

    let totalPmMen = pmTeams.reduce((sum, team) => sum + parseInt(team.men || 0, 10), 0);
    setTotalMen(totalPmMen);
    setIsLoading(true);
    const date = new Date(selectedDate); // Convert string to Date object
    let formattedDate = date.toLocaleDateString('en-CA'); // this is in yyyy-mm-dd 

    // Simulate a loading process 
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/TaskAllocator`, { 
        state: { 
          totalMen: totalPmMen, 
          date: formattedDate,
          pmTeams: pmTeams,
          ohTeam: ohTeam, } });
    }, 2000);
  };

  if (isLoading) {
    return (
      <Center height="100vh" bgGradient="linear(to-r, teal.400, blue.500)">
        <Spinner size="xl" color="white" />
        <Text ml={4} fontSize="lg" color="white">
          Creating Schedule...
        </Text>
      </Center>
    );
  }

  return (
    <VStack spacing={6} p={5} bgGradient="linear(to-br, gray.100, white)">
      <Text fontSize="2xl" fontWeight="bold" color="teal.600">
        Maintenance Team Scheduler
      </Text>

      {/* Warning Message */}
      {warning && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {warning}
        </Alert>
      )}

      {/* PM Teams Section */}
      <Box w="100%" p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Heading size="md" mb={4} color="blue.600">
          PM Teams
        </Heading>
        <Table variant="simple" colorScheme="blue" size="md">
          <Thead>
            <Tr>
              <Th>Team</Th>
              <Th>Number of Men Present</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pmTeams.map((team, index) => (
              <Tr key={team.id}>
                <Td>{team.id}</Td>
                <Td>
                  <Select
                    value={team.men}
                    onChange={(e) => handlePmInputChange(index, e.target.value)}
                    placeholder={team.men || 'Select number'}
                  >
                    {[...Array(6).keys()].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* OH Team Section */}
      <Box w="100%" p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white">
        <Heading size="md" mb={4} color="blue.600">
          Overhaul Team
        </Heading>
        <Table variant="simple" colorScheme="blue" size="md">
          <Thead>
            <Tr>
              <Th>Team</Th>
              <Th>Number of Men Present</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{ohTeam.id}</Td>
              <Td>
                <Select
                  value={ohTeam.men}
                  onChange={(e) => handleOhInputChange(e.target.value)}
                  placeholder={ohTeam.men || 'Select number'}
                >
                  {[...Array(21).keys()].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>

      {/* Create Schedule Button */}
      <Button colorScheme="teal" onClick={handleCreateSchedule} size="lg" mt={4}>
        Create Schedule
      </Button>
    </VStack>
  );
};

export default MaintenanceScheduler;