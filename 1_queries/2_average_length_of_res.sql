
-- SELECT Avg(total_duration) as total_average_duration
-- FROM (SELECT cohorts.name, sum(completed_at - started_at) as total_duration
-- FROM assistance_requests 
-- JOIN students ON students.id = assistance_requests.student_id
-- JOIN cohorts ON cohorts.id = cohort_id
-- GROUP BY cohorts.name
-- ORDER BY total_duration) as total_average_duration


-- SELECT Avg(total_duration) as average_duration
-- FROM (SELECT sum(end_date - start_date) as total_duration
--       FROM reservations
--       ORDER BY total_duration) as potatoes

SELECT avg(end_date - start_date) as average_duration
FROM reservations;