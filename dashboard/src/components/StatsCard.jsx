function StatsCard({ title, value, color }) {
    return (
        <div className={`bg-gray-800 rounded-xl p-6 border-l-4 ${color}`}>
            <p className="text-gray-400 text-sm mb-1">{title}</p>
            <p className="text-white text-3xl font-bold">{value}</p>
        </div>
    )
}

export default StatsCard