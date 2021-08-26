-- Run: psql -U postgres < schema.sql

-- Seeing as we will be testing out this script alot we can destroy the db before creating everything again
DROP DATABASE IF EXISTS demo_njs_app;

-- Create the db
CREATE DATABASE demo_njs_app;

-- Move into the db
\c demo_njs_app

-- Create our table if it doesn't already exist
CREATE TABLE IF NOT EXISTS books (
  ID SERIAL PRIMARY KEY,
  title VARCHAR(30),
  description VARCHAR(200)
);

-- Changes the owner of the table to postgres which is the default when installing postgres
ALTER TABLE books
    OWNER to postgres;

INSERT INTO books (title, description)
  VALUES ('Rework', 'A better, faster, easier way to succeed in business.'), ('Deep Work', 'Rules for Focused Success in a Distracted World.'), ('Thinking Fast and Slow', 'Learn about your system 1 and system 2');