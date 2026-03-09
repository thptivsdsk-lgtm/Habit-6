-- 1. `class_state` table: Lưu trạng thái tổng thể của lớp học
CREATE TABLE class_state (
    id SERIAL PRIMARY KEY,
    phase INT NOT NULL DEFAULT 1,
    timer_ends_at TIMESTAMPTZ,
    current_house TEXT,
    lock_submissions BOOLEAN NOT NULL DEFAULT false,
    topic_prompt TEXT NOT NULL DEFAULT 'Có nên cho học sinh dùng điện thoại trong giờ học không?'
);

-- Insert initial class state
INSERT INTO class_state (id, phase) VALUES (1, 1);

-- 2. `student_session` table: Quản lý học sinh tham gia
CREATE TABLE student_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    house TEXT NOT NULL CHECK (house IN ('N','E','W','S')),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. `role_assignments` table: Quản lý quota các vai trò trong từng Nhà
CREATE TABLE role_assignments (
    id SERIAL PRIMARY KEY,
    house TEXT NOT NULL CHECK (house IN ('N','E','W','S')),
    role TEXT NOT NULL CHECK (role IN ('A','B','C','D')),
    student_id UUID REFERENCES student_session(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(house, student_id) -- Mỗi học sinh chỉ được giữ 1 vai trong nhà
);

-- 4. `contributions` table: Lưu trữ các ý kiến cá nhân của học sinh trong nhóm
CREATE TABLE contributions (
    id SERIAL PRIMARY KEY,
    house TEXT NOT NULL CHECK (house IN ('N','E','W','S')),
    role TEXT NOT NULL CHECK (role IN ('A','B','C','D')),
    student_id UUID REFERENCES student_session(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. `group_product` table: Bản chốt của từng Nhà (1+1=3)
CREATE TABLE group_product (
    house TEXT PRIMARY KEY CHECK (house IN ('N','E','W','S')),
    y1 TEXT,
    y2 TEXT,
    gold1 TEXT,
    gold2 TEXT,
    y3 TEXT,
    why TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'locked', 'submitted')),
    submitted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turn on Realtime for these tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE class_state;
ALTER PUBLICATION supabase_realtime ADD TABLE student_session;
ALTER PUBLICATION supabase_realtime ADD TABLE role_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE group_product;

-- Note: Ensure Row Level Security (RLS) is disabled for prototype, or set up policies
-- For this prototype, we will disable RLS (public read/write) to ensure smooth realtime sync
ALTER TABLE class_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_session DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE contributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_product DISABLE ROW LEVEL SECURITY;

