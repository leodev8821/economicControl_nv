import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import { useWeeks } from "@modules/finance/hooks/useWeek";

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
  const weeks = response?.data || [];

  const handleSelect = (event: SelectChangeEvent<number | "">) => {
    const value = event.target.value;
    if (value !== "") onChange(Number(value));
  };

  // Helper para formatear la fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
    }).format(date);
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
        {weeks.map((week) => (
          <MenuItem key={week.id} value={week.id}>
            Semana del {formatDate(week.week_start)} al{" "}
            {formatDate(week.week_end)}
            {week.is_closed && " (Cerrada)"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
