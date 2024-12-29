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
  Checkbox,
  useBreakpointValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Select,
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
import sparePartsData from "../spare_parts_data.json"; // Assuming your data is in this file
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { width } from "@mui/system";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [alert, setAlert] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const chartHeight = useBreakpointValue({ base: 200, md: 300 });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [purchasingData, setPurchasingData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Track the selected item
  const [partsToReorder, setPartsToReorder] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Load inventory data (simulate API call)
    setInventory(sparePartsData); // Assuming sparePartsData is the data you want to load

    // Filter shortfall items
    const shortfallItems = sparePartsData.filter((item) => item.shortfall < 0);
    if (shortfallItems.length > 0) {
      setAlert(`Warning: ${shortfallItems.length} items are running low!`);
    } else {
      setAlert(null);
    }
  }, []);

  // Responsive chart height

  // Aggregate data by category
  const aggregateByCategory = () => {
    const aggregatedData = inventory.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = {
          name: category,
          quantity_in_stock: 0,
          total_quantity_needed: 0,
        };
      }
      acc[category].quantity_in_stock += item.quantity_in_stock;
      acc[category].total_quantity_needed += item.total_quantity_needed;
      return acc;
    }, {});

    // Convert the aggregated data into an array
    return Object.values(aggregatedData);
  };

  // Prepare chart data based on selected categories
  const chartData = aggregateByCategory().filter(
    (item) =>
      selectedCategories.length === 0 || selectedCategories.includes(item.name)
  );

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((cat) => cat !== category); // Remove category
      } else {
        return [...prev, category]; // Add category
      }
    });
  };

  const groupedInventory = inventory.reduce((acc, item) => {
    const { category, subcategory } = item;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item); // Add item to category
    return acc;
  }, {});
  useEffect(() => {
    if (!selectedCategory) {
      setPurchasingData([]); // Clear chart data if no category is selected
      return;
    }

    const flattenedInventory = inventory.flat();

    const limitedInventory = flattenedInventory.filter(
      (item) => item.category === selectedCategory
    );

    const transformedData = Object.keys(
      limitedInventory[0]?.historical_data?.last_4_quarters_order_quantity || {}
    ).map((date) => {
      const dataPoint = { name: date };

      limitedInventory.forEach((item) => {
        const historicalData =
          item.historical_data?.last_4_quarters_order_quantity || {};
        dataPoint[item.Component] = historicalData[date] || 0;
      });

      return dataPoint;
    });

    setPurchasingData(transformedData);
  }, [selectedCategory, inventory]);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const tileDate = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
      const isReorderDate = inventory.some(
        (item) => item.recommended_reorder_date === tileDate // Check if the tile date matches any reorder date
      );
      return isReorderDate ? "highlight-reorder" : "";
    }
    return "";
  };

  // Handle click on a calendar date
  const handleDateClick = (date) => {
    const clickedDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0]; // Convert to YYYY-MM-DD format
    const reorderParts = [];

    // Find all parts with the clicked date as the reorder date
    Object.values(groupedInventory).forEach((categoryItems) => {
      categoryItems.forEach((selectedItem) => {
        if (selectedItem.recommended_reorder_date === clickedDate) {
          reorderParts.push(selectedItem);
        }
      });
    });

    setSelectedDate(clickedDate);
    setPartsToReorder(reorderParts);
  };

  const handleItemChange = (e) => {
    const selectedItem = inventory.find(
      (item) => item["WBS No."] === e.target.value
    );
    setSelectedItem(selectedItem); // Update the selected item
  };
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine the items to display based on the state
  const displayedInventory = isExpanded
    ? inventory.filter((item) => item.shortfall < 0)
    : inventory.filter((item) => item.shortfall < 0).slice(0, 12);
  // State to track visibility of each line
  const [visibleLines, setVisibleLines] = useState({});

  useEffect(() => {
    // Set the visibility of all components in the selected category to true
    const initialVisibility = inventory
      .flat()
      .filter((item) => item.category === selectedCategory)
      .reduce((acc, item) => {
        acc[item.Component] = true; // Set all components in selected category to visible
        return acc;
      }, {});

    setVisibleLines(initialVisibility);
  }, [inventory, selectedCategory]); // Re-run effect when inventory or selectedCategory changes

  // Handle legend item click
  const handleLegendClick = (data) => {
    const componentName = data.value;
    setVisibleLines((prev) => ({
      ...prev,
      [componentName]: !prev[componentName], // Toggle visibility
    }));
  };

  // Prepare legend payload
  const legendPayload = inventory
    .flat()
    .filter((item) => item.category === selectedCategory)
    .map((item) => ({
      value: item.Component,
      type: "line",
      color: visibleLines[item.Component] ? "#8884d8" : "#ccc", // Dim color if hidden
    }));

  return (
    <>
      <NavBar />
      <VStack spacing={8} align="stretch">
        {/* Inventory Summary - Top Row with 10 Cards */}
        <Box p={5} borderWidth={1} borderRadius="lg" width="full">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Inventory Summary
          </Text>
          <Flex justify="space-between" f>
            <Flex justify="space-between" direction="column" f>
              <SimpleGrid columns={4} spacing={4} flex="1">
                {displayedInventory.map((item) => (
                  <Stat key={item["WBS No."]}>
                    <StatLabel>{item.Component}</StatLabel>
                    <StatNumber>{item.quantity_in_stock}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      Shortfall: {item.shortfall}
                    </StatHelpText>
                  </Stat>
                ))}
              </SimpleGrid>
              {inventory.filter((item) => item.shortfall < 0).length > 4 && (
                <Button
                  mt={4}
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="solid"
                  alignSelf="center"
                  bg="gray.200"
                  color="black"
                  _hover={{ bg: "gray.300" }}
                  borderRadius="full"
                  boxShadow="base"
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </Button>
              )}
            </Flex>

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
                        (acc, item) => acc + item.quantity_in_stock,
                        0
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Total Shortfall</Td>
                    <Td>
                      {inventory
                        .filter((item) => item.shortfall < 0) // Filter for items with a shortfall less than 0
                        .reduce((acc, item) => acc + item.shortfall, 0)}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Average Lead Time</Td>
                    <Td>
                      {(
                        inventory.reduce(
                          (acc, item) => acc + item.lead_time,
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

          {/* Category Selection Checkboxes */}
          <Flex wrap="wrap" gap={4} mb={4}>
            {inventory
              .map((item) => item.category)
              .filter((value, index, self) => self.indexOf(value) === index) // Get unique categories
              .map((category) => (
                <Checkbox
                  key={category}
                  isChecked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                >
                  {category}
                </Checkbox>
              ))}
          </Flex>

          <Flex justify="space-between" width="100%" wrap="wrap">
            {" "}
            {/* Bar Chart for Inventory Stock & Total Quantity Needed */}
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity_in_stock" fill="#8884d8" />
                <Bar dataKey="total_quantity_needed" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            {/* Table on the Right of Bar Chart */}
            <TableContainer width="100%" ml={6}>
              <Accordion allowMultiple>
                {Object.keys(groupedInventory).map((category) => (
                  <AccordionItem key={category}>
                    {/* Accordion Header for Category */}
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                          {category}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>

                    {/* Accordion Panel for Subcategories */}
                    <AccordionPanel pb={4} overflowX="auto">
                      <Table
                        variant="simple"
                        colorScheme="gray"
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <Thead>
                          <Tr>
                            <Th>Subcategory</Th>
                            <Th>Component</Th>
                            <Th>Stock Level</Th>
                            <Th>Total Quantity Needed</Th>
                            <Th>Maintenance Needs</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {groupedInventory[category].map((subCategoryItem) => (
                            <Tr key={subCategoryItem["WBS No."]}>
                              <Td>{subCategoryItem.subcategory}</Td>
                              <Td>{subCategoryItem.Component}</Td>
                              <Td>{subCategoryItem.quantity_in_stock}</Td>
                              <Td>{subCategoryItem.total_quantity_needed}</Td>
                              <Td>
                                {Array.isArray(
                                  subCategoryItem["Maintenance Done"]
                                ) &&
                                subCategoryItem["Maintenance Done"].length > 0
                                  ? subCategoryItem["Maintenance Done"].join(
                                      ", "
                                    )
                                  : "N/A"}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </TableContainer>
          </Flex>
        </Box>

        {/* Calendar View with Heatmap & Alerts */}
        <Box p={5} borderWidth={1} borderRadius="lg" width="full">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Predictive Sales Calendar
          </Text>
          <Flex direction="column" gap={6}>
            {/* Calendar Section */}
            <Box>
              <div style={{ paddingBottom: "10px" }}>
                <Calendar
                  tileClassName={tileClassName}
                  onClickDay={handleDateClick}
                />
                <Box mt={6}>
                  {selectedDate && (
                    <div
                      style={{
                        backgroundColor: "whitesmoke",
                        paddingTop: "10px",
                        borderRadius: "10px",
                      }}
                    >
                      <Text
                        style={{
                          padding: "10px",
                          fontSize: "20px",
                          fontWeight: "bold",
                        }}
                      >
                        Parts to Reorder for {selectedDate}
                      </Text>
                      {partsToReorder.length > 0 ? (
                        <ul style={{ padding: "30px" }}>
                          {partsToReorder.map((part, index) => (
                            <li key={index}>
                              <strong>{part.Component}</strong> - Quantity
                              Needed: {part.total_quantity_needed}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ padding: "30px" }}>
                          No parts need reordering on this date.
                        </p>
                      )}
                    </div>
                  )}
                </Box>
              </div>
            </Box>
            <Box mb={6}>
              {/* Dropdown to Select an Inventory Item */}
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Select an Item to View Historical Order Dates
              </Text>
              <Select
                onChange={handleItemChange}
                placeholder="Select Inventory Item"
              >
                {inventory.map((item) => (
                  <option key={item["WBS No."]} value={item["WBS No."]}>
                    {item.Component}{" "}
                    {/* Assuming `Component` is the name of the item */}
                  </option>
                ))}
              </Select>
            </Box>
            {/* Show Historical Data for Selected Item */}
            {selectedItem && (
              <Box mt={6}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Historical Order Dates for {selectedItem.Component}
                </Text>
                <Box borderWidth={1} borderRadius="md" p={4} bg="gray.50">
                  <Text>
                    <strong>Times Ordered:</strong>{" "}
                    {selectedItem.historical_data?.times_ordered || "N/A"}
                  </Text>
                  <Text>
                    <strong>Last Order Date:</strong>{" "}
                    {selectedItem.historical_data?.last_order_date || "N/A"}
                  </Text>
                  <Text>
                    <strong>Last 4 Quarters Order Quantities:</strong>
                  </Text>
                  <Box ml={4}>
                    {selectedItem.historical_data
                      ?.last_4_quarters_order_quantity
                      ? Object.entries(
                          selectedItem.historical_data
                            .last_4_quarters_order_quantity
                        ).map(([date, quantity]) => (
                          <Text key={date}>
                            {date}: {quantity}
                          </Text>
                        ))
                      : "No data available"}
                  </Box>
                </Box>
              </Box>
            )}
          </Flex>
        </Box>

        {/* Stock Purchasing Trend */}
        <Box p={5} borderWidth={1} borderRadius="lg" width="full">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Stock Purchasing Trend for Components
          </Text>
          <Box style={{ paddingBottom: "20px" }}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select a Category</option>
              {Array.from(
                new Set(inventory.flat().map((item) => item.category))
              ).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Box>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={purchasingData}>
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Quantity Ordered",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend
                payload={legendPayload}
                onClick={handleLegendClick} // Attach click handler
              />
              {/* Render lines conditionally */}
              {inventory
                .flat()
                .filter((item) => item.category === selectedCategory)
                .map((item) =>
                  visibleLines[item.Component] ? ( // Check visibility
                    <Line
                      key={item.Component}
                      type="monotone"
                      dataKey={item.Component}
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  ) : null
                )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </>
  );
};

export default Inventory;
