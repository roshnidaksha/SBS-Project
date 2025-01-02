// Import necessary libraries 
import React, { useState } from 'react'; 
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Input, 
  Text, 
  VStack, 
  Heading, 
  Alert, 
  AlertIcon, 
  Spinner, 
  Center, 
  Select,
} from '@chakra-ui/react'; 
import { useParams, useLocation } from 'react-router-dom';
import maintenanceData from '../DataFiles/maintenance_schedule.json';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const MaintenanceScheduler = () => { 
  // State for PM Teams 
  const { date } = useParams(); // Retrieve date from the URL
  const location = useLocation(); // Access additional state if needed
  const navigate = useNavigate();

  const selectedDate = date; // Use this date in your scheduling logic
  // console.log('Selected Date:', selectedDate);
  
  const [pmTeams, setPmTeams] = useState([ 
    { id: 'Team 1', men: '' }, 
    { id: 'Team 2', men: '' }, 
    { id: 'Team 3', men: '' }, 
    { id: 'Team 4', men: '' }, 
  ]); 
 
  // State for OH Team 
  const [ohTeam, setOhTeam] = useState({ id: 'Team 1', men: '' }); 
 
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
      setPmTeams((prevTeams) => { 
        const newTeams = [...prevTeams]; 
        newTeams[index].men = value; 
        return newTeams; 
      }); 
    } 
  }; 
 
  const handleOhInputChange = (value) => { 
    if (/^\d*$/.test(value)) { 
      setOhTeam({ ...ohTeam, men: value }); 
    } 
  }; 
 
  const handleCreateSchedule = () => { 
    // Check if any field is empty 
    const isPmIncomplete = pmTeams.some((team) => team.men === '' || team.men === '0'); 
    const isOhIncomplete = ohTeam.men === '' || ohTeam.men === '0'; 
 
    if (isPmIncomplete || isOhIncomplete) { 
      setWarning('All fields must be filled with a value greater than 0.'); 
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
      //setScheduleLoaded(true);
      //console.log("Hellooooo Selected Date:", selectedDate);
      navigate(`/TaskAllocator`, {state: {totalMen: totalPmMen, date: formattedDate}});
    }, 2000); 
  }; 
 
  // Sample schedules for PM Tracks and Overhaul Tracks 
  const pmSchedule = [ 
    { 
      track: "E1", 
      trains: [ 
        { id: "pv01", maintenance: "ME1", timing: "09:00 - 11:00", team: "Team 1", people: 3 }, 
        { id: "pv02", maintenance: "ME1", timing: "11:00 - 13:00", team: "Team 2", people: 4 }, 
      ], 
    }, 
    { 
      track: "E2", 
      trains: [ 
        { id: "pv03", maintenance: "ME2", timing: "09:00 - 11:00", team: "Team 3", people: 2 }, 
      ], 
    }, 
    { 
      track: "E3", 
      trains: [ 
        { id: "pv04", maintenance: "ME3", timing: "09:00 - 11:00", team: "Team 4", people: 2 }, 
        { id: "pv05", maintenance: "ME3", timing: "11:00 - 13:00", team: "Team 1", people: 3 }, 
      ], 
    }, 
    { 
      track: "E4", 
      trains: [ 
        { id: "pv06", maintenance: "ME4", timing: "09:00 - 11:00", team: "Team 2", people: 4 }, 
      ], 
    }, 
    { 
      track: "E5", 
      trains: [ 
        { id: "pv07", maintenance: "ME5", timing: "09:00 - 11:00", team: "Team 3", people: 3 }, 
        { id: "pv08", maintenance: "ME5", timing: "11:00 - 13:00", team: "Team 4", people: 2 }, 
      ], 
    }, 
  ]; 
 
  const ohSchedule = [ 
    { 
      track: "W1", 
      trains: [ 
        { id: "pv09", maintenance: "MinOH", timing: "09:00 - 13:00", team: "Team 1", people: 10 }, 
      ], 
    }, 
  ]; 
 
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
 
  if (scheduleLoaded) { 
    return ( 
      <VStack spacing={6} p={5} bgGradient="linear(to-br, gray.100, white)"> 
        <Text fontSize="2xl" fontWeight="bold" color="teal.600"> 
          Full-Day Maintenance Schedule 
        </Text> 
 
        {/* PM Tracks Section */} 
        {pmSchedule.map((schedule) => ( 
          <Box w="100%" mb={6} p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white" key={schedule.track}> 
            <Heading size="md" mb={4} color="blue.600">{`PM Track ${schedule.track}`}</Heading> 
            <Table variant="simple" colorScheme="blue" size="md">
<Thead> 
                <Tr> 
                  <Th>Train</Th> 
                  <Th>Maintenance Type</Th> 
                  <Th>Timing</Th> 
                  <Th>Team No</Th> 
                  <Th>Number of People</Th> 
                </Tr> 
              </Thead> 
              <Tbody> 
                {schedule.trains.map((train, idx) => ( 
                  <Tr key={`${schedule.track}-${idx}`}> 
                    <Td>{train.id}</Td> 
                    <Td>{train.maintenance}</Td> 
                    <Td>{train.timing}</Td> 
                    <Td>{train.team}</Td> 
                    <Td>{train.people}</Td> 
                  </Tr> 
                ))} 
              </Tbody> 
            </Table> 
          </Box> 
        ))} 
 
        {/* Overhaul Tracks Section */} 
        {ohSchedule.map((schedule) => ( 
          <Box w="100%" mb={6} p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg="white" key={schedule.track}> 
            <Heading size="md" mb={4} color="blue.600">{`Overhaul Track ${schedule.track}`}</Heading> 
            <Table variant="simple" colorScheme="blue" size="md"> 
              <Thead> 
                <Tr> 
                  <Th>Train</Th> 
                  <Th>Maintenance Type</Th> 
                  <Th>Timing</Th> 
                  <Th>Team No</Th> 
                  <Th>Number of People</Th> 
                </Tr> 
              </Thead> 
              <Tbody> 
                {schedule.trains.map((train, idx) => ( 
                  <Tr key={`${schedule.track}-${idx}`}> 
                    <Td>{train.id}</Td> 
                    <Td>{train.maintenance}</Td> 
                    <Td>{train.timing}</Td> 
                    <Td>{train.team}</Td> 
                    <Td>{train.people}</Td> 
                  </Tr> 
                ))} 
              </Tbody> 
            </Table> 
          </Box> 
        ))} 
 
        <Button colorScheme="teal" onClick={() => setScheduleLoaded(false)} size="lg"> 
          Back to Input 
        </Button> 
      </VStack> 
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
                  placeholder="Select number"
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
                placeholder="Select number"
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