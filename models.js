import { Sequelize, DataTypes, } from "sequelize";

const sequelize = new Sequelize({
    dialect: 'postgres',
    username: "postgres",
    host: "localhost",
    database: "aca_website",
    password: process.env.POSTGRES_PSWD,
    port: 5433,
    logging: false
  });

try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const Year = sequelize.define(
    "Year",
    {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false,
        },
        aca_year: {
            type: DataTypes.INTEGER, allowNull: false, unique: true,
        },
        pantone_color: {
            type: DataTypes.STRING(20),
        },
        pantone_color_hex: {
            type: DataTypes.STRING(7),
        }
    },
    {
        tableName: 'years',
    },
);

const FamilyMember = sequelize.define(
    "FamilyMember",
    {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex',
        },
        last_name: {
            type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex',
        }
    },
    {
        tableName: 'family_members',
    },
);

async function getYears() {
    const yearsResponse = await Year.findAll({attributes: ['aca_year']});
    const years = yearsResponse.map(item => item.getDataValue('aca_year'));
    return years;
}

async function getFamily() {
    const familyResponse = await FamilyMember.findAll({attributes: ['first_name']});
    const names = familyResponse.map(item => item.getDataValue('first_name'));
    return names;
}

await Year.sync();

await FamilyMember.sync();

export { Year, FamilyMember, getYears, getFamily, sequelize, };