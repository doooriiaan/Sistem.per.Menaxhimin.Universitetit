import { useEffect, useState } from "react";
import API from "../services/api";
import { getApiErrorMessage } from "../utils/validation";

function ProfessorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await API.get("/profesor/lendet");
      setCourses(response.data);
      setError("");

      if (response.data.length > 0) {
        setSelectedCourse((prev) => prev || response.data[0]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Gabim gjate marrjes se lendeve."));
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (courseId) => {
    try {
      setStudentsLoading(true);
      const response = await API.get(`/profesor/lendet/${courseId}/studentet`);
      setSelectedCourse(response.data.course);
      setStudents(response.data.students);
      setError("");
    } catch (err) {
      setStudents([]);
      setError(
        getApiErrorMessage(err, "Gabim gjate marrjes se studenteve te lendes.")
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse?.lende_id) {
      fetchStudents(selectedCourse.lende_id);
    }
  }, [selectedCourse?.lende_id]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Lendet e mia</h2>
        <p className="mt-2 text-sm text-slate-500">
          Zgjidh nje lende per te pare studentet e regjistruar.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Duke i ngarkuar lendet...</p>
        ) : (
          <div className="mt-6 space-y-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <button  
                  key={course.lende_id}
                  type="button"
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selectedCourse?.lende_id === course.lende_id
                      ? "border-slate-900 bg-slate-900 text-white  "
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 ">
                    <div>
                      <p className="font-semibold">{course.emri}</p>
                      <p
                        className={`mt-1 text-sm ${
                          selectedCourse?.lende_id === course.lende_id
                            ? "text-slate-300 "
                            : "text-slate-500"
                        }`}
                      >
                        {course.kodi} | Semestri {course.semestri}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <p>{course.total_studentesh} studente</p>
                      <p
                        className={
                          selectedCourse?.lende_id === course.lende_id
                            ? "text-slate-300"
                            : "text-slate-500"
                        }
                      >
                        {course.total_provimeve} provime
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Nuk ke lende te caktuara aktualisht.
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          Studentet e lendes
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {selectedCourse
            ? `${selectedCourse.emri} (${selectedCourse.kodi})`
            : "Zgjidh nje lende nga lista majtas."}
        </p>

        {studentsLoading ? (
          <p className="mt-6 text-sm text-slate-500">
            Duke i ngarkuar studentet...
          </p>
        ) : students.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-3 font-medium">Studenti</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Viti</th>
                  <th className="pb-3 font-medium">Semestri</th>
                  <th className="pb-3 font-medium">Statusi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.regjistrimi_id} className="border-b border-slate-100">
                    <td className="py-3 text-slate-900">
                      {student.emri} {student.mbiemri}
                    </td>
                    <td className="py-3 text-slate-600">{student.email}</td>
                    <td className="py-3 text-slate-600">{student.viti_studimit}</td>
                    <td className="py-3 text-slate-600">{student.semestri}</td>
                    <td className="py-3 text-slate-600">
                      {student.statusi_regjistrimit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Nuk ka studente te regjistruar ne kete lende.
          </div>
        )}
      </section>
    </div>
  );
}

export default ProfessorCoursesPage;
