function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-slate-700">Studentët</h3>
          <p className="text-slate-500 mt-2">Menaxho studentët e universitetit.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-slate-700">Profesorët</h3>
          <p className="text-slate-500 mt-2">Menaxho stafin akademik.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-slate-700">Lëndët</h3>
          <p className="text-slate-500 mt-2">Menaxho lëndët dhe programet.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;