-- Update the sliders table structure to match the form fields
ALTER TABLE sliders 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NOT NULL,
ADD COLUMN IF NOT EXISTS caption VARCHAR(255),
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Update existing columns if they exist
UPDATE sliders SET image_url = COALESCE(image_url, '') WHERE image_url IS NULL;
UPDATE sliders SET caption = COALESCE(title, '') WHERE caption IS NULL;
UPDATE sliders SET display_order = COALESCE(sort_order, 0) WHERE display_order IS NULL;

-- Insert sample slider data
INSERT INTO sliders (title, subtitle, image_url, caption, display_order, is_active) VALUES
('Welcome to Ananta Realty', 'Your Dream Home Awaits', '/placeholder.svg?height=400&width=800', 'Luxury Properties in Prime Locations', 1, TRUE),
('Premium Villas', 'Experience Luxury Living', '/placeholder.svg?height=400&width=800', 'Spacious Villas with Modern Amenities', 2, TRUE),
('Investment Opportunities', 'Secure Your Future', '/placeholder.svg?height=400&width=800', 'High ROI Properties Available', 3, TRUE);
