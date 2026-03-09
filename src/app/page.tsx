import Link from 'next/link';
import { Users, Presentation, Settings2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="container flex-column flex-center" style={{ minHeight: '100vh', padding: '40px 0' }}>
      <div className="glass-panel text-center animate-fade-in" style={{ maxWidth: '600px', width: '100%' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '16px' }}>Habit 6: Synergy</h1>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Cùng tạo cách mới (1 + 1 = 3)
        </h2>

        <div className="flex-column gap-lg">
          <Link href="/student" className="glass-card flex-between" style={{ textDecoration: 'none' }}>
            <div className="flex-center gap-md">
              <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
                <Users size={24} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Học sinh</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tham gia làm bài nhóm, phân vai</p>
              </div>
            </div>
            <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&rarr;</div>
          </Link>

          <Link href="/teacher" className="glass-card flex-between" style={{ textDecoration: 'none' }}>
            <div className="flex-center gap-md">
              <div style={{ background: 'var(--secondary)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
                <Settings2 size={24} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Giáo viên</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Điều khiển trò chơi, đồng hồ, tiến độ</p>
              </div>
            </div>
            <div style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>&rarr;</div>
          </Link>

          <Link href="/tv" className="glass-card flex-between" style={{ textDecoration: 'none' }}>
            <div className="flex-center gap-md">
              <div style={{ background: 'var(--accent)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
                <Presentation size={24} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Màn hình chiếu (TV)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Bảng theo dõi và nội dung trình chiếu</p>
              </div>
            </div>
            <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>&rarr;</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
