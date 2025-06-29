// app/admin/schedule/layout.tsx
export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="schedule-layout">
      {children}
    </div>
  );
}
