import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LIM Synergy App - Habit 6',
  description: '1+1=3 | Cùng tạo cách mới',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="bg-mesh"></div>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
