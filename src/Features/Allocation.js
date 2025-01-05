
import React, { useState, useEffect } from "react";
// Import the JSON data
// import scheduleData from "../data/maintenance_schedule.json";
import scheduleData from "../data/detailed_schedule.json";
import { useLocation } from "react-router-dom";
import { Box, Heading, Text, Button, List, ListItem, Flex, Thead, Tbody, Tr, Th, Td, Table, useToast } from "@chakra-ui/react";


function TaskAllocator() {
  const location = useLocation();
  const toast = useToast();
  const { totalMen, date, pmTeams, ohTeam } = location.state || {};
  console.log(pmTeams, ohTeam);

  const [tasks, setTasks] = useState([]); // key is dates
  const [manpower, setManpower] = useState(0);
  const [allocation, setAllocation] = useState([]);
  const specificDate = date; // this date will be passed by params later

  const getDetailedSchedule = async (startDate) => {
    try {
      const response = await fetch('http://localhost:5000/allocate_manpower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start_date: startDate, PmTeams : pmTeams, OhTeam : ohTeam }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.closeAll();
        toast({
          title: "Manpower Allocated Successfully",
          description: " ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setAllocation(data);
        console.log("allocation", allocation);
      } else {
        toast.closeAll();
        toast({
          title: "Error",
          description: "Error Allocating Manpower",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast.closeAll();
      toast({
        title: "Error Connecting",
        description: "Error connecting to the server",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAllocateManpower = async (e) => {
    const startDate = "2025-01-01";
    const currentDate = new Date(date).toISOString().split('T')[0];
    getDetailedSchedule(currentDate);
  };

  useEffect(() => {
    const dataMap = new Map(scheduleData.map((item) => [item.date, item.tasks]));
    const tasks = dataMap.get(specificDate);
    console.log(tasks);
    setTasks(tasks);
    setManpower(totalMen);

    if (allocation != []) {
      setTasks(allocation?.schedule?.tasks);
    }
  }, [totalMen, allocation]); //not sure if i need to remove totalMen

  return (
    <Box bgGradient="linear(to-br, gray.200, gray.400)" minH="100vh" py="8" px="4">
      <Box maxW="1200px" margin="0 auto" bg="white" p="6" borderRadius="lg" boxShadow="xl">
        <Heading as="h1" size="xl" mb="6" textAlign="center" color="blue.700">
          Task Allocator
        </Heading>
        <Heading as="h1" size="lg" mb="6" textAlign="center" color="blue.700">
          {specificDate}
        </Heading>

        <Box bg="blue.50" p="4" borderRadius="md" boxShadow="sm" mb="6">
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="blue.700">
              Available Manpower: <Text as="span" color="blue.500">{manpower}</Text>
            </Text>
            <Button
              type="button"
              onClick={handleAllocateManpower}
              style={{
                colorScheme: "blue",
                size: "lg",
                background: "linear-gradient(to right, #63b3ed, #3182ce)",
                color: "white",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "linear-gradient(to right, #4299e1, #2b6cb0)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "linear-gradient(to right, #63b3ed, #3182ce)";
              }}
            >
            Allocate Manpower
          </Button>
        </Flex>
      </Box>

      <Box mb="6">
        <Heading as="h2" size="lg" mb="4" color="blue.700">
          Tasks
        </Heading>
        <Box border="1px solid" borderColor="gray.300" borderRadius="md" boxShadow="sm" overflow="hidden">
          <Table variant="striped" colorScheme="blue">
            <Thead>
              <Tr bg="blue.100">
                <Th>Train No</Th>
                <Th>Start Time</Th>
                <Th>End Time</Th>
                <Th>Maintenance</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tasks.map((task, index) => (
                <Tr key={index}>
                  <Td>{task.trainNo}</Td>
                  <Td>{task.startTime}</Td>
                  <Td>{task.endTime}</Td>
                  <Td>{task.maintenanceType}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Box>
        <Heading as="h2" size="lg" mb="4" color="blue.700">
          Allocation
        </Heading>
        <Box border="1px solid" borderColor="gray.300" borderRadius="md" boxShadow="sm" p="4">
          {allocation?.schedule?.tasks?.length > 0 ? (
            <List spacing={4}>
              {allocation.schedule.tasks.map((alloc, index) => (
                <ListItem
                  key={index}
                  p="4"
                  bg={alloc.peopleRequired < 5 ? "red.50" : "green.50"}
                  borderRadius="md"
                  boxShadow="sm"
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box>
                      <Text fontSize="lg" fontWeight="bold" color="gray.700">
                        Train: {alloc.trainNo}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Track: {alloc.track}, Team: {alloc.team}
                      </Text>
                    </Box>
                    <Text fontSize="lg" color={alloc.peopleRequired < 5 ? "red.600" : "green.600"} fontWeight="bold">
                      Allocated: {alloc.peopleRequired} people
                    </Text>
                  </Flex>
                </ListItem>
              ))}
            </List>
          ) : (
            <Text color="gray.600">No allocations made yet.</Text>
          )}
        </Box>
      </Box>
    </Box>
    </Box >
  );
}

export default TaskAllocator;
