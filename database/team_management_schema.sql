-- Team Management System Database Schema
-- Run this in your Supabase SQL Editor to create the required tables

-- =============================================
-- Teams Table
-- =============================================
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    game TEXT NOT NULL,
    game_category TEXT NOT NULL, -- for grouping (e.g., "call_of_duty", "valorant")
    description TEXT,
    max_roster_size INTEGER NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'recruiting')),
    rank TEXT, -- current competitive rank
    achievements TEXT, -- recent accomplishments
    color_gradient TEXT DEFAULT 'from-purple-600 to-blue-600', -- for UI styling
    bg_color TEXT DEFAULT 'bg-purple-900/20',
    border_color TEXT DEFAULT 'border-purple-700/30',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Team Members Table
-- =============================================
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('captain', 'player', 'substitute', 'coach')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure a user can only be in a team once (but can be in multiple teams)
    UNIQUE(team_id, user_id)
);

-- =============================================
-- Team Applications Table
-- =============================================
CREATE TABLE team_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    application_message TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),

    -- Ensure a user can only have one pending application per team
    UNIQUE(team_id, user_id)
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_teams_game_category ON teams(game_category);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_applications_team_id ON team_applications(team_id);
CREATE INDEX idx_team_applications_user_id ON team_applications(user_id);
CREATE INDEX idx_team_applications_status ON team_applications(status);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_applications ENABLE ROW LEVEL SECURITY;

-- Teams: Everyone can read, only admins can modify
CREATE POLICY "Everyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Only admins can insert teams" ON teams FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);
CREATE POLICY "Only admins can update teams" ON teams FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);
CREATE POLICY "Only admins can delete teams" ON teams FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);

-- Team Members: Everyone can read, only admins can modify, users can view their own
CREATE POLICY "Everyone can view team members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Only admins can insert team members" ON team_members FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);
CREATE POLICY "Only admins can update team members" ON team_members FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);
CREATE POLICY "Only admins can delete team members" ON team_members FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);

-- Team Applications: Users can view their own and create, admins can view/modify all
CREATE POLICY "Users can view own applications, admins can view all" ON team_applications FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);
CREATE POLICY "Users can create applications" ON team_applications FOR INSERT WITH CHECK (
    user_id = auth.uid()
);
CREATE POLICY "Users can update own applications, admins can update all" ON team_applications FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);
CREATE POLICY "Only admins can delete applications" ON team_applications FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'superadmin')
    )
);

-- =============================================
-- Trigger for Updated At
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Initial Data Population (Based on Current Static Teams)
-- =============================================
INSERT INTO teams (name, game, game_category, description, max_roster_size, status, rank, achievements, color_gradient, bg_color, border_color) VALUES
('Obscura Valorant', 'VALORANT', 'valorant', 'Elite Valorant competitive team', 5, 'active', 'Radiant', 'VCT Champions 2024 Finalists', 'from-red-600 to-orange-600', 'bg-red-900/20', 'border-red-700/30'),
('Obscura CS2', 'Counter-Strike 2', 'counterstrike', 'Professional CS2 roster', 5, 'active', 'Global Elite', 'IEM Major Winners', 'from-yellow-600 to-orange-600', 'bg-yellow-900/20', 'border-yellow-700/30'),
('Obscura League', 'League of Legends', 'leagueoflegends', 'Championship League of Legends team', 5, 'active', 'Challenger', 'LCS Spring Split Champions', 'from-blue-600 to-cyan-600', 'bg-blue-900/20', 'border-blue-700/30'),
('Obscura Apex', 'Apex Legends', 'apexlegends', 'Apex Legends competitive squad', 3, 'active', 'Apex Predator', 'ALGS Championship Top 3', 'from-purple-600 to-pink-600', 'bg-purple-900/20', 'border-purple-700/30'),
('Obscura RL', 'Rocket League', 'rocketleague', 'Rocket League championship team', 3, 'active', 'Supersonic Legend', 'RLCS World Champions', 'from-blue-600 to-purple-600', 'bg-blue-900/20', 'border-blue-700/30'),
('Obscura R6', 'Rainbow Six Siege', 'rainbowsix', 'Rainbow Six Siege tactical team', 5, 'active', 'Champion', 'Six Invitational Winners', 'from-gray-600 to-gray-700', 'bg-gray-900/20', 'border-gray-700/30'),
('Obscura Warzone Alpha', 'Call of Duty: Warzone', 'call_of_duty', 'Primary Warzone competitive team', 4, 'active', 'Top 500', 'CDL Championship Qualifiers', 'from-orange-600 to-red-600', 'bg-orange-900/20', 'border-orange-700/30'),
('Obscura MW3 Delta', 'Call of Duty: Modern Warfare III', 'call_of_duty', 'Modern Warfare III competitive squad', 4, 'recruiting', 'Elite', 'Regional Tournament Winners', 'from-green-600 to-blue-600', 'bg-green-900/20', 'border-green-700/30');

-- =============================================
-- Views for Easy Data Access
-- =============================================

-- Team with member count
CREATE VIEW teams_with_member_count AS
SELECT
    t.*,
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
) ta ON t.id = ta.team_id;

-- Team members with user details
CREATE VIEW team_members_with_user_details AS
SELECT
    tm.*,
    u.full_name,
    u.email,
    u.photo_url
FROM team_members tm
JOIN users u ON tm.user_id = u.id;

-- Team applications with user details
CREATE VIEW team_applications_with_details AS
SELECT
    ta.*,
    u.full_name as applicant_name,
    u.email as applicant_email,
    u.photo_url as applicant_photo,
    t.name as team_name,
    t.game as team_game,
    reviewer.full_name as reviewer_name
FROM team_applications ta
JOIN users u ON ta.user_id = u.id
JOIN teams t ON ta.team_id = t.id
LEFT JOIN users reviewer ON ta.reviewed_by = reviewer.id;