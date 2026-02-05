-- Add organization branding fields to hackathons table
ALTER TABLE hackathons 
ADD COLUMN IF NOT EXISTS organization_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS organization_logo TEXT;

-- Create mentor_assignments table
CREATE TABLE IF NOT EXISTS mentor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hackathon_id, student_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_hackathon ON mentor_assignments(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_student ON mentor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);

-- Add RLS policies for mentor_assignments
ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Organizers can view all assignments for their hackathons
CREATE POLICY "Organizers can view mentor assignments for their hackathons"
ON mentor_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = mentor_assignments.hackathon_id
    AND hackathons.owner_id = auth.uid()
  )
);

-- Organizers can create assignments for their hackathons
CREATE POLICY "Organizers can create mentor assignments for their hackathons"
ON mentor_assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = mentor_assignments.hackathon_id
    AND hackathons.owner_id = auth.uid()
  )
);

-- Organizers can update assignments for their hackathons
CREATE POLICY "Organizers can update mentor assignments for their hackathons"
ON mentor_assignments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = mentor_assignments.hackathon_id
    AND hackathons.owner_id = auth.uid()
  )
);

-- Organizers can delete assignments for their hackathons
CREATE POLICY "Organizers can delete mentor assignments for their hackathons"
ON mentor_assignments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM hackathons
    WHERE hackathons.id = mentor_assignments.hackathon_id
    AND hackathons.owner_id = auth.uid()
  )
);

-- Students can view their own mentor assignments
CREATE POLICY "Students can view their own mentor assignments"
ON mentor_assignments FOR SELECT
USING (student_id = auth.uid());

-- Mentors can view assignments where they are the mentor
CREATE POLICY "Mentors can view their mentor assignments"
ON mentor_assignments FOR SELECT
USING (mentor_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mentor_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mentor_assignments_updated_at
BEFORE UPDATE ON mentor_assignments
FOR EACH ROW
EXECUTE FUNCTION update_mentor_assignments_updated_at();
