-- USERS table (linked to Supabase Auth users)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    role VARCHAR,
    status VARCHAR
);

-- DANCES table
CREATE TABLE dances (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    history TEXT,
    references TEXT,
    main_video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    island VARCHAR
);

-- DANCE_IMAGES table
CREATE TABLE dance_images (
    id UUID PRIMARY KEY,
    dance_id UUID REFERENCES dances(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DANCE_FIGURES table
CREATE TABLE dance_figures (
    id UUID PRIMARY KEY,
    dance_id UUID REFERENCES dances(id) ON DELETE CASCADE,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    figure_number INT
);

-- USER_FEEDBACK table
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    figure_name VARCHAR,
    rating INT CHECK (rating >= 0 AND rating <= 5),
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- USER_HISTORY table
CREATE TABLE user_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INT,
    attempted_at TIMESTAMP DEFAULT NOW(),
    dance_name TEXT,
    figure_name TEXT
);
