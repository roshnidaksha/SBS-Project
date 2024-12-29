import NavBar from "../NavBar";
import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  SimpleGrid,
  useDisclosure,
  Table,
  Text,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Box,
  Heading,
  FormLabel,
  Select,
  ChakraProvider,
} from "@chakra-ui/react";
import { Bar, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import "./FinancialManagement.css"

import train_data_forecast from '../data/train_data_forecast.json'
import sparePartsData from '../data/spare_parts_data.json'

const maintenancePackages = [
  { name: 'E1', kilometers: 10800, manhours_required: 10 },
  { name: 'E2', kilometers: 32500, manhours_required: 18.1 },
  { name: 'E3', kilometers: 65000, manhours_required: 33.4 },
  { name: 'E4', kilometers: 130000, manhours_required: 135.2 },
  { name: 'E5', kilometers: 325000, manhours_required: 250 },
  { name: 'MinOH', kilometers: 650000, manhours_required: 800 },
  { name: 'MajOH', kilometers: 975000, manhours_required: 2400 },
];

const FinancialManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState(maintenancePackages);
  const [editIndex, setEditIndex] = useState(null);
  const [tempData, setTempData] = useState({});
  const [budgetMetrics, setBudgetMetrics] = useState([]);

  const [timePeriod, setTimePeriod] = useState('weekly');
  const [totalManHours, setTotalManHours] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const [cumulativeCostData, setCumulativeCostData] = useState({
    labels: [],
    datasets: [{
      label: 'Spare Parts Costs',
      data: [],
      borderColor: 'rgba(75,192,192,1)',
      fill: false,
    }]
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Manhours',
      data: [],
      borderColor: 'rgba(75,192,192,1)',
      fill: false,
    }]
  });

  const [historicalDataChart, setHistoricalDataChart] = useState({
    labels: [],
    datasets: [{
      label: 'Order Quantity',
      data: [],
      backgroundColor: 'rgba(75,192,192,0.6)',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1,
    }],
  })

  const [selectedMetric, setSelectedMetric] = useState(null);
  const handleCardClick = (metric) => {
    setSelectedMetric(metric);
    onOpen();
    aggregateHistoricalData(metric);
  };

  const aggregateHistoricalData = (metric) => {
    const historicalData = metric.last_4_quarters_order_quantity;
    if (historicalData) {
      // console.log('historical data:', historicalData);
      const sortedDates = Object.keys(historicalData).sort((a, b) => new Date(a) - new Date(b));
      const orderQuantities = sortedDates.map((date) => historicalData[date]);

      setHistoricalDataChart({
        labels: sortedDates.map((date) => new Date(date).toLocaleDateString()),
        datasets: [{
          label: 'Order Quantity',
          data: orderQuantities,
          backgroundColor: 'rgba(75,192,192,0.6)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        }],
      });
    }
  };

  const handleEditClick = (type, index) => {
    if (type === "package") {
      setEditIndex(index);
      setTempData({ ...data[index] });
    }
  };

  const handleInputChange = (type, field, value) => {
    if (type === "package") {
      setTempData({ ...tempData, [field]: value });
    }
  };

  const handleUpdateClick = (type) => {
    if (type === "package") {
      const updatedData = [...data];
      updatedData[editIndex] = { ...tempData };
      setData(updatedData);
      setEditIndex(null);
    }
  };

  const convertToDate = (dateStr) => {
    const parts = dateStr.split('-');
    return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
  };

  const formatDate = (date, format) => {
    const d = convertToDate(date);
    if (isNaN(d.getTime())) {
      console.error('Invalid Date:', date);
      return null;
    }

    if (format === 'weekly') {
      const startOfWeek = d.getDate() - d.getDay();
      d.setDate(startOfWeek);
    } else if (format === 'monthly') {
      d.setDate(1);
    } else if (format === 'yearly') {
      d.setMonth(0);
      d.setDate(1);
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    const manhoursMap = maintenancePackages.reduce((acc, packageItem) => {
      acc[packageItem.name] = packageItem.manhours_required;
      return acc;
    }, {});

    const calculateTotalManhours = (schedule, period) => {
      const periodMap = {};
      const allDates = [];
      let totalManHours = 0;
      schedule.forEach(train => {
        Object.entries(train.maintenanceSchedules).forEach(([activity, schedules]) => {
          schedules.forEach(scheduleItem => {
            const formattedDate = formatDate(scheduleItem.date, period);
            const manhours = manhoursMap[activity] || 0;
            totalManHours += manhours;

            if (!periodMap[formattedDate]) {
              periodMap[formattedDate] = 0;
            }
            periodMap[formattedDate] += manhours;

            if (!allDates.includes(formattedDate)) {
              allDates.push(formattedDate);
            }
          });
        });
      });

      setTotalManHours(totalManHours);
      const sortedDates = allDates.sort((a, b) => new Date(a) - new Date(b));

      const generatedDates = [];
      const startDate = new Date(sortedDates[0]);
      const endDate = new Date(sortedDates[sortedDates.length - 1]);

      for (let d = new Date(startDate); d <= endDate;) {
        const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        generatedDates.push(formattedDate);
        if (period === 'weekly') {
          d.setDate(d.getDate() + 7);
        } else if (period === 'monthly') {
          d.setMonth(d.getMonth() + 1);
        } else if (period === 'yearly') {
          d.setFullYear(d.getFullYear() + 1);
        }
      }

      generatedDates.forEach(date => {
        if (!periodMap[date]) {
          periodMap[date] = 0;
        }
      });

      return { manhourPeriodMap: periodMap, manhourLabels: generatedDates };
    };

    const calculateTotalCost = (sparePartsData, period) => {
      const periodMap = {};
      const allDates = [];
      let totalCost = 0;

      sparePartsData.forEach(part => {
        const { historical_data, cost } = part;

        if (historical_data && historical_data.last_4_quarters_order_quantity) {
          const historicalData = historical_data.last_4_quarters_order_quantity;

          Object.entries(historicalData).forEach(([date, quantity]) => {
            const formattedDate = formatDate(date, period);
            const partCost = quantity * cost;

            totalCost += partCost;

            if (!periodMap[formattedDate]) {
              periodMap[formattedDate] = 0;
            }

            periodMap[formattedDate] += partCost;

            if (!allDates.includes(formattedDate)) {
              allDates.push(formattedDate);
            }
          });
        } else {
          console.warn(`No historical data or missing last_4_quarters_order_quantity for part: ${part.name}`);
        }
      });
      setTotalCost(totalCost);

      const sortedDates = allDates.sort((a, b) => new Date(a) - new Date(b));

      const generatedDates = [];
      const startDate = new Date(sortedDates[0]);
      const endDate = new Date(sortedDates[sortedDates.length - 1]);

      for (let d = new Date(startDate); d <= endDate;) {
        const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        generatedDates.push(formattedDate);

        // Adjust date based on selected period
        if (period === 'weekly') {
          d.setDate(d.getDate() + 7); // Increment by 1 week
        } else if (period === 'monthly') {
          d.setMonth(d.getMonth() + 1); // Increment by 1 month
        } else if (period === 'yearly') {
          d.setFullYear(d.getFullYear() + 1); // Increment by 1 year
        }
      }

      generatedDates.forEach(date => {
        if (!periodMap[date]) {
          periodMap[date] = 0; // If no cost data, set cost to 0
        }
      });

      return { sparePartsPeriodMap: periodMap, sparePartsLabels: generatedDates };
    };

    // Manhour Chart
    if (train_data_forecast && Array.isArray(train_data_forecast.trains)) {
      const { manhourPeriodMap, manhourLabels } = calculateTotalManhours(train_data_forecast.trains, timePeriod);
      // console.log('manhourLabels:', manhourLabels);
      const manhourData = manhourLabels.map(label => {
        const totalManhours = manhourPeriodMap[label] || 0;
        // console.log(`Label: ${label}, Total Manhours: ${totalManhours}`);
        return totalManhours;
      });

      setChartData({
        labels: manhourLabels,
        datasets: [{
          label: 'Total Manhours',
          data: manhourData,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
        }]
      });
    }

    // Spare Parts Chart
    if (Array.isArray(sparePartsData)) {
      const { sparePartsPeriodMap, sparePartsLabels } = calculateTotalCost(sparePartsData, timePeriod);
      const sparePartsDataArray = sparePartsLabels.map(label => {
        const totalCost = sparePartsPeriodMap[label] || 0;
        // console.log(`Label: ${label}, Total Cost: ${totalCost}`);
        return totalCost;
      });

      setCumulativeCostData({
        labels: sparePartsLabels,
        datasets: [{
          label: 'Total Spare Parts Cost ($)',
          data: sparePartsDataArray,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
        }],
      });
    }

    const metrics = sparePartsData.map(part => {
      const { cost, shortfall, total_quantity_needed, quantity_in_stock } = part;
      const shortfallCost = shortfall > 0 ? shortfall * cost : 0;
      const stockValue = quantity_in_stock * cost;
      const projectedCost = total_quantity_needed * cost;

      return {
        name: part.Component,
        shortfall: part.shortfall,
        shortfallCost: shortfallCost.toFixed(2),
        quantity_in_stock: part.quantity_in_stock,
        stockValue: stockValue.toFixed(2),
        total_quantity_needed: part.total_quantity_needed,
        projectedCost: projectedCost.toFixed(2),
        cost: part.cost,
        leadTime: part.lead_time,
        last_4_quarters_order_quantity: part.historical_data.last_4_quarters_order_quantity,
      };
    });
    setBudgetMetrics(metrics);

  }, [train_data_forecast, maintenancePackages, timePeriod, sparePartsData]);

  return (
    <>
      <ChakraProvider>
        <NavBar />
        <Box className="financial-management">
          <Heading className="financial-management-heading">
            Financial & Budget Management
          </Heading>

          {/* Available Maintenance Packages */}
          <Box className="subtitle-container">
            <Heading className="subtitle-heading">
              Available Maintenance Packages
            </Heading>

            <Table className="maintenance-package-table">
              <Thead className="maintenance-package-thead">
                <Tr>
                  <Th>Package Name</Th>
                  <Th>Kilometers</Th>
                  <Th>Man-Hours Required</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>

              <Tbody>
                {data.map((packageItem, index) => (
                  <Tr key={index}>
                    <Td>
                      {editIndex === index ? (
                        <Input
                          className="table-input"
                          value={tempData.name}
                          onChange={(e) =>
                            handleInputChange("package", "name", e.target.value)
                          }
                        />
                      ) : (
                        packageItem.name
                      )}
                    </Td>

                    <Td>
                      {editIndex === index ? (
                        <Input
                          className="table-input"
                          type="number"
                          value={tempData.kilometers}
                          onChange={(e) =>
                            handleInputChange("package", "kilometers", e.target.value)
                          }
                        />
                      ) : (
                        packageItem.kilometers
                      )}
                    </Td>

                    <Td>
                      {editIndex === index ? (
                        <Input
                          className="table-input"
                          type="number"
                          value={tempData.manhours_required}
                          onChange={(e) =>
                            handleInputChange("package", "manhours_required", e.target.value)
                          }
                        />
                      ) : (
                        packageItem.manhours_required
                      )}
                    </Td>

                    <Td>
                      {editIndex === index ? (
                        <>
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={() => handleUpdateClick("package")}
                            mr={2}
                          >
                            Update
                          </Button>
                        </>
                      ) : (
                        <Button
                          colorScheme="teal"
                          size="sm"
                          onClick={() => handleEditClick("package", index)}
                        >
                          Edit
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Manhours Chart */}
          <Box className="subtitle-container">
            <Heading className="subtitle-heading">
              Manhour Chart
            </Heading>

            <Box
              bgGradient="linear(to-r, teal.400, blue.500)"
              p={4}
              borderRadius="md"
              shadow="md"
              textAlign="center"
              mb={6}
              marginTop={6}
            >
              <Heading
                color="white"
                fontSize="1.5em"
                fontWeight="bold"
              >
                Total Manhours: {Math.ceil(totalManHours)} hours
              </Heading>
            </Box>

            <FormLabel>Select Time Period: </FormLabel>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              size="md"
              width="auto"
              mb={4}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>

            {/* Line Chart for Total Manhours */}
            <Box className="chart-container">
              <Line data={chartData} />
            </Box>
          </Box>

          {/* Spare Parts */}
          <Box className="subtitle-container">
            <Heading className="subtitle-heading">
              Spare Parts Management
            </Heading>

            <Box
              bgGradient="linear(to-r, teal.400, blue.500)"
              p={4}
              borderRadius="md"
              shadow="md"
              textAlign="center"
              mb={6}
              marginTop={6}
            >
              <Heading
                color="white"
                fontSize="1.5em"
                fontWeight="bold"
              >
                Total Cost Required for Spare Parts: ${Math.ceil(totalCost)}
              </Heading>
            </Box>

            {/* Display Budget Metrics */}
            <Box className="subtitle-container">
              <Text color='#34495e' fontSize='1.2em' fontWeight='bold' mb={6}>Budget Metrics</Text>
              <Box overflowY="auto" maxHeight="50vh">
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}  // Adjust number of columns based on screen size
                  spacing={4}
                >
                  {budgetMetrics.map((metric, index) => (
                    <Box
                      key={index}
                      p={5}
                      bg="white"
                      borderRadius="md"
                      shadow="md"
                      border="1px solid #e2e8f0"
                      _hover={{ bg: "gray.100", cursor: "pointer" }}
                      onClick={() => handleCardClick(metric)}
                    >
                      <Text fontSize="xl" fontWeight="semibold" mb={2}>{metric.name}</Text>
                      <Text color="gray.600">Shortfall Cost: <Text as="span" color="red.500">${metric.shortfallCost}</Text></Text>
                      <Text color="gray.600">Total Stock Value: <Text as="span" color="green.500">${metric.stockValue}</Text></Text>
                      <Text color="gray.600">Projected Cost: <Text as="span" color="blue.500">${metric.projectedCost}</Text></Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Modal to show more details on click */}
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Budget Metrics Details:</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    {selectedMetric ? (
                      <Box>
                        <Text fontSize="xl" fontWeight="semibold">{selectedMetric.name}</Text>

                        <Text mt={2}><strong>Cost per Unit:</strong> ${selectedMetric.cost}</Text>
                        <Text mt={2}><strong>Quantity in Stock:</strong> {selectedMetric.quantity_in_stock}</Text>
                        <Text mt={2}><strong>Total Quantity Needed:</strong> {selectedMetric.total_quantity_needed}</Text>
                        <Text mt={2}><strong>Shortfall Quantity:</strong> {selectedMetric.shortfall}</Text>
                        <Text mt={2}><strong>Stock Value:</strong> ${selectedMetric.stockValue}</Text>
                        <Text mt={2}><strong>Projected Cost:</strong> ${selectedMetric.projectedCost}</Text>
                        <Text mt={2}><strong>Shortfall Cost:</strong> ${selectedMetric.shortfallCost}</Text>
                        <Text mt={2}><strong>Lead Time:</strong> {selectedMetric.leadTime} days</Text>

                        <Box mt={4}>
                          <Text fontWeight="bold">Order History:</Text>
                          <Bar data={historicalDataChart} />
                        </Box>
                      </Box>
                    ) : (
                      <Text>No metric selected.</Text>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="blue" onClick={onClose}>Close</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Box>

            <FormLabel>Select Time Period: </FormLabel>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              size="md"
              width="auto"
              mb={4}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>

            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={4}>
              <Box overflowX="auto" overflowY="auto" maxHeight="400px" maxWidth="50%" marginBottom="20px">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>Cost</Th>
                      <Th>Stock Quantity</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sparePartsData.map((part, index) => (
                      <Tr key={index}>
                        <Td>{part["WBS No."]}</Td>
                        <Td>{part.Component}</Td>
                        <Td>{part.cost}</Td>
                        <Td>{part.quantity_in_stock}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Line Chart for Total Manhours */}
              <Box className="chart-container">
                <Line data={cumulativeCostData} />
              </Box>
            </Box>
          </Box>

        </Box>
      </ChakraProvider>
    </>
  );
};

export default FinancialManagement;