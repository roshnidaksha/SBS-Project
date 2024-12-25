import NavBar from "../NavBar";
import React, { useState, useEffect } from 'react';
import {
  Table,
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
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import "./FinancialManagement.css"

const maintenancePackages = [
  { name: 'E1', kilometers: 10800, manhours_required: 10 },
  { name: 'E2', kilometers: 32500, manhours_required: 18.1 },
  { name: 'E3', kilometers: 65000, manhours_required: 33.4 },
  { name: 'E4', kilometers: 130000, manhours_required: 135.2 },
  { name: 'E5', kilometers: 325000, manhours_required: 250 },
  { name: 'MinOH', kilometers: 650000, manhours_required: 800 },
  { name: 'MajOH', kilometers: 975000, manhours_required: 2400 },
];

const maintenanceSchedule = [
  { train: 'PV01', activity: 'E1', track: 'E5', date: '25-12-2024' },
  { train: 'PV01', activity: 'E2', track: 'E2', date: '26-12-2024' }, // Rule: If E2 happens, E1 happens.
  { train: 'PV02', activity: 'E1', track: 'E3', date: '28-12-2024' },
  { train: 'PV02', activity: 'E2', track: 'E6', date: '29-12-2024' },
  { train: 'PV02', activity: 'E3', track: 'W2', date: '30-12-2024' }, // Rule: If E3 happens, E1 and E2 happen.
  { train: 'PV03', activity: 'E1', track: 'E4', date: '05-01-2025' },
  { train: 'PV03', activity: 'E2', track: 'E1', date: '06-01-2025' },
  { train: 'PV03', activity: 'E3', track: 'W3', date: '07-01-2025' },
  { train: 'PV03', activity: 'E4', track: 'W2', date: '08-01-2025' }, // Rule: If E4 happens, E1, E2, and E3 happen.
  { train: 'PV04', activity: 'minOH', track: 'W1', date: '15-01-2025' }, // Rule: MinOH in W1-W4 only.
  { train: 'PV05', activity: 'majOH', track: 'W3', date: '22-01-2025' }, // Rule: MajOH in W1-W4 only.
  { train: 'PV06', activity: 'E1', track: 'E3', date: '01-02-2025' },
  { train: 'PV06', activity: 'E2', track: 'E6', date: '02-02-2025' },
  { train: 'PV06', activity: 'E3', track: 'E1', date: '03-02-2025' },
  { train: 'PV07', activity: 'E5', track: 'W4', date: '10-02-2025' }, // Less frequent for E5.
  { train: 'PV08', activity: 'E1', track: 'E2', date: '20-02-2025' },
  { train: 'PV08', activity: 'E2', track: 'E4', date: '21-02-2025' },
  { train: 'PV09', activity: 'E1', track: 'E5', date: '01-03-2025' },
  { train: 'PV09', activity: 'E2', track: 'E3', date: '02-03-2025' },
  { train: 'PV10', activity: 'E1', track: 'E4', date: '10-03-2025' },
  { train: 'PV10', activity: 'E2', track: 'E2', date: '11-03-2025' },
  { train: 'PV10', activity: 'E3', track: 'E7', date: '12-03-2025' },
  { train: 'PV10', activity: 'E4', track: 'W1', date: '13-03-2025' },
  { train: 'PV11', activity: 'minOH', track: 'W2', date: '20-03-2025' },
  { train: 'PV12', activity: 'majOH', track: 'W4', date: '28-03-2025' }
];

const sparePartsData = [
  { id: 1, name: "Brake Pads", cost: 25.5, forecast: 70 },
  { id: 2, name: "Oil Filters", cost: 12.3, forecast: 50 },
  { id: 3, name: "Tires", cost: 50.0, forecast: 40 },
  { id: 4, name: "Air Filters", cost: 18.5, forecast: 60 },
  { id: 5, name: "Fuel Pumps", cost: 120.7, forecast: 45 },
  { id: 6, name: "Radiators", cost: 200.0, forecast: 80 },
  { id: 7, name: "Headlights", cost: 35.0, forecast: 35 },
  { id: 8, name: "Shock Absorbers", cost: 75.0, forecast: 70 },
  { id: 9, name: "Exhaust Pipes", cost: 40.0, forecast: 30 },
  { id: 10, name: "Brake Fluid", cost: 10.2, forecast: 55 },
];

const FinancialManagement = () => {
  const [editIndex, setEditIndex] = useState(null);
  const [tempData, setTempData] = useState({});
  const [data, setData] = useState(maintenancePackages);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [totalManHours, setTotalManHours] = useState(0);

  const [spareParts, setSpareParts] = useState(sparePartsData);
  const [editPartIndex, setEditPartIndex] = useState(null);
  const [tempPartData, setTempPartData] = useState({});

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Manhours',
      data: [],
      borderColor: 'rgba(75,192,192,1)',
      fill: false,
    }]
  });

  const handlePartEditClick = (index) => {
    setEditPartIndex(index);
    setTempPartData({ ...spareParts[index] });
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setTempData({ ...data[index] });
  };

  const handlePartInputChange = (field, value) => {
    setTempPartData({ ...tempPartData, [field]: value });
  };

  const handleInputChange = (field, value) => {
    setTempData({ ...tempData, [field]: value });
  };

  const handlePartUpdateClick = () => {
    const updatedParts = [...spareParts];
    updatedParts[editPartIndex] = { ...tempPartData };
    setSpareParts(updatedParts);
    setEditPartIndex(null);
  };

  const handleUpdateClick = () => {
    const updatedData = [...data];
    updatedData[editIndex] = { ...tempData };
    setData(updatedData);
    setEditIndex(null);
  };

  const convertToDate = (dateStr) => {
    const parts = dateStr.split('-');
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
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
      schedule.forEach(item => {
        const formattedDate = formatDate(item.date, period);
        const manhours = manhoursMap[item.activity] || 0;
        totalManHours += manhours;

        if (!periodMap[formattedDate]) {
          periodMap[formattedDate] = 0;
        }
        periodMap[formattedDate] += manhours;

        if (!allDates.includes(formattedDate)) {
          allDates.push(formattedDate);
        }
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

      return { periodMap, labels: generatedDates };
    };

    const { periodMap, labels } = calculateTotalManhours(maintenanceSchedule, timePeriod);

    const data = labels.map(label => {
      const totalManhours = periodMap[label] || 0; // Get the value from the period map or 0 if not found
      console.log(`Label: ${label}, Total Manhours: ${totalManhours}`);
      return totalManhours;
    });

    setChartData({
      labels: labels,
      datasets: [{
        label: 'Total Manhours',
        data: data,
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      }]
    });
  }, [maintenanceSchedule, maintenancePackages, timePeriod]);

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
                            handleInputChange("name", e.target.value)
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
                            handleInputChange("kilometers", e.target.value)
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
                            handleInputChange("manhours_required", e.target.value)
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
                            onClick={handleUpdateClick}
                            mr={2}
                          >
                            Update
                          </Button>
                        </>
                      ) : (
                        <Button
                          colorScheme="teal"
                          size="sm"
                          onClick={() => handleEditClick(index)}
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

            <Box className="total-manhours-box" mb={6}>
              <Heading color='#34495e' fontSize='1em' textAlign='center'>
                Total Manhours: {totalManHours}
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

            <Box className="total-manhours-box" mb={6}>
              <Heading color='#34495e' fontSize='1em' textAlign='center'>
                Total Cost Required for Spare Parts: {totalManHours}
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

            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={4}>
              <Box overflowX="auto" overflowY="auto" maxHeight="400px" maxWidth="50%" marginBottom="20px">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>Cost</Th>
                      <Th>Forecast</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {spareParts.map((part, index) => (
                      <Tr key={index}>
                        <Td>{part.id}</Td>
                        <Td>
                          {editPartIndex === index ? (
                            <Input
                              value={tempPartData.name}
                              onChange={(e) =>
                                handlePartInputChange("name", e.target.value)
                              }
                            />
                          ) : (
                            part.name
                          )}
                        </Td>
                        <Td>
                          {editPartIndex === index ? (
                            <Input
                              type="number"
                              value={tempPartData.cost}
                              onChange={(e) =>
                                handlePartInputChange("cost", e.target.value)
                              }
                            />
                          ) : (
                            part.cost
                          )}
                        </Td>
                        <Td>
                          {editPartIndex === index ? (
                            <Input
                              type="number"
                              value={tempPartData.forecast}
                              onChange={(e) =>
                                handlePartInputChange("forecast", e.target.value)
                              }
                            />
                          ) : (
                            part.forecast
                          )}
                        </Td>
                        <Td>
                          {editPartIndex === index ? (
                            <Button
                              colorScheme="blue"
                              size="sm"
                              onClick={handlePartUpdateClick}
                              mr={2}
                            >
                              Update
                            </Button>
                          ) : (
                            <Button
                              colorScheme="teal"
                              size="sm"
                              onClick={() => handlePartEditClick(index)}
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

              {/* Line Chart for Total Manhours */}
              <Box className="chart-container">
                <Line data={chartData} />
              </Box>
            </Box>
          </Box>

        </Box>
      </ChakraProvider>
    </>
  );
};

export default FinancialManagement;
