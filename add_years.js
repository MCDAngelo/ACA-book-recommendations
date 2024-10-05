import {Year} from "./models.js";

const enterYears = await Year.bulkCreate(
    [
        {aca_year: 2019, pantone_color: 'Living Coral', pantone_color_hex: '#FF6F61'},
        {aca_year: 2020, pantone_color: 'Classic Blue', pantone_color_hex: '#0F4C81'},
        {aca_year: 2021, pantone_color: 'Illuminating', pantone_color_hex: '#F5DF4D'},
        {aca_year: 2022, pantone_color: 'Veri Peri', pantone_color_hex: '#6667AB'},
        {aca_year: 2023, pantone_color: 'Viva Magenta', pantone_color_hex: '#BB2649'},
        {aca_year: 2024, pantone_color: 'Peach Fuzz', pantone_color_hex: '#FFC196'}
    ]);
