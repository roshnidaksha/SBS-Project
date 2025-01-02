import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Heading,
  Center,
  Button,
  Text,
  useToast,
  CloseButton,
} from "@chakra-ui/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Default styles for react-calendar
import trainData from "../DataFiles/train_data.json"; // Importing train data from one level up
import NavBar from "../NavBar";
import "../styles/PM.css"; // Import custom CSS for tile styling
import { useNavigate } from "react-router-dom";
import Maintenance from "./Maintenance";

const PM = () => {
  const [events, setEvents] = useState([]); // Stores list of maintenance events for selected train
  const [selectedDate, setSelectedDate] = useState(null); // Stores the currently clicked date
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Function to extract and format events for all trains
    const loadAllTrainEvents = () => {
      try {
        let allEvents = [];
        trainData.trains.forEach((train) => {
          for (const [maintenanceType, schedules] of Object.entries(
            train.maintenanceSchedules
          )) {
            schedules.forEach((schedule) => {
              allEvents.push({
                eventId: `${train.trainNo}-${maintenanceType}-${schedule.date}`,
                trainNo: train.trainNo,
                eventName: `${maintenanceType} Maintenance`,
                date: schedule.date,
              });
            });
          }
        });
        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to load train data:", error);
      }
    };
    loadAllTrainEvents();
  }, []);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const formattedDate = date.toLocaleDateString('en-CA'); // this is in yyyy-mm-dd
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
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
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
          <Box
            position="fixed" // Ensure the box is positioned relative to the entire webpage
            top="50%" // Center vertically
            left="50%" // Center horizontally
            transform="translate(-50%, -50%)" // Adjust positioning to account for box dimensions
            width="400px"
            p={6}
            borderRadius="lg"
            shadow="md"
            textAlign="center"
            bg="white"
          >
            <CloseButton
              position="absolute"
              top="8px"
              right="8px"
              onClick={() => toast.closeAll()} // Close the toast or implement custom close logic
            />
            <Text fontWeight="bold">Maintenance Options</Text>
            <Button
              colorScheme="green"
              onClick={() => handleKeepSchedule(date, dayEvents)}
              mr={2}
            >
              Keep Schedule
            </Button>
            <Button
              colorScheme="red"
              onClick={() => handleReschedule(date, dayEvents)}
            >
              Reschedule
            </Button>
          </Box>
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
      description: `Schedule for ${date} remains unchanged.`, /*To change this */
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