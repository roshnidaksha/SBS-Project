import NavBar from "../NavBar";
import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for budget optimization
const budgetData = [
  { name: 'Marketing', allocated: 10000, actual: 8000 },
  { name: 'R&D', allocated: 15000, actual: 12000 },
  { name: 'Sales', allocated: 12000, actual: 11000 },
  { name: 'Operations', allocated: 20000, actual: 19000 },
  { name: 'HR', allocated: 8000, actual: 7000 },
];

const BudgetOptimizationChart = () => {
  return (
    <>
    <NavBar />
    <VStack spacing={8} align="stretch">
      <Box p={5} borderWidth={1} borderRadius="lg" width="full">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Budget Optimization - Allocated vs Actual
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="allocated" fill="#8884d8" name="Allocated Budget" />
            <Bar dataKey="actual" fill="#82ca9d" name="Actual Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
    </>
  );
};

export default BudgetOptimizationChart;
