-- Update teams table to use foreign key reference to game_categories

-- First, let's add the new column
ALTER TABLE teams ADD COLUMN game_category_id UUID;

-- Add foreign key constraint
ALTER TABLE teams
ADD CONSTRAINT fk_teams_game_category
FOREIGN KEY (game_category_id)
REFERENCES game_categories(id);

-- Update existing teams to link them with the new game_categories
-- This assumes the game_category column already exists with category codes

UPDATE teams SET game_category_id = (
    SELECT id FROM game_categories
    WHERE category_code = teams.game_category
) WHERE game_category IS NOT NULL;

-- Create index for better performance
CREATE INDEX idx_teams_game_category_id ON teams(game_category_id);

-- Update the teams_with_member_count view to include game category information
DROP VIEW IF EXISTS teams_with_member_count;

CREATE VIEW teams_with_member_count AS
SELECT
    t.id,
    t.name,
    t.game,
    t.game_category,
    gc.display_name as game_display_name,
    gc.description as game_description,
    t.description,
    t.max_roster_size,
    t.status,
    t.rank,
    t.achievements,
    t.color_gradient,
    t.bg_color,
    t.border_color,
    t.created_at,
    t.updated_at,
    COALESCE(tm.member_count, 0) as current_roster_size,
    COALESCE(ta.pending_applications, 0) as pending_applications
FROM teams t
LEFT JOIN (
    SELECT team_id, COUNT(*) as member_count
    FROM team_members
    WHERE status = 'active'
    GROUP BY team_id
) tm ON t.id = tm.team_id
LEFT JOIN (
    SELECT team_id, COUNT(*) as pending_applications
    FROM team_applications
    WHERE status = 'pending'
    GROUP BY team_id
) ta ON t.id = ta.team_id
LEFT JOIN game_categories gc ON t.game_category_id = gc.id
ORDER BY t.created_at DESC;

-- Grant permissions
GRANT SELECT ON teams_with_member_count TO authenticated;