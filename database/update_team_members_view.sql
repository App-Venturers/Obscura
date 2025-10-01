-- Update team_members_with_user_details view to include gamertag
-- This ensures team members are displayed with gamertags instead of full names for privacy

DROP VIEW IF EXISTS team_members_with_user_details;

CREATE VIEW team_members_with_user_details AS
SELECT
    tm.*,
    u.full_name,
    u.gamertag,
    u.email,
    u.photo_url
FROM team_members tm
JOIN users u ON tm.user_id = u.id;