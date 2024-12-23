import NavBar from "../NavBar";
import React, { useState, useEffect } from "react";
import {
  Box,
  Alert,
  AlertIcon,
  Text,
  Button,
  Flex,
  VStack,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatArrow,
  StatLabel,
  StatNumber,
  StatHelpText,
  TableContainer,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import Calendar from "react-calendar"; // Assuming you have a library for calendar
import "react-calendar/dist/Calendar.css";
import "./inventorystyles.css"; // Custom CSS for the half-circle dials

// Mock inventory data (Replace with API calls later)
const mockInventoryData = [
  { id: 1, name: "Brake Pads", stockLevel: 50, forecast: 70, leadTime: 10 },
  { id: 2, name: "Oil Filters", stockLevel: 30, forecast: 50, leadTime: 5 },
  { id: 3, name: "Tires", stockLevel: 20, forecast: 40, leadTime: 15 },
  { id: 4, name: "Air Filters", stockLevel: 40, forecast: 60, leadTime: 7 },
  { id: 5, name: "Fuel Pumps", stockLevel: 15, forecast: 45, leadTime: 12 },
  { id: 6, name: "Radiators", stockLevel: 70, forecast: 80, leadTime: 10 },
  { id: 7, name: "Headlights", stockLevel: 25, forecast: 35, leadTime: 6 },
  {
    id: 8,
    name: "Shock Absorbers",
    stockLevel: 60,
    forecast: 70,
    leadTime: 14,
  },
  { id: 9, name: "Exhaust Pipes", stockLevel: 10, forecast: 30, leadTime: 5 },
  { id: 10, name: "Brake Fluid", stockLevel: 40, forecast: 55, leadTime: 8 },
];

// Calculate shortfalls
const calculateShortfalls = (inventory) => {
  return inventory.map((item) => {
    const shortfall = item.forecast - item.stockLevel;
    return { ...item, shortfall: shortfall > 0 ? shortfall : 0 };
  });
};

const Inventory = () => {
  const [inventory, setInventory] = useState(mockInventoryData);
  const [alert, setAlert] = useState(null);

  // Calculate shortfalls and check for alerts
  const inventoryWithShortfalls = calculateShortfalls(inventory);

  useEffect(() => {
    const shortfallItems = inventoryWithShortfalls.filter(
      (item) => item.shortfall > 0
    );
    if (shortfallItems.length > 0) {
      setAlert(`Warning: ${shortfallItems.length} items are running low!`);
    } else {
      setAlert(null);
    }
  }, [inventoryWithShortfalls]);

  // Responsive chart height
  const chartHeight = useBreakpointValue({ base: 200, md: 300 });

  // Bar chart data for 10 components
  const chartData = inventory.map((item) => ({
    name: item.name,
    stockLevel: item.stockLevel,
    forecast: item.forecast,
  }));

  // Mock purchasing data (for 10 components over time)
  const purchasingData = [
    {
      name: "2024-01",
      ...inventory.reduce(
        (acc, item) => ({
          ...acc,
          [item.name]: Math.floor(Math.random() * 20),
        }),
        {}
      ),
    },
    {
      name: "2024-02",
      ...inventory.reduce(
        (acc, item) => ({
          ...acc,
          [item.name]: Math.floor(Math.random() * 20),
        }),
        {}
      ),
    },
    {
      name: "2024-03",
      ...inventory.reduce(
        (acc, item) => ({
          ...acc,
          [item.name]: Math.floor(Math.random() * 20),
        }),
        {}
      ),
    },
    {
      name: "2024-04",
      ...inventory.reduce(
        (acc, item) => ({
          ...acc,
          [item.name]: Math.floor(Math.random() * 20),
        }),
        {}
      ),
    },
    {
      name: "2024-05",
      ...inventory.reduce(
        (acc, item) => ({
          ...acc,
          [item.name]: Math.floor(Math.random() * 20),
        }),
        {}
      ),
    },
  ];

  return (
    <>
      <NavBar />
      <VStack spacing={8} align="stretch">
        {/* Inventory Summary - Top Row with 10 Cards */}
        <Box p={5} borderWidth={1} borderRadius="lg" width="full">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Inventory Summary
          </Text>
          <Flex justify="space-between">
            <SimpleGrid columns={4} spacing={4} flex="1">
              {inventoryWithShortfalls.map((item) => (
                <Stat key={item.id}>
                  <StatLabel>{item.name}</StatLabel>
                  <StatNumber>{item.stockLevel}</StatNumber>
                  <StatHelpText>
                    {item.shortfall > 0 ? (
                      <>
                        <StatArrow type="decrease" />
                        Shortfall: {item.shortfall}
                      </>
                    ) : (
                      <StatArrow type="increase" />
                    )}
                  </StatHelpText>
                </Stat>
              ))}
            </SimpleGrid>

            {/* Summary Table on the Right */}
            <TableContainer width="35%" ml={6}>
              <Table variant="simple" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>Metric</Th>
                    <Th>Value</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Total Stock</Td>
                    <Td>
                      {inventory.reduce(
                        (acc, item) => acc + item.stockLevel,
                        0
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Total Shortfall</Td>
                    <Td>
                      {inventoryWithShortfalls.reduce(
                        (acc, item) => acc + item.shortfall,
                        0
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Average Lead Time</Td>
                    <Td>
                      {(
                        inventory.reduce(
                          (acc, item) => acc + item.leadTime,
                          0
                        ) / inventory.length
                      ).toFixed(1)}{" "}
                      days
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        </Box>

        {/* Bar Chart & Low Stock Table */}
        <Box p={5} borderWidth={1} borderRadius="lg" width="full">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Stock Levels & Shortfalls
          </Text>
          <Flex justify="space-between">
            {/* Bar Chart for Inventory Stock & Forecast */}
            <ResponsiveContainer width="60%" height={chartHeight}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stockLevel" fill="#8884d8" />
                <Bar dataKey="forecast" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>

            {/* Table on the Right of Bar Chart */}
            <TableContainer width="35%" ml={6}>
              <Table variant="simple" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>Item</Th>
                    <Th>Stock Level</Th>
                    <Th>Forecast</Th>
                    <Th>Shortfall</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inventoryWithShortfalls.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.name}</Td>
                      <Td>{item.stockLevel}</Td>
                      <Td>{item.forecast}</Td>
                      <Td>{item.shortfall}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        </Box>

        {/* Calendar View with Heatmap & Alerts */}
        <Box p={5} borderWidth={1} borderRadius="lg" width="full">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Sales Calendar & Heatmap
          </Text>
          <Flex direction="column" gap={6}>
            <Box>
              <Calendar
                // Pass relevant sales data here for highlighting
                tileClassName={({ date, view }) => {
                  const tileDate = date.getDate();
                  const isLowStock = inventory.some(
                    (item) => item.stockLevel <= item.forecast * 0.2
                  );
                  return isLowStock ? "highlight-low-stock" : "";
                }}
              />
            </Box>
            {alert && (
              <Alert status="error">
                <AlertIcon />
                {alert}
              </Alert>
            )}
          </Flex>
        </Box>

        {/* Stick Purchasing Trend */}
        <Box p={5} borderWidth={1} borderRadius="lg" width="full">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Stick Purchasing Trend for Components
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={purchasingData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {inventory.map((item) => (
                <Line
                  key={item.id}
                  type="monotone"
                  dataKey={item.name}
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Button to trigger a manual inventory update */}
        <Button
          colorScheme="teal"
          size="lg"
          onClick={() => alert("Inventory Updated!")}
          mt={8}
        >
          Update Inventory
        </Button>
      </VStack>
    </>
  );
};

export default Inventory;
