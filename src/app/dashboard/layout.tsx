import DashboardLayout from "./layout/layout";

const MainDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
};

export default MainDashboardLayout;
