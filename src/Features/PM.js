import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Heading,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Default styles for react-calendar
import trainData from "../data/train_data.json"; // Importing train data from one level up
import NavBar from "../NavBar";
import "./PM.css"; // Import custom CSS for tile styling

const PM = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // New state for selected event
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state
  const [trainNo, setTrainNo] = useState("PV01"); // Set default train No to PV01

  useEffect(() => {
    // Function to extract and format events for a specific train
    const loadTrainEvents = (trainNo) => {
      const train = trainData.trains.find((t) => t.trainNo === trainNo);
      if (train) {
        let events = [];
        // Loop through all maintenance types (E1, E2, etc.)
        for (const [maintenanceType, schedules] of Object.entries(
          train.maintenanceSchedules
        )) {
          schedules.forEach((schedule) => {
            events.push({
              eventId: `${trainNo}-${maintenanceType}-${schedule.date}`,
              eventName: `${maintenanceType} Maintenance`,
              eventDescription: `Scheduled maintenance for ${maintenanceType}`,
              dates: [schedule.date],
              color: "#FF6347", // Color for event indicator (you can customize this)
            });
          });
        }
        setEvents(events); // Set the events in state
      }
    };
    console.log(events);
    // Load events for the selected train
    loadTrainEvents(trainNo);
  }, [trainNo]); // Re-run whenever trainNo changes

  // Function to get events for a date
  const getEventForDate = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return events.filter((event) => event.dates.includes(formattedDate));
  };

  // Custom tile content based on events
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = getEventForDate(date);
      return dayEvents.map((event) => (
        <div
          key={event.eventId}
          className="event-indicator"
          style={{
            backgroundColor: event.color,
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            margin: "2px auto",
          }}
          title={event.eventName}
          onClick={() => handleEventClick(event)} // Open modal on click
        ></div>
      ));
    }
    return null;
  };

  // Handle click on event
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true); // Open the modal with event details
  };

  // Generate an array of months for the year
  const months = Array.from(
    { length: 12 },
    (_, index) => new Date(2024, index, 1)
  );

  return (
    <>
      <NavBar />
      <Center minHeight="100vh">
        <Box width="98%" maxWidth="2000px" p={4}>
          <Heading as="h1" size="2xl" textAlign="center" mb={6}>
            Year-Long Maintenance Calendar for {trainNo}
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
                  activeStartDate={monthStart}
                  minDate={new Date("2024-01-01")}
                  maxDate={new Date("2024-12-31")}
                  showNavigation={false}
                  tileClassName="custom-tile"
                />
              </Box>
            ))}
          </Grid>
        </Box>
      </Center>

      {/* Modal to display event details */}
      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedEvent.eventName}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <Heading as="h4" size="md" mb={2}>
                  Description:
                </Heading>
                <p>{selectedEvent.eventDescription}</p>
                <Heading as="h4" size="md" mb={2}>
                  Date(s):
                </Heading>
                <p>{selectedEvent.dates.join(", ")}</p>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default PM;
