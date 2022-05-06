SELECT properties.id
FROM properties
WHERE title LIKE '%this%' OR id > 995 OR owner_id = 1002
LIMIT 5;
