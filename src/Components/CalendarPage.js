// CalendarPage.js
import React, { useState } from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import Calendar from 'react-calendar'; // Install this with npm install react-calendar
import 'react-calendar/dist/Calendar.css';

const CalendarPage = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onDateSelect(date); // Pass the selected date back to the parent
  };

  return (
    <VStack spacing={6} p={5} bgGradient="linear(to-br, gray.100, white)" minHeight="100vh">
      <Heading size="lg" color="teal.600">
        Select a Date for Maintenance Scheduling
      </Heading>

      <Box bg="white" p={5} shadow="md" borderWidth="1px" borderRadius="lg">
        <Calendar
          value={selectedDate}
          onChange={handleDateClick}
          className="react-calendar"
        />
      </Box>

      <Text fontSize="lg" color="gray.600">
        Please click on a date to proceed.
      </Text>
    </VStack>
  );
};

export default CalendarPage;
