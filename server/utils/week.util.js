import { Week } from '../models/week.model.js';
import { addWeeks, startOfWeek, addDays } from 'date-fns';

async function generateWeeksForYear(year) {
  // Primer lunes igual o después del 1 de enero
  let currentMonday = startOfWeek(new Date(`${year}-01-01`), { weekStartsOn: 1 });
  if (currentMonday.getFullYear() < year) {
    // Si el lunes calculado es del año anterior, avanza una semana
    currentMonday = addWeeks(currentMonday, 1);
  }
  const lastDay = new Date(`${year}-12-31`);

  const weeks = [];

  while (currentMonday <= lastDay) {
    const currentSunday = addDays(currentMonday, 6);

    weeks.push({
      week_start: currentMonday.toISOString().slice(0, 10),
      week_end: currentSunday.toISOString().slice(0, 10),
    });

    currentMonday = addWeeks(currentMonday, 1);
  }

  await Week.bulkCreate(weeks);

  console.log(`Se generaron ${weeks.length} semanas para el año ${year}`);
}

export default generateWeeksForYear;