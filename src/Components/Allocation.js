import React, { useState, useEffect } from "react";
// Import the JSON data
import scheduleData from "../DataFiles/maintenance_schedule.json";
import { useLocation } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Button,
  List,
  ListItem,
  Flex,
} from "@chakra-ui/react";

function TaskAllocator() {
  const location = useLocation();
  const { totalMen, date } = location.state || {};

  const [tasks, setTasks] = useState([]); // key is dates
  const [manpower, setManpower] = useState(0);
  const [allocation, setAllocation] = useState([]);
  const specificDate = date; // this date will be passed by params later

  useEffect(() => {
    const dataMap = new Map(
      scheduleData.map((item) => [item.date, item.tasks])
    );
    const tasks = dataMap.get(specificDate);
    console.log(tasks);
    setTasks(tasks);
    setManpower(totalMen);
  }, [totalMen]); //not sure if i need to remove totalMen

  const allocateManpower = () => {
    console.log("tasks", tasks);

    let startHeap = [...tasks].sort((a, b) => a.startTime - b.startTime);
    const endHeap = [];
    //console.log("STARTTTT HEAP:", startHeap[0]);
    console.table(startHeap);
    console.table(endHeap);

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
        (endHeap.length === 0 || startHeap[0].startTime <= endHeap[0].endTime)
      ) {
        const task = startHeap.shift();
        endHeap.push(task);
        endHeap.sort((a, b) => a.endTime - b.endTime); // Keep endHeap sorted by endTime
      }

      if (endHeap.length > 0) {
        const currentTask = endHeap.shift();
        if (currentManpower >= currentTask.maxPeople) {
          // Allocate manpower
          allocations.push({
            trainNo: currentTask.trainNo,
            track: currentTask.track,
            maintenanceType: currentTask.maintenanceType,
            allocated: currentTask.maxPeople,
          });
          currentManpower -= currentTask.maxPeople;

          // Simulate task completion by returning manpower
          setTimeout(() => {
            currentManpower += currentTask.maxPeople;
            setManpower(currentManpower);
          }, (currentTask.endTime - currentTask.startTime) * 1000); // Simulate task duration
        } else {
          allocations.push({
            trainNo: currentTask.trainNo,
            allocated: 0,
          });
        }
      }
    }

    setAllocation(allocations);
  };

  return (
    <Box>
      <Heading as="h1">Task Allocator</Heading>
      <Text>Available Manpower: {manpower}</Text>
      <Button onClick={allocateManpower}>Allocate Manpower</Button>

      <Heading as="h2">Tasks</Heading>
      <List spacing={3}>
        {tasks.map((task, index) => (
          <ListItem key={index}>
            <Flex justifyContent="space-between">
              <Text>
                Train {task.trainNo}: {task.startTime} - {task.endTime}
              </Text>
              <Text>Max People: {task.maxPeople}</Text>
            </Flex>
          </ListItem>
        ))}
      </List>

      <Heading as="h2">Allocation</Heading>
      <List spacing={3}>
        {allocation.map((alloc, index) => (
          <ListItem key={index}>
            <Flex justifyContent="space-between">
              <Text>Train {alloc.trainNo}:</Text>
              <Text>Track {alloc.track}:</Text>
              <Text>Maintenance Type {alloc.maintenanceType}:</Text>
              <Text>Allocated {alloc.allocated} people</Text>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default TaskAllocator;
