-- Create enum for salesperson roles
CREATE TYPE public.salesperson_role AS ENUM ('sdr', 'closer', 'hybrid');

-- Add role column to salespeople table
ALTER TABLE public.salespeople 
ADD COLUMN role salesperson_role NOT NULL DEFAULT 'hybrid';