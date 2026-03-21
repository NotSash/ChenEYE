-- ==========================================
-- CREATE INITIAL SUPER ADMIN
-- Run this script in the Supabase SQL Editor
-- to create your very first Super Admin account.
-- ==========================================

-- Variables for the new Super Admin
DO $$
DECLARE
    -- Change these values to your desired admin credentials
    admin_email TEXT := 'sashwath.vinoth2023@vitstudent.ac.in';
    admin_password TEXT := 'Sash250705.';
    admin_name TEXT := 'Sashwath Vinoth';
    admin_phone TEXT := '9629184024';
    
    -- Internal variables
    new_user_id UUID;
    encrypted_pw TEXT;
    phone_hash TEXT;
    anon_id TEXT;
BEGIN
    -- 1. Encrypt password using pgcrypto extension
    encrypted_pw := crypt(admin_password, gen_salt('bf'));
    
    -- 2. Create the Auth User
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        admin_email,
        encrypted_pw,
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;

    -- 3. Create the auth.identities entry
    INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        gen_random_uuid(),
        new_user_id,
        new_user_id::text,
        format('{"sub": "%s", "email": "%s"}', new_user_id::text, admin_email)::jsonb,
        'email',
        now(),
        now(),
        now()
    );

    -- 4. Generate phone hash (SHA256)
    phone_hash := encode(digest(admin_phone, 'sha256'), 'hex');
    
    -- 5. Generate random anonymous ID (e.g. CE-ADMIN1)
    anon_id := 'CE-' || upper(substring(md5(random()::text) from 1 for 6));

    -- 6. Insert into public.profiles as super_admin
    INSERT INTO public.profiles (
        id,
        anonymous_id,
        full_name,
        email,
        phone_hash,
        role,
        status,
        language,
        theme,
        warnings
    )
    VALUES (
        new_user_id,
        anon_id,
        admin_name,
        admin_email,
        phone_hash,
        'super_admin',
        'active',
        'en',
        'light',
        0
    );

    -- Log success
    RAISE NOTICE 'Successfully created super admin: %', admin_email;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'A user with this email or phone already exists.';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create admin: %', SQLERRM;
END $$;
