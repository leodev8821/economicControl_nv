import React, { useMemo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import { useWeeks } from "@modules/finance/hooks/useWeek";
import dayjs from "dayjs";

interface WeekSelectorProps {
  selectedWeek: number | "";
  onChange: (weekId: number) => void;
  disabled?: boolean;
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  selectedWeek,
  onChange,
  disabled,
}) => {
  const { data: response, isLoading } = useWeeks();

  // 1. Usamos useMemo para ordenar las semanas de forma ascendente (1, 2, 3...)
  const sortedWeeks = useMemo(() => {
    const data = response?.data || [];
    return [...data].sort((a, b) => a.id - b.id);
  }, [response]);

  const handleSelect = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    if (value !== "") onChange(Number(value));
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled || isLoading}>
      <InputLabel id="week-selector-label">Semana</InputLabel>
      <Select
        labelId="week-selector-label"
        value={selectedWeek}
        label="Semana"
        onChange={handleSelect}
        IconComponent={
          isLoading
            ? () => <CircularProgress size={20} sx={{ mr: 2 }} />
            : undefined
        }
      >
        {sortedWeeks.map((week) => (
          <MenuItem key={week.id} value={week.id}>
            S{week.id} ({dayjs(week.week_start).format("DD/MM")} -{" "}
            {dayjs(week.week_end).format("DD/MM")})
            {week.is_closed && " (Cerrada)"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
