import React, { useState, useEffect } from "react";
// Import the JSON data
import scheduleData from "../DataFiles/maintenance_schedule.json";
import { useLocation } from "react-router-dom";
import { Box, Heading, Text, Button, List, ListItem, Flex } from "@chakra-ui/react";


function TaskAllocator() {
  const location = useLocation();
  const {totalMen, date} = location.state || {};

  const [tasks, setTasks] = useState([]); // key is dates
  const [manpower, setManpower] = useState(0);
  const [allocation, setAllocation] = useState([]);
  const specificDate = date; // this date will be passed by params later

  useEffect(() => { 
    const dataMap = new Map(scheduleData.map((item)=> [item.date, item.tasks]));
    const tasks = dataMap.get(specificDate);
    console.log(tasks);
    setTasks(tasks);
    setManpower(totalMen);
  }, [totalMen]); //not sure if i need to remove totalMen


  const allocateManpower = () => {
    const startHeap = [...tasks].sort((a, b) => a.startTime - b.startTime);
    const endHeap = [];
    let currentManpower = manpower;
    const allocations = [];

    while (startHeap.length > 0 || endHeap.length > 0) {
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
              <Text>Allocated {alloc.allocated} people</Text>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
   
    /*<div>
      <h1>Task Allocator</h1>
      <p>Available Manpower: {manpower}</p>
      <button onClick={allocateManpower}>Allocate Manpower</button>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            Train {task.trainNo}: {task.startTime} - {task.endTime}, Max People:{" "}
            {task.maxPeople}
          </li>
        ))}
      </ul>
      <h2>Allocation</h2>
      <ul>
        {allocation.map((alloc, index) => (
          <li key={index}>
            Train {alloc.trainNo}: Allocated {alloc.allocated} people
          </li>
        ))}
      </ul>
    </div> */
  );
}

export default TaskAllocator;
