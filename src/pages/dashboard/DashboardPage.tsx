import KpiCards from '../../components/dashboard/KpiCards';
import RecentAuditsTable from '../../components/dashboard/RecentAuditsTable';
import StoreLocationsMap from '../../components/dashboard/StoreLocationsMap';
import FlaggedStoresList from '../../components/dashboard/FlaggedStoresList';

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor compliance performance across all retail locations.</p>
      </div>
      <KpiCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><StoreLocationsMap /></div>
        <div><FlaggedStoresList /></div>
      </div>
      <RecentAuditsTable />
    </div>
  );
};

export default DashboardPage;