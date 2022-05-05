const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const config = {
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
};

const pool = new Pool(config);
pool.connect(() => {
  console.log('Connected');
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(
    `SELECT *
    FROM users
    WHERE email LIKE $1`,
    [email]
  ).then(res => {
    if (!res.rows[0].email) return null;
    //console.log("getUserWithEmail", res.rows[0]);
    return res.rows[0];
  }).catch((err) => {
    console.log(err.message);
  });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(
    `SELECT *
    FROM users
    WHERE id = $1`,
    [id]
  ).then(res => {
    if (!res.rows[0]) return null;
    //console.log("getUserWithId",res.rows[0]);
    return res.rows[0];
  }).catch((err) => {
    console.log(err.message);
  });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(
    `INSERT INTO users (name, email, password)
    VALUES($1, $2, $3)
    RETURNING *;`, [user.name, user.email, user.password]
  ).then(res => {
    return res.rows[0].id;
  }).catch((err) => {
    console.log(err.message);
  });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guestId, limit = 10) {
  return pool.query(`SELECT properties.*, reservations.id, reservations.start_date, ROUND(AVG(rating),2) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`, [guestId, limit])
    .then(res => {
      console.log(res.rows);
      return res.rows;
    })  .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  
  // minimum_price_per_night,
  // maximum_price_per_night,
  // minimum_rating;
  
  const queryParams = [];
  let queryString = `SELECT properties.*, ROUND(AVG(rating),2) as average_rating  
  FROM properties
  JOIN property_reviews ON properties.id = property_reviews.property_id`;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `\n WHERE city LIKE $${queryParams.length}`;
  }
  if (options.owner_id) {
    queryParams.push(Number(options.owner_id));
    if (queryParams.length > 1) queryString += `AND owner_id = $${queryParams.length}`;
    else queryString += `\n\tWHERE properties.owner_id = $${queryParams.length}`;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(Number(options.minimum_price_per_night) * 100);
    if (queryParams.length > 1) queryString += `AND cost_per_night > $${queryParams.length}`;
    else queryString += `\n\tWHERE cost_per_night > $${queryParams.length}`;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(Number(options.maximum_price_per_night) * 100);
    if (queryParams.length > 1) queryString += `AND cost_per_night < $${queryParams.length}`;
    else queryString += `\n\tWHERE cost_per_night < $${queryParams.length}`;
  }
  queryString += `\nGROUP BY properties.id`;
  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += `\n HAVING ROUND(AVG(rating),2) > $${queryParams.length}`;
  }
  queryParams.push(limit);
  queryString += `\nORDER BY cost_per_night
  LIMIT $${queryParams.length};`;

  console.log(queryParams, queryString);

  return pool.query(queryString,queryParams)
    .then(res => {
      return res.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
