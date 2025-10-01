-- Fix team applications view to include gamertag and update teams view

-- Update the team_applications_with_details view to include gamertag
DROP VIEW IF EXISTS team_applications_with_details;

CREATE VIEW team_applications_with_details AS
SELECT
    ta.*,
    u.full_name as applicant_name,
    u.gamertag as applicant_gamertag,
    u.email as applicant_email,
    u.photo_url as applicant_photo,
    t.name as team_name,
    t.game as team_game,
    reviewer.full_name as reviewer_name
FROM team_applications ta
JOIN users u ON ta.user_id = u.id
JOIN teams t ON ta.team_id = t.id
LEFT JOIN users reviewer ON ta.reviewed_by = reviewer.id;

-- Update the teams_with_member_count view to include pending applications
DROP VIEW IF EXISTS teams_with_member_count;

CREATE VIEW teams_with_member_count AS
SELECT
    t.id,
    t.name,
    t.game,
    t.game_category,
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
ORDER BY t.created_at DESC;

-- Grant permissions
GRANT SELECT ON team_applications_with_details TO authenticated;
GRANT SELECT ON teams_with_member_count TO authenticated;