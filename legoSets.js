/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mustafa Toygar Baykal Student ID: 112398227 Date: November 18, 2023
*
*  Published URL: https://tiny-blue-bighorn-sheep-shoe.cyclic.app
*
********************************************************************************/

const setData = require("../data/setData.json");
const themeData = require("../data/themeData.json");
require('dotenv').config();
let sets = [];
const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Theme model
const Theme = sequelize.define('Theme', {
  id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
  },
  name: {
      type: Sequelize.STRING,
  },
}, {
  timestamps: false, 
});

// Set model
const Set = sequelize.define('Set', {
  set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
  },
  name: {
      type: Sequelize.STRING,
  },
  year: {
      type: Sequelize.INTEGER,
  },
  num_parts: {
      type: Sequelize.INTEGER,
  },
  theme_id: {
      type: Sequelize.INTEGER,
  },
  img_url: {
      type: Sequelize.STRING,
  },
}, {
  timestamps: false, 
});

Set.belongsTo(Theme, {foreignKey: 'theme_id'})

sequelize.sync().then(() => {
  Theme.create({
      name: "null",
  })
  .then((theme) => {
      Set.create({
        set_num: "null",
        name: "null",
        year: null,
        num_parts: null,
        theme_id: theme.id, 
        img_url: null,
      })
      .then((set) => {
          console.log('Set created successfully!', set);
      })
      .catch((error) => {
          console.log('Error creating Set:', error);
      });
  })
  .catch((error) => {
      console.log('Error creating Theme:', error);
  });
});

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      console.log('Tables are synchronized.');

      setData.forEach(async (setElement) => {
        try {
          let themeElement = themeData.find((theme) => theme.id == setElement.theme_id);
          let themeName = themeElement ? themeElement.name : null;

          let setWithTheme = {
            ...setElement,
            theme: themeName,
          };

          sets.push(setWithTheme);
        } catch (error) {
          reject(error);
        }
      });

      console.log('Initialization successful!');
      resolve();
    } catch (error) {
      console.error('Error synchronizing tables:', error);
      reject(error);
    }
  });
}




function getAllSets() {
  return new Promise(async (resolve, reject) => {
    try {
      const allSets = await Set.findAll({
        include: [Theme], // Include Theme data
      });
      resolve(allSets);
    } catch (error) {
      reject(error);
    }
  });
}



function getSetByNum(setNum) {
  return new Promise(async (resolve, reject) => {
    try {
      const set = await Set.findAll({
        where: {
          set_num: setNum,
        },
        include: [Theme], 
      });

      if (set.length > 0) {
        resolve(set[0]);
      } else {
        reject("Unable to find requested set");
      }
    } catch (error) {
      reject(error);
    }
  });
}

function getSetsByTheme(theme) {
  return new Promise(async (resolve, reject) => {
    try {
      const sets = await Set.findAll({
        include: [Theme],
        where: {
          '$Theme.name$': {
            [Sequelize.Op.iLike]: `%${theme}%`,
          },
        },
      });

      if (sets.length > 0) {
        resolve(sets);
      } else {
        reject("Unable to find requested sets");
      }
    } catch (error) {
      reject(error);
    }
  });
}

function addSet(setData) {
  return new Promise(async (resolve, reject) => {
    try {
      await Set.create(setData);
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
}

function getAllThemes() {
  return new Promise(async (resolve, reject) => {
    try {
      const themes = await Theme.findAll();
      resolve(themes);
    } catch (err) {
      reject(err);
    }
  });
}

function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const existingSet = await Set.findOne({
        where: { set_num },
      });

      if (!existingSet) {
        reject(new Error('Set not found'));
        return;
      }

      await existingSet.update(setData);

      resolve();
    } catch (error) {
      reject(new Error(error.errors[0].message));
    }
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet }