import { useState, useEffect } from 'react'
import StatsCard from './components/StatsCard'
import RequestsGraph from './components/RequestsGraph';

function App() {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);

    return () => clearInterval(interval);
  }, []);

  const avgResponseTime = analytics?.responseTimes?.length
    ? Math.round(analytics.responseTimes.reduce((a, b) => a + b, 0) / analytics.responseTimes.length)
    : 0;

  return (
    <div className="bg-gray-900 min-h-screen p-8">
      <h1 className="text-white text-3xl font-bold mb-8">⚡ Proxima Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatsCard title="Total Requests" value={analytics?.totalRequests ?? 0} color="border-blue-500" />
        <StatsCard title="Failed Requests" value={analytics?.failedRequests ?? 0} color="border-red-500" />
        <StatsCard title="Avg Response Time" value={`${avgResponseTime}ms`} color="border-green-500" />
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-white text-xl font-bold mb-4">Route Stats</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="pb-3">Route</th>
              <th className="pb-3">Total Requests</th>
              <th className="pb-3">Failed Requests</th>
              <th className="pb-3">Avg Response Time</th>
            </tr>
          </thead>
          <tbody>
            {analytics && Object.entries(analytics.routeStats).map(([route, stats]) => (
              <tr key={route} className="text-gray-300 border-b border-gray-700">
                <td className="py-3">{route}</td>
                <td className="py-3">{stats.totalRequests}</td>
                <td className="py-3">{stats.failedRequests}</td>
                <td className="py-3">{Math.round(stats.avgResponseTime)}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mt-6">
        <h2 className="text-white text-xl font-bold mb-4">Circuit Breakers</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="pb-3">Target</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Failures</th>
            </tr>
          </thead>
          <tbody>
            {analytics && Object.entries(analytics.circuitBreakers || {}).map(([target, state]) => (
              <tr key={target} className="text-gray-300 border-b border-gray-700">
                <td className="py-3">{target}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${state.status === 'closed' ? 'bg-green-500 text-white' :
                      state.status === 'open' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black'
                    }`}>
                    {state.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3">{state.failures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RequestsGraph data={analytics?.timeSeries || []} />
    </div>

  )
}

export default App