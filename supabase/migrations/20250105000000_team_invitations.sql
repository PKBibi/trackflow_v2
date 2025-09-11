-- Create team_invitations table for managing team invitations
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_expires_at ON public.team_invitations(expires_at);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Team admins can view invitations" ON public.team_invitations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_invitations.team_id 
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

CREATE POLICY "Team admins can create invitations" ON public.team_invitations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_invitations.team_id 
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

CREATE POLICY "Team admins can delete invitations" ON public.team_invitations
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = team_invitations.team_id 
      AND role IN ('owner', 'admin')
      AND status = 'active'
    )
  );

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token TEXT)
RETURNS JSONB AS $$
DECLARE
  invitation_record RECORD;
  existing_member RECORD;
  new_member_id UUID;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE token = invitation_token
    AND expires_at > NOW()
    AND accepted_at IS NULL;
  
  IF invitation_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a member
  SELECT * INTO existing_member
  FROM public.team_members
  WHERE user_id = auth.uid()
    AND team_id = invitation_record.team_id;
  
  IF existing_member IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already a member of this team');
  END IF;
  
  -- Create team member
  INSERT INTO public.team_members (
    user_id,
    team_id,
    email,
    role,
    status,
    invited_by,
    joined_at
  ) VALUES (
    auth.uid(),
    invitation_record.team_id,
    invitation_record.email,
    invitation_record.role,
    'active',
    invitation_record.invited_by,
    NOW()
  ) RETURNING id INTO new_member_id;
  
  -- Mark invitation as accepted
  UPDATE public.team_invitations
  SET accepted_at = NOW()
  WHERE id = invitation_record.id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'member_id', new_member_id,
    'team_id', invitation_record.team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at 
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();