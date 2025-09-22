import { Cash } from "./cash.model";
import { Income } from "./income.model";
import { Outcome } from "./outcome.model";
import { Person } from "./person.model";
import { Report } from "./report.model";
import { Role } from "./role.model";
import { User } from "./user.model";
import { Week } from "./week.model";

// Definir las interfaces de asociación para cada modelo
declare module "./income.model" {
  interface Income {
    Person?: typeof Person;
    Week?: typeof Week;
  }
}

declare module "./outcome.model" {
  interface Outcome {
    Cash?: typeof Cash;
    Week?: typeof Week;
  }
}

declare module "./user.model" {
  interface User {
    Role?: typeof Role;
  }
}

declare module "./report.model" {
  interface Report {
    Week?: typeof Week;
  }
}

// Definir asociaciones
Income.belongsTo(Person, {
  foreignKey: "person_id",
});

Person.hasMany(Income, {
  foreignKey: "person_id",
  onDelete: "CASCADE",
});

Income.belongsTo(Week, {
  foreignKey: "week_id",
});

Week.hasMany(Income, {
  foreignKey: "week_id",
  onDelete: "CASCADE",
});

Outcome.belongsTo(Cash, {
  foreignKey: "cash_id",
});

Cash.hasMany(Outcome, {
  foreignKey: "cash_id",
  onDelete: "CASCADE",
});

Outcome.belongsTo(Week, {
  foreignKey: "week_id",
});

Week.hasMany(Outcome, {
  foreignKey: "week_id",
  onDelete: "CASCADE",
});

User.belongsTo(Role, {
  foreignKey: "role",
  targetKey: "role",
});

Role.hasMany(User, {
  foreignKey: "role",
  sourceKey: "role",
  onDelete: "CASCADE",
});

Report.belongsTo(Week, {
  foreignKey: "week_id",
});

Week.hasOne(Report, {
  foreignKey: "week_id",
  onDelete: "CASCADE",
});

export { Cash, Income, Outcome, Person, Report, Role, User, Week };
