-- Games Category Table
-- This table stores all available game categories that can be assigned to teams

CREATE TABLE game_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_code TEXT NOT NULL UNIQUE, -- e.g., 'call_of_duty', 'valorant'
    display_name TEXT NOT NULL, -- e.g., 'Call of Duty', 'Valorant'
    description TEXT, -- Optional description of the game
    is_active BOOLEAN NOT NULL DEFAULT true, -- Whether this game is currently active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial game categories
INSERT INTO game_categories (category_code, display_name, description) VALUES
('call_of_duty', 'Call of Duty', 'First-person shooter franchise'),
('valorant', 'Valorant', 'Tactical first-person shooter by Riot Games'),
('counterstrike', 'Counter-Strike', 'Tactical first-person shooter'),
('leagueoflegends', 'League of Legends', 'Multiplayer online battle arena (MOBA)'),
('apexlegends', 'Apex Legends', 'Battle royale first-person shooter'),
('rocketleague', 'Rocket League', 'Vehicular soccer video game'),
('rainbowsix', 'Rainbow Six Siege', 'Tactical first-person shooter'),
('fortnite', 'Fortnite', 'Battle royale and creative game'),
('overwatch', 'Overwatch', 'Team-based first-person shooter'),
('dota2', 'Dota 2', 'Multiplayer online battle arena (MOBA)'),
('csgo', 'CS:GO', 'Counter-Strike: Global Offensive'),
('fifa', 'FIFA', 'Football simulation video game'),
('other', 'Other', 'Other games not listed');

-- Create index for better performance
CREATE INDEX idx_game_categories_active ON game_categories(is_active);
CREATE INDEX idx_game_categories_code ON game_categories(category_code);

-- Row Level Security (RLS) Policies
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active game categories
CREATE POLICY "Anyone can view active game categories" ON game_categories
    FOR SELECT USING (is_active = true);

-- Policy: Only admins can insert/update/delete game categories
CREATE POLICY "Only admins can manage game categories" ON game_categories
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users WHERE (is_admin = true OR is_superadmin = true)
        )
    );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_game_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update
CREATE TRIGGER trigger_update_game_categories_updated_at
    BEFORE UPDATE ON game_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_game_categories_updated_at();

-- View for easy access to active game categories
CREATE VIEW active_game_categories AS
SELECT
    id,
    category_code,
    display_name,
    description,
    created_at,
    updated_at
FROM game_categories
WHERE is_active = true
ORDER BY display_name;

-- Grant permissions
GRANT SELECT ON active_game_categories TO authenticated;
GRANT ALL ON game_categories TO authenticated;