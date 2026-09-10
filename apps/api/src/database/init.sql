-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For fuzzy Malayalam name search

-- Create ICU collation for correct Malayalam alphabetical sorting
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_collation WHERE collname = 'mal_kerala'
  ) THEN
    CREATE COLLATION mal_kerala (provider = icu, locale = 'ml-IN-x-icu');
  END IF;
END $$;