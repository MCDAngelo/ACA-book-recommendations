import { Sequelize, DataTypes } from "sequelize";

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
    "year",
    {
        acaYear: {
            type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true,
        },
        pantoneColor: {
            type: DataTypes.STRING(20),
        },
        pantoneColorHex: {
            type: DataTypes.STRING(7),
        }
    },
    {
        tableName: 'years',
        timestamps: false,
    },
);

const Family = sequelize.define(
    "family",
    {
        firstName: {
            type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex',
        },
        lastName: {
            type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex',
        }
    },
    {
        tableName: 'family_members',
    },
);

const Book = sequelize.define(
    "book",
    {
        title: {
            type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex',
        },
        author: {
            type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex',
        },
        pubYear: {
            type: DataTypes.INTEGER, allowNull: false, unique: 'compositeIndex',
        },
        imageUrl: {
            type: DataTypes.TEXT, validate: {isUrl: true},
        },
        googleBooksId: {
            type: DataTypes.STRING, allowNull: true,
        }
    },
    {
        tableName: 'books',
    },
);

const Recommendation = sequelize.define(
    "recommendation",
    {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false,
        },
        familyId : {
            type: DataTypes.INTEGER, allowNull: false, unique: 'compositeKey',
        },
        bookId : {
            type: DataTypes.INTEGER, allowNull: false, unique: 'compositeKey',
        },
        yearAcaYear : {
            type: DataTypes.INTEGER, allowNull: false, unique: 'compositeKey',
        },
        notes: {
            type: DataTypes.TEXT,
        },
    },
    {
        tableName: 'recommendations',
    },
);

Family.hasMany(Recommendation);
Year.hasMany(Recommendation);
Book.hasMany(Recommendation);
Recommendation.belongsTo(Family);
Recommendation.belongsTo(Year);
Recommendation.belongsTo(Book);

async function getYears() {
    const yearsResponse = await Year.findAll();
    const years = yearsResponse.map(item => item.dataValues);
    return years;
}

async function getFamily() {
    const familyResponse = await Family.findAll({attributes: ['firstName']});
    const names = familyResponse.map(item => item.getDataValue('firstName'));
    return names;
}

await sequelize.sync();


export { Book, Family, Recommendation, Year, getFamily, getYears, sequelize, };