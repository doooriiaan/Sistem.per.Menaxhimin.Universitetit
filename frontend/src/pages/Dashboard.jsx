
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";




function Dashboard() {
  const [counts, setCounts] = useState({
  students: 0,
  profesoret: 0,
  lendet: 0,
});
useEffect(() => {
  const fetchCounts = async () => {
    try {
      const [studentsRes, profesoretRes, lendetRes] = await Promise.all([
        API.get("/studentet"),
        API.get("/profesoret"),
        API.get("/lendet"),
      ]);

      setCounts({
        students: studentsRes.data.length,
        profesoret: profesoretRes.data.length,
        lendet: lendetRes.data.length,
      });
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  fetchCounts();
}, []);

  return (
    <div className="p-8 ">
      <div className="mb-8 text-center"> 
        <h2 className="text-4xl font-bold text-slate-900 mt-2">
          Welcome back
        </h2>
        <p className="text-slate-500 mt-2">
          University management overview
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 min-h-[260px]">
          <div className="flex items-center justify-between mb-6 ">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Main Overview
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Students, professors and courses summary
              </p>
            </div>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl bg-slate-100 p-5">
              <p className="text-xl text-slate-500 ">Students</p>
              <h4 className="text-center text-3xl font-bold text-slate-900 mt-3">
                {counts.students}
              </h4>
              <Link 
                to="/studentet"
                className="mt-4 inline-block  text-center px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
              >
                View Students
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5">
              <p className="text-xl text-slate-500">Professors</p>
              <h4 className="text-3xl font-bold text-slate-900 mt-3">
                {counts.profesoret}
              </h4>
               <Link
                to="/profesoret"
                className="mt-4 inline-block text-center px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
              >
                View Professors
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5">
              <p className="text-xl text-slate-500">Courses</p>
              <h4 className="text-3xl font-bold text-slate-900 mt-3">
                {counts.lendet}
              </h4>
              <Link
                to="/lendet"
                className="mt-4 inline-block text-center px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
              >
                View Courses
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white min-h-[260px] flex flex-col justify-between">
          <div>
            <p className="text-sm text-slate-400">Profile</p>
            <h3 className="text-2xl font-bold mt-2">Admin Panel</h3>
            <p className="text-slate-300 mt-3 text-sm leading-6">
              Manage students, professors, courses and the whole university
              system from one place.
            </p>
          </div>

          <div className="mt-6">
            <button className="w-full bg-white text-slate-900 rounded-2xl py-3 font-semibold hover:bg-slate-100 transition">
              Manage Now
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Recent Activity
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Overview table like the dashboard style in your image
            </p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium">
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-200">
                <th className="pb-4 font-medium">Section</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-4 text-slate-800 font-medium">Studentët</td>
                <td className="py-4 text-emerald-600">Active</td>
                <td className="py-4 text-slate-500">Today</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-4 text-slate-800 font-medium">Profesorët</td>
                <td className="py-4 text-emerald-600">Active</td>
                <td className="py-4 text-slate-500">Today</td>
              </tr>
              <tr>
                <td className="py-4 text-slate-800 font-medium">Lëndët</td>
                <td className="py-4 text-emerald-600">Active</td>
                <td className="py-4 text-slate-500">Today</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;