import { Cash } from './cash.model.js';
import { Income } from './income.model.js';
import { Outcome } from './outcome.model.js';
import { Person } from './person.model.js';
import { Report } from './report.model.js';
import { Role } from './role.model.js';
import { User } from './user.model.js';
import { Week } from './week.model.js';

// Definir asociaciones aquí
Income.belongsTo(Person, { foreignKey: 'person_id' });
Person.hasMany(Income, { foreignKey: 'person_id', onDelete: 'CASCADE' });

Income.belongsTo(Week, { foreignKey: 'week_id' });
Week.hasMany(Income, { foreignKey: 'week_id', onDelete: 'CASCADE' });

Outcome.belongsTo(Cash, { foreignKey: 'cash_id' });
Cash.hasMany(Outcome, { foreignKey: 'cash_id', onDelete: 'CASCADE' });

Outcome.belongsTo(Week, { foreignKey: 'week_id' });
Week.hasMany(Outcome, { foreignKey: 'week_id', onDelete: 'CASCADE' });

User.belongsTo(Role, { foreignKey: 'role', targetKey: 'role' });
Role.hasMany(User, { foreignKey: 'role', sourceKey: 'role', onDelete: 'CASCADE' });

Report.belongsTo(Week, { foreignKey: 'week_id' });
Week.hasOne(Report, { foreignKey: 'week_id', onDelete: 'CASCADE' });

Week.hasMany(Income, { foreignKey: 'week_id', onDelete: 'CASCADE' });
Income.belongsTo(Week, { foreignKey: 'week_id' });

Week.hasMany(Outcome, { foreignKey: 'week_id', onDelete: 'CASCADE' });
Outcome.belongsTo(Week, { foreignKey: 'week_id' });

export {
  Cash, Income, Outcome, Person, Report, Role, User, Week
};
