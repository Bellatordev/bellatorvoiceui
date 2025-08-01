-- Add title column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN title TEXT DEFAULT 'New Session';

-- Update existing sessions to have a default title
UPDATE public.sessions 
SET title = 'Session ' || TO_CHAR(created_at, 'MM/DD/YY') 
WHERE title IS NULL;