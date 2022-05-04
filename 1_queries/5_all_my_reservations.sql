-- SELECT DISTINCT properties.id, title, cost_per_night, start_date, ROUND(AVG(property_reviews.rating),2) as average_rating
-- FROM reservations
-- JOIN  users ON users.id = reservations.guest_id
-- JOIN property_reviews ON property_reviews.guest_id = users.id
-- JOIN properties ON properties.id = property_reviews.property_id
-- WHERE users.email LIKE 'tristanjacobs@gmail.com'
-- GROUP BY properties.id, start_date
-- ORDER BY start_date DESC
-- LIMIT 10

SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;