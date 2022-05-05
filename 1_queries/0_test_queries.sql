SELECT properties.*, ROUND(AVG(rating),2) as average_rating
FROM properties
JOIN property_reviews ON properties.id = property_reviews.property_id
GROUP BY properties.id
HAVING ROUND(AVG(rating),2) > 4.5
ORDER BY cost_per_night
LIMIT 20;
