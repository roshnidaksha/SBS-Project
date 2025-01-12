import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Heading,
  Center,
  Button,
  Text,
  VStack,
  HStack,
  Spinner,
  useToast,
  CloseButton,
} from "@chakra-ui/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Default styles for react-calendar
import detailed_schedule from "../data/detailed_schedule.json";
import NavBar from "../NavBar";
import "./PM.css"; // Import custom CSS for tile styling
import { useNavigate } from "react-router-dom";

const PM = () => {
  // Upload daily mileage
  const [file, setFile] = useState(null);

  const [events, setEvents] = useState([]); // Stores list of maintenance events for selected train
  const [selectedDate, setSelectedDate] = useState(null); // Stores the currently clicked date
  const [isLoading, setIsLoading] = useState(false); // Store the state of spinner
  const navigate = useNavigate();
  const toast = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      //toast.error("Please upload a CSV file");
      toast.closeAll();
      toast({
        title: "Error Uploading",
        description: `Please upload a CSV file` /*To change this */,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.closeAll();
        toast({
          title: "File uploaded successfully!",
          description: data.message || "File uploaded successfully",
          status: "success",
          duration: 10000,
          isClosable: true,
        });
      } else {
        toast.closeAll();
        toast({
          title: "Error Uploading",
          description: data.error || "Error uploading file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
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

  const getForecast = async (startDate, days) => {
    try {
      const response = await fetch('http://localhost:5000/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start_date: startDate, days: days }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.closeAll();
        toast({
          title: "Schedule Forcasted Successfully",
          description: " ",
          status: "success",
          duration: 10000,
          isClosable: true,
        });
      } else {
        toast.closeAll();
        toast({
          title: "Error",
          description: "Error Fetching Forecast",
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

  const handleForecastRequest = async (e) => {
    const startDate = "2025-01-01";
    const currentDate = new Date().toISOString().split('T')[0];
    const days = 365;

    setIsLoading(true);
    try {
      await getForecast(currentDate, days);
    } catch (error) {
      console.error("Error fetching forecast:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Function to extract and format events for all trains
    const loadAllTrainEvents = () => {
      try {
        let allEvents = [];
        detailed_schedule.forEach((schedule, scheduleIndex) => {
          if (!schedule.date || !Array.isArray(schedule.tasks)) {
            console.error(`Invalid schedule structure at index ${scheduleIndex}:`, schedule);
            return;
          }
          schedule.tasks.forEach((task, taskIndex) => {
            if (!task.trainNo || !task.maintenanceType) {
              console.error(`Invalid task structure at schedule ${scheduleIndex}, task ${taskIndex}:`, task);
              return;
            }

            allEvents.push({
              eventId: `${task.trainNo}-${task.maintenanceType}-${schedule.date}`,
              trainNo: task.trainNo,
              eventName: `${task.maintenanceType} Maintenance`,
              date: schedule.date,
            });
          });
        });
        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to load schedule data:", error);
      }
    };
    loadAllTrainEvents();

  }, []);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const formattedDate = date.toLocaleDateString("en-CA"); // this is in yyyy-mm-dd
    return events.filter((event) => {
      return event.date === formattedDate;
    });
  };

  // Simplified tileContent to only show red dots for events
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        return (
          <div
            className="event-indicator"
            style={{
              backgroundColor: "red", // Red for all events
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              position: "absolute",
              bottom: "5px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            aria-label={`Events available on ${date.toDateString()}`}
          ></div>
        );
      }
    }
    return null;
  };

  // Handle clicking on a date
  const handleDateClick = (date) => {
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const dayEvents = getEventsForDate(normalizedDate);
    setSelectedDate(dayEvents.length > 0 ? date : null);
    //console.log(`Now Selected Date:, ${selectedDate}`)
    if (dayEvents.length > 0) {
      toast({
        title: "Maintenance Date Selected",
        description: "Would you like to take action for the maintenance?",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top",
        render: () => (
          <>
            {/* Backdrop */}
            <Box
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="rgba(0, 0, 0, 0.4)" // Grey shadow behind the box
              zIndex="999" // Ensures the backdrop appears behind the content
            />

            {/* Main Box (Toast Content) */}
            <Box
              position="fixed" // Ensure the box is positioned relative to the entire webpage
              top="50%" // Center vertically
              left="50%" // Center horizontally
              transform="translate(-50%, -50%)" // Adjust positioning to account for box dimensions
              width="90vw"
              p={6}
              borderRadius="lg"
              shadow="md"
              textAlign="center"
              bg="white"
              zIndex="1000" // Ensures the box appears above other content
              maxHeight="600px"
              overflowY="auto"
            >
              {dayEvents && dayEvents.length > 0 ? (
                dayEvents.map((event, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderRadius="lg"
                    boxShadow="xl"
                    mb={4}
                    _hover={{ boxShadow: "2xl", transform: "scale(1.02)" }} // Hover effect for interactivity
                    transition="all 0.3s ease-in-out"
                    bg="gray.50"
                    maxHeight="100%"
                    overflowY="auto"
                  >
                    <VStack align="start" spacing={3} maxHeight="100%" overflowY="auto" width="100%">
                      <HStack spacing={3} align="center">
                        <Text fontWeight="bold" fontSize="lg">
                          Event ID:
                        </Text>
                        <Text fontWeight="semibold" color="gray.700">
                          {event.eventId}
                        </Text>
                      </HStack>
                      <HStack spacing={3} align="center">
                        <Text fontWeight="bold" fontSize="lg">
                          Train No:
                        </Text>
                        <Text color="gray.600">{event.trainNo}</Text>
                      </HStack>
                      <HStack spacing={3} align="center">
                        <Text fontWeight="bold" fontSize="lg">
                          Event Name:
                        </Text>
                        <Text color="gray.600">{event.eventName}</Text>
                      </HStack>
                      <HStack spacing={3} align="center">
                        <Text fontWeight="bold" fontSize="lg">
                          Date:
                        </Text>
                        <Text color="gray.600">{event.date}</Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))
              ) : (
                <Text>No events found</Text>
              )}
              <CloseButton
                position="absolute"
                top="8px"
                right="8px"
                onClick={() => toast.closeAll()} // Close the toast or implement custom close logic
              />
              <Text fontWeight="bold" mb={4} fontSize="lg">
                Maintenance Options
              </Text>
              <Button
                bgGradient="linear(to-r, purple.400, purple.600)" // Purple gradient for Keep Schedule
                color="white" // Ensures text color is white on gradient
                onClick={() => handleKeepSchedule(date, dayEvents)}
                mr={2}
              >
                Keep Schedule
              </Button>

              <Button
                bgGradient="linear(to-r, red.400, red.600)" // Red gradient for Reschedule
                color="white" // Ensures text color is white on gradient
                onClick={() => handleReschedule(date, dayEvents)}
              >
                Reschedule
              </Button>
            </Box>
          </>
        ),
      });
    }
  };

  // Handle keeping the original schedule
  const handleKeepSchedule = (date, events) => {
    if (!events || events.length === 0) {
      console.error("No events found for the selected date.");
      return;
    }

    toast.closeAll();
    toast({
      title: "Original Schedule Kept",
      description: `Schedule for ${date} remains unchanged.` /*To change this */,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle rescheduling
  const handleReschedule = (date, events) => {
    if (!events || events.length === 0) {
      console.error("No events found for the selected date.");
      return;
    }

    toast.closeAll();
    toast({
      title: "Reschedule Maintenance",
      description: "Redirecting to reschedule page...",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    console.log(events);
    navigate(`/Maintenance/${date}`, { state: { events } });
  };

  // Generate an array of months for the year
  const months = Array.from(
    { length: 12 },
    (_, index) => new Date(2025, index, 1)
  );

  return (
    <>
      <NavBar />
      <Center minHeight="100vh">
        <Box width="98%" maxWidth="2000px" p={4}>
          <Heading as="h1" size="2xl" textAlign="center" mb={6}>
            Year-Long Maintenance Calendar
          </Heading>
          <Box
            border="1px solid #ddd"
            borderRadius="lg"
            p={2}
            display='flex'
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Heading as="h3" size="md" textAlign="left" mb={4}>
                Upload Daily Mileage
              </Heading>
              <form onSubmit={handleSubmit}>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#f0f0f0",
                    color: "#000",
                    padding: "3px 5px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e0e0e0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f0f0f0";
                  }}
                >
                  Upload CSV File
                </button>
              </form>
            </Box>
            <Button
              type="button"
              onClick={handleForecastRequest}
              style={{
                backgroundColor: "#f0f0f0",
                color: "#000",
                padding: "3px 50px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#e0e0e0";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f0f0f0";
              }}
            >
              Forecast
            </Button>
            {isLoading && (
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                bg="rgba(255, 255, 255, 0.7)"
              >
                <Spinner size="lg" />
              </Box>
            )}
          </Box>
          <Heading as="h3" size="md" textAlign="left" mb={4}>

          </Heading>
          <Grid templateColumns="repeat(4, 1fr)" gap={4} width="100%">
            {months.map((monthStart, index) => (
              <Box
                key={index}
                border="1px solid #ddd"
                borderRadius="lg"
                p={2}
                backgroundColor="#f9f9f9"
                boxShadow="md"
                display="flex"
                flexDirection="column"
                alignItems="center"
                style={{ maxWidth: "350px" }}
              >
                <Heading as="h3" size="md" textAlign="center" mb={4}>
                  {monthStart.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Heading>
                <Calendar
                  tileContent={tileContent}
                  onClickDay={handleDateClick} // Handle date clicks here
                  activeStartDate={monthStart}
                  minDate={new Date("2025-01-01")}
                  maxDate={new Date("2025-12-31")}
                  showNavigation={false}
                  tileClassName="custom-tile"
                />
              </Box>
            ))}
          </Grid>
        </Box>
      </Center>
    </>
  );
};

export default PM;