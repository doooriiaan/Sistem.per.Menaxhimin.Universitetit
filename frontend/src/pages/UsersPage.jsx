import { useDeferredValue, useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { EmptyState, SkeletonRows } from "../components/ui/Feedback";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/ToastProvider";
import PaginationControls from "../components/PaginationControls";
import TableToolbar from "../components/TableToolbar";
import API, { getResponseMessage } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { formatDateLabel } from "../utils/display";
import { matchesSearchTerm, paginateItems } from "../utils/table";
import {
  getApiErrorMessage,
  validateUserEmailForm,
  validateUserPasswordResetForm,
} from "../utils/validation";

const emptyEmailForm = {
  email: "",
};

const emptyPasswordForm = {
  password: "",
  confirmPassword: "",
};

const ROLE_FILTERS = [
  { value: "all", label: "Te gjitha rolet" },
  { value: "admin", label: "Admin" },
  { value: "profesor", label: "Profesor" },
  { value: "student", label: "Student" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Te gjitha statuset" },
  { value: "active", label: "Aktive" },
  { value: "inactive", label: "Jo aktive" },
];

function UsersPage() {
  const { user } = useAuth();
  const { notifyError, notifySuccess } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailModalUser, setEmailModalUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [emailForm, setEmailForm] = useState(emptyEmailForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [saving, setSaving] = useState(false);

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());

  const filteredUsers = users.filter((account) => {
    const matchesRole = roleFilter === "all" || account.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && account.is_active) ||
      (statusFilter === "inactive" && !account.is_active);

    return (
      matchesRole &&
      matchesStatus &&
      matchesSearchTerm(
        [
          account.user_id,
          account.full_name,
          account.email,
          account.profile_email,
          account.role_label,
          account.linked_label,
          account.is_active ? "Aktive" : "Jo aktive",
        ],
        deferredSearchTerm
      )
    );
  });

  const usersPagination = paginateItems(filteredUsers, currentPage, pageSize);
  const currentUserId = Number(user?.user_id);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get("/users");
      setUsers(response.data);
      setError("");
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate marrjes se perdoruesve."
      );
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEmailModal = (account) => {
    setEmailModalUser(account);
    setEmailForm({ email: account.email || "" });
    setError("");
  };

  const openPasswordModal = (account) => {
    setPasswordModalUser(account);
    setPasswordForm(emptyPasswordForm);
    setError("");
  };

  const closeModals = () => {
    setEmailModalUser(null);
    setPasswordModalUser(null);
    setEmailForm(emptyEmailForm);
    setPasswordForm(emptyPasswordForm);
    setSaving(false);
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateUserEmailForm(emailForm);

    if (validationError) {
      setError(validationError);
      notifyError(validationError);
      return;
    }

    try {
      setSaving(true);
      const response = await API.put(
        `/users/${emailModalUser.user_id}/email`,
        emailForm,
        { showToast: false }
      );
      await fetchUsers();
      closeModals();
      notifySuccess(
        getResponseMessage(response, "Email-i u perditesua me sukses."),
        "Email u ruajt"
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate perditesimit te email-it."
      );
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateUserPasswordResetForm(passwordForm);

    if (validationError) {
      setError(validationError);
      notifyError(validationError);
      return;
    }

    try {
      setSaving(true);
      const response = await API.put(
        `/users/${passwordModalUser.user_id}/password`,
        passwordForm,
        { showToast: false }
      );
      closeModals();
      notifySuccess(
        getResponseMessage(response, "Fjalekalimi u resetua me sukses."),
        "Fjalekalimi u resetua"
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate resetimit te fjalekalimit."
      );
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (account) => {
    const nextActive = !account.is_active;
    const actionLabel = nextActive ? "aktivizosh" : "deaktivizosh";

    if (
      !window.confirm(
        `A je i sigurt qe deshiron ta ${actionLabel} llogarine ${account.email}?`
      )
    ) {
      return;
    }

    try {
      const response = await API.put(
        `/users/${account.user_id}/status`,
        { is_active: nextActive },
        { showToast: false }
      );
      await fetchUsers();
      notifySuccess(
        getResponseMessage(response, "Statusi u perditesua me sukses."),
        nextActive ? "Llogaria u aktivizua" : "Llogaria u deaktivizua"
      );
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Gabim gjate ndryshimit te statusit."
      );
      setError(message);
      notifyError(message);
    }
  };

  return (
    <div className="p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Perdoruesit</h2>
            <p className="mt-1 text-sm text-slate-500">
              Menaxho email-et, fjalekalimet dhe statusin e llogarive.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Fjalekalimet nuk shfaqen, vetem resetohen.
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <SkeletonRows count={4} />
        ) : (
          <>
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(180px,0.3fr)]">
              <TableToolbar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Kerko sipas emrit, email-it ose rolit..."
                filterValue={roleFilter}
                onFilterChange={setRoleFilter}
                filterOptions={ROLE_FILTERS}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={filteredUsers.length}
              />

              <div className="mb-5">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Statusi
                </label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Perdoruesi</th>
                    <th className="p-4 text-left">Email Login</th>
                    <th className="p-4 text-left">Roli</th>
                    <th className="p-4 text-left">Lidhja</th>
                    <th className="p-4 text-left">Statusi</th>
                    <th className="p-4 text-left">Krijuar</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {usersPagination.items.length > 0 ? (
                    usersPagination.items.map((account) => {
                      const isSelf = Number(account.user_id) === currentUserId;

                      return (
                        <tr
                          key={account.user_id}
                          className="border-t border-slate-200 hover:bg-slate-50"
                        >
                          <td className="p-4">{account.user_id}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {account.full_name || "Pa emer"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Profili: {account.profile_email || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">{account.email}</td>
                          <td className="p-4">{account.role_label}</td>
                          <td className="p-4">{account.linked_label}</td>
                          <td className="p-4">
                            <StatusBadge>
                              {account.is_active ? "Aktive" : "Jo aktive"}
                            </StatusBadge>
                          </td>
                          <td className="p-4">
                            {formatDateLabel(account.created_at)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => openEmailModal(account)}
                                disabled={isSelf}
                                size="sm"
                                variant="secondary"
                                icon="mail"
                              >
                                Email
                              </Button>
                              <Button
                                onClick={() => openPasswordModal(account)}
                                disabled={isSelf}
                                size="sm"
                                variant="secondary"
                                icon="shield"
                              >
                                Reset
                              </Button>
                              <Button
                                onClick={() => handleStatusToggle(account)}
                                disabled={isSelf}
                                size="sm"
                                variant={account.is_active ? "danger" : "success"}
                                icon={account.is_active ? "trash" : "refresh"}
                              >
                                {account.is_active ? "Deaktivizo" : "Aktivizo"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-6">
                        <EmptyState
                          title="Nuk u gjet asnje perdorues"
                          description="Provo nje kerkim ose filter tjeter."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={usersPagination.currentPage}
              totalPages={usersPagination.totalPages}
              totalItems={usersPagination.totalItems}
              startItem={usersPagination.startItem}
              endItem={usersPagination.endItem}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {emailModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Ndrysho email</h3>
            <p className="mt-1 text-sm text-slate-500">
              {emailModalUser.full_name || emailModalUser.email}
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="mt-5 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Email login
                </label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(event) =>
                    setEmailForm({ email: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Email-i sinkronizohet edhe me profilin e lidhur.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={closeModals} variant="secondary">
                  Anulo
                </Button>
                <Button type="submit" loading={saving}>
                  Ruaj email
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">
              Reset fjalekalimi
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {passwordModalUser.full_name || passwordModalUser.email}
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="mt-5 grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Fjalekalimi i ri
                </label>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Konfirmo fjalekalimin
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Pas resetimit, sesionet aktive te ketij perdoruesi revokohen.
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={closeModals} variant="secondary">
                  Anulo
                </Button>
                <Button type="submit" loading={saving}>
                  Reseto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
