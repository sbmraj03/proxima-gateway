import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function RequestsGraph({ data }) {
    const formatted = data.map(entry => ({
        time: new Date(entry.timestamp).toLocaleTimeString(),
        requests: entry.requests
    }));

    return (
        <div className="bg-gray-800 rounded-xl p-6 mt-6">
            <h2 className="text-white text-xl font-bold mb-4">Requests Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#F9FAFB' }}
                        itemStyle={{ color: '#60A5FA' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#60A5FA"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default RequestsGraph