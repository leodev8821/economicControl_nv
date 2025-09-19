import { Week } from '../models/week.model.js';
import { startOfYear, endOfYear, addWeeks, nextMonday, previousSunday } from 'date-fns';

async function generateWeeksForYear(year) {
  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31`);

  // primer lunes del año
  let currentMonday = yearStart.getDay() === 1 ? yearStart : nextMonday(yearStart);

  const weeks = [];

  while (currentMonday <= yearEnd) {
    const currentSunday = previousSunday(addWeeks(currentMonday, 1)); // domingo de esa semana

    weeks.push({
      week_start: currentMonday.toISOString().slice(0, 10),
      week_end: currentSunday.toISOString().slice(0, 10),
    });

    // siguiente lunes
    currentMonday = addWeeks(currentMonday, 1);
  }

  // Inserción masiva en la tabla
  await Week.bulkCreate(weeks);

  console.log(`Se generaron ${weeks.length} semanas para el año ${year}`);
}

export default generateWeeksForYear;