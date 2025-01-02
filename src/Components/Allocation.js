import React, { useState, useEffect } from "react";
// Import the JSON data
import scheduleData from "../DataFiles/maintenance_schedule.json";
import { useLocation } from "react-router-dom";
import { Box, Heading, Text, Button, List, ListItem, Flex, Thead, Tbody, Tr, Th, Td, Table} from "@chakra-ui/react";


function TaskAllocator() {
  const location = useLocation();
  const { totalMen, date } = location.state || {};

  const [tasks, setTasks] = useState([]); // key is dates
  const [manpower, setManpower] = useState(0);
  const [allocation, setAllocation] = useState([]);
  const specificDate = date; // this date will be passed by params later
  

  useEffect(() => {
    const dataMap = new Map(scheduleData.map((item) => [item.date, item.tasks]));
    const tasks = dataMap.get(specificDate);
    console.log(tasks);
    setTasks(tasks);
    setManpower(totalMen);
  }, [totalMen]); //not sure if i need to remove totalMen

 
  const allocateManpower = () => {
    
    let startHeap = [...tasks].sort((a, b) => a.startTime - b.startTime);
    const endHeap = [];
    let currentManpower = manpower;
    const allocations = [];

    while (startHeap.length > 0 || endHeap.length > 0) {
      console.log("Start Heap: ", startHeap);
      //console.table(endHeap);
      console.table(startHeap);

      console.log("End heap: ", endHeap);
      // Move tasks from startHeap to endHeap based on startTime
      while (
        startHeap.length > 0 &&
        (endHeap.length === 0 || startHeap[0].startTime < endHeap[0].endTime)
      ) {
        const task = startHeap.shift();
        if (currentManpower >= task.maxPeople) {
          // Allocate manpower
          allocations.push({
            trainNo: task.trainNo,
            track: task.track,
            maintenanceType: task.maintenanceType,
            maxPeople: task.maxPeople,
            date: date,
            allocated: task.maxPeople,
          });
          currentManpower -= task.maxPeople;
        } else if (currentManpower > 0) {
          allocations.push({
            trainNo: task.trainNo,
            track: task.track,
            maintenanceType: task.maintenanceType,
            maxPeople: task.maxPeople,
            date: date,
            allocated: currentManpower,
          });
          currentManpower = 0;
        } else {
          allocations.push({
            trainNo: task.trainNo,
            track: task.track,
            maintenanceType: task.maintenanceType,
            maxPeople: task.maxPeople,
            date: date,
            allocated: 0,
          });
          //break;
        }
        endHeap.push(task);
        endHeap.sort((a, b) => a.endTime - b.endTime); // Keep endHeap sorted by endTime
      }

      if (endHeap.length > 0) {
        const currentTask = endHeap.shift();
        currentManpower += currentTask.maxPeople;
      }
    }

    setAllocation(allocations);
 
  };

  function convertDecimalToRoundedTime(decimalTime) {
    // Extract the integer (hours) and decimal (minutes) parts
    const hours = Math.floor(decimalTime);
    const decimalMinutes = decimalTime - hours;
  
    // Convert the decimal part to "minute-like" intervals
    // Assuming 0.75 maps to 45 minutes
    let roundedMinutes;
    if (decimalMinutes < 0.25) {
      roundedMinutes = "00";
    } else if (decimalMinutes < 0.5) {
      roundedMinutes = "15";
    } else if (decimalMinutes < 0.75) {
      roundedMinutes = "30";
    } else {
      roundedMinutes = "45";
    }
  
    // Return the formatted time
    return `${hours}:${roundedMinutes}`;
  }

  return (
    <Box bgGradient="linear(to-br, gray.200, gray.400)" minH="100vh" py="8" px="4">
      <Box maxW="1200px" margin="0 auto" bg="white" p="6" borderRadius="lg" boxShadow="xl">
        <Heading as="h1" size="xl" mb="6" textAlign="center" color="blue.700">
          Task Allocator
        </Heading>

        <Box bg="blue.50" p="4" borderRadius="md" boxShadow="sm" mb="6">
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color="blue.700">
              Available Manpower: <Text as="span" color="blue.500">{manpower}</Text>
            </Text>
            <Button
              colorScheme="blue"
              onClick={allocateManpower}
              borderRadius="full"
              size="lg"
              bgGradient="linear(to-r, blue.400, blue.600)"
              _hover={{ bgGradient: "linear(to-r, blue.500, blue.700)" }}
              color="white"
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
                  <Th>Max People</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tasks.map((task, index) => (
                  <Tr key={index}>
                    <Td>{task.trainNo}</Td>
                    <Td>{convertDecimalToRoundedTime(task.startTime)}</Td>
                    <Td>{convertDecimalToRoundedTime(task.endTime)}</Td>
                    <Td>{task.maxPeople}</Td>
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
            {allocation.length > 0 ? (
              <List spacing={4}>
                {allocation.map((alloc, index) => (
                  <ListItem
                    key={index}
                    p="4"
                    bg={alloc.allocated == alloc.maxPeople ? "green.50" : "red.50"}
                    borderRadius="md"
                    boxShadow="sm"
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Box>
                        <Text fontSize="lg" fontWeight="bold" color="gray.700">
                          Train: {alloc.trainNo}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Track: {alloc.track}, Type: {alloc.maintenanceType}
                        </Text>
                      </Box>
                      <Text fontSize="lg" color={alloc.allocated == alloc.maxPeople ? "green.600" : "red.600"} fontWeight="bold">
                        Allocated: {alloc.allocated} people
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
    </Box>
  );
}

export default TaskAllocator;
