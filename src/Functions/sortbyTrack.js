const fs = require("fs");

const filePath = '../DataFiles/maintenance_schedule/';

function getOptimizedScheduleByTrack(date, filePath) {
  // Read the JSON file
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Find the matching date entry
  const daySchedule = data.find((entry) => entry.date === date);

  if (!daySchedule || !daySchedule.tasks || daySchedule.tasks.length === 0) {
    return `No tasks found for the date: ${date}`;
  }

  // Group tasks by track
  const tasksByTrack = {};
  daySchedule.tasks.forEach((task) => {
    const track = task.track;
    if (!tasksByTrack[track]) {
      tasksByTrack[track] = [];
    }
    // Add a map of required fields
    tasksByTrack[track].push({
      maintenanceType: task.maintenanceType,
      trainNo: task.trainNo,
      startTime: task.startTime,
      endTime: task.endTime,
      maxPeople: task.maxPeople,
    });
  });

  // Apply greedy algorithm to each track
  const optimizedSchedule = {};
  for (const track in tasksByTrack) {
    const tasks = tasksByTrack[track];

    // Sort tasks by endTime (convert decimal time to minutes for sorting)
    tasks.sort((a, b) => {
      const endA = convertDecimalToMinutes(a.endTime);
      const endB = convertDecimalToMinutes(b.endTime);
      return endA - endB;
    });

    // Greedily select tasks
    const selectedTasks = [];
    let lastEndTime = 0; // Keep track of the end time of the last selected task in minutes
    tasks.forEach((task) => {
      const taskStartTime = convertDecimalToMinutes(task.startTime);
      if (taskStartTime >= lastEndTime) {
        selectedTasks.push(task);
        lastEndTime = convertDecimalToMinutes(task.endTime);
      }
    });

    optimizedSchedule[track] = selectedTasks;
  }

  return optimizedSchedule;
}

// Helper function to convert decimal time to minutes
function convertDecimalToMinutes(decimalTime) {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  return hours * 60 + minutes;
}