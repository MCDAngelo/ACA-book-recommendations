import {Year} from "./models.js";

const enterYears = await Year.bulkCreate(
    [
        {acaYear: 2019, pantoneColor: 'Living Coral', pantoneColorHex: '#FF6F61'},
        {acaYear: 2020, pantoneColor: 'Classic Blue', pantoneColorHex: '#0F4C81'},
        {acaYear: 2021, pantoneColor: 'Illuminating', pantoneColorHex: '#F5DF4D'},
        {acaYear: 2022, pantoneColor: 'Veri Peri', pantoneColorHex: '#6667AB'},
        {acaYear: 2023, pantoneColor: 'Viva Magenta', pantoneColorHex: '#BB2649'},
        {acaYear: 2024, pantoneColor: 'Peach Fuzz', pantoneColorHex: '#FFC196'}
    ]);