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
    //if (!res.rows[0].email) return null;
    //console.log("getUserWithEmail", res.rows[0]);
    return res.rows[0] || null;
  }).catch((err) => {
    console.log(err.message);
    return null;
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
    [id])
    .then(res => {
      //if (!res.rows[0]) return null;
      //console.log("getUserWithId",res.rows[0]);
      return res.rows[0] || null;
    }).catch((err) => {
      console.log(err.message);
      return null;
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
    return res.rows[0] || null;
  }).catch((err) => {
    console.log(err.message);
    return null;
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
  return pool.query(`SELECT properties.*, reservations.*, ROUND(AVG(rating),2) as average_rating
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

  const queryParams = [];
  let queryString = `SELECT properties.*, ROUND(AVG(rating),2) as average_rating  
  FROM properties
  JOIN property_reviews ON properties.id = property_reviews.property_id`;
  
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `\nWHERE city LIKE $${queryParams.length}`;
  }
  if (options.owner_id) {
    queryParams.push(Number(options.owner_id));
    queryString += (queryParams.length > 1 ? `\nAND`:`\n\tWHERE`) + ` owner_id = $${queryParams.length}`;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    if (queryParams.length > 1) queryString += `\nAND cost_per_night > $${queryParams.length}`;
    else queryString += `\n\tWHERE cost_per_night >= $${queryParams.length}`;
  }
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    if (queryParams.length > 1) queryString += `\nAND cost_per_night < $${queryParams.length}`;
    else queryString += `\n\tWHERE cost_per_night =< $${queryParams.length}`;
  }
  queryString += `\n\tGROUP BY properties.id`;
  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += `\n\tHAVING ROUND(AVG(rating),2) >= $${queryParams.length}`;
  }
  queryParams.push(limit);
  queryString += `\n\tORDER BY cost_per_night\tLIMIT $${queryParams.length};`;

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

  const  queryString =
  `INSERT INTO properties (title, description,owner_id,cover_photo_url,thumbnail_photo_url,cost_per_night,parking_spaces,number_of_bathrooms,number_of_bedrooms,active,province,city,country,street,post_code) 
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
  RETURNING *;`;
  const queryParams = [
    property.title,
    property.description,
    property.owner_id,
    property.cover_photo_url,
    property.thumbnail_photo_url,
    property.cost_per_night,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    true,
    property.province,
    property.city,
    property.country,
    property.street,
    property.post_code
  ];
  console.log("Query Parameters: ",queryParams);
  console.log('\n');
  console.log("Query String: ", queryString);
  
  return pool.query(queryString,queryParams)
    .then(res => {
      console.log("Responce row [0]: ", res.rows[0]);
      return res.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;
