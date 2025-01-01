const fs = require("fs");

const filePath = '../DataFiles/maintenance_schedule/';

function getTasksByDate(date, filePath ) {
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

  return tasksByTrack;
}


