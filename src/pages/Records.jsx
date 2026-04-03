import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import Table from '../components/ui/Table';
import { useAuth } from '../hooks/useAuth';
import { useRecords } from '../hooks/useRecords';
import {
  createRecordRequest,
  deleteRecordRequest,
  updateRecordRequest
} from '../services/recordsService';
import { getApiErrorMessage } from '../utils/apiError';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import {
  canCreateRecord,
  canDeleteRecord,
  canEditRecord
} from '../utils/roleHelpers';
import { emitRecordsUpdated } from '../utils/recordEvents';

const getTodayInputValue = () => {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 10);
};

const createInitialForm = () => ({
  amount: '',
  type: 'EXPENSE',
  category: '',
  date: getTodayInputValue(),
  notes: ''
});

const mapRecordToForm = (record) => ({
  amount: String(record.amount ?? ''),
  type: record.type ?? 'EXPENSE',
  category: record.category ?? '',
  date: record.date ? new Date(record.date).toISOString().slice(0, 10) : getTodayInputValue(),
  notes: record.notes ?? ''
});

const Records = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role;
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [form, setForm] = useState(createInitialForm);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const { records, meta, loading, refreshing } = useRecords(filters);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFilters((prev) => {
        const nextSearch = searchInput.trim();
        if (prev.search === nextSearch) return prev;
        return { ...prev, page: 1, search: nextSearch };
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (!selectedRecord?.id) return;

    const updatedRecord = records.find((record) => record.id === selectedRecord.id);

    if (updatedRecord) {
      setSelectedRecord(updatedRecord);
    } else if (!refreshing) {
      setSelectedRecord(null);
    }
  }, [records, refreshing, selectedRecord?.id]);

  const allowCreate = canCreateRecord(role);
  const allowEdit = canEditRecord(role);
  const allowDelete = canDeleteRecord(role);
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / filters.limit));
  const rangeStart = meta.total ? (filters.page - 1) * filters.limit + 1 : 0;
  const rangeEnd = meta.total ? Math.min(filters.page * filters.limit, meta.total) : 0;
  const isEditing = Boolean(editingRecordId);

  const resetFormState = ({ clearMessages = true } = {}) => {
    setEditingRecordId(null);
    setForm(createInitialForm());
    if (clearMessages) {
      setFormError('');
      setFormSuccess('');
    }
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, page: 1, [key]: value }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: filters.limit,
      search: '',
      type: '',
      category: '',
      startDate: '',
      endDate: ''
    });
  };

  const viewRecord = (record) => {
    setSelectedRecord(record);
  };

  const editRecord = (record) => {
    setSelectedRecord(record);
    setEditingRecordId(record.id);
    setForm(mapRecordToForm(record));
    setFormError('');
    setFormSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitRecord = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Amount must be greater than 0.');
      return;
    }

    if (!form.category.trim()) {
      setFormError('Category is required.');
      return;
    }

    if (!form.date) {
      setFormError('Date is required.');
      return;
    }

    setSubmitting(true);

    const payload = {
      amount,
      type: form.type,
      category: form.category.trim(),
      date: form.date,
      notes: form.notes.trim() || null
    };

    try {
      if (editingRecordId) {
        await updateRecordRequest(editingRecordId, payload);
        setFormSuccess('Record updated successfully.');
      } else {
        await createRecordRequest(payload);
        setFormSuccess('Record added successfully.');
      }

      resetFormState({ clearMessages: false });
      emitRecordsUpdated();
    } catch (error) {
      setFormError(getApiErrorMessage(error, `Unable to ${editingRecordId ? 'update' : 'create'} record`));
    } finally {
      setSubmitting(false);
    }
  };

  const removeRecord = async (record) => {
    const confirmed = window.confirm(`Delete "${record.category}" on ${formatDate(record.date)}?`);
    if (!confirmed) return;

    setDeletingRecordId(record.id);
    setFormError('');
    setFormSuccess('');

    try {
      await deleteRecordRequest(record.id);

      if (selectedRecord?.id === record.id) {
        setSelectedRecord(null);
      }

      if (editingRecordId === record.id) {
        resetFormState();
      }

      if (records.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      }

      emitRecordsUpdated();
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to delete record'));
    } finally {
      setDeletingRecordId('');
    }
  };

  const columns = useMemo(
    () => [
      { key: 'date', label: 'Date', render: (record) => formatDate(record.date) },
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', render: (record) => formatCurrency(record.amount) },
      {
        key: 'createdBy',
        label: 'Created By',
        render: (record) => record.createdBy?.name || 'Unknown'
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (record) => (
          <div className="records-actions">
            <Button variant="secondary" onClick={() => viewRecord(record)}>
              View
            </Button>
            {allowEdit ? (
              <Button variant="secondary" onClick={() => editRecord(record)}>
                Edit
              </Button>
            ) : null}
            {allowDelete ? (
              <Button
                variant="danger"
                disabled={deletingRecordId === record.id}
                onClick={() => removeRecord(record)}
              >
                {deletingRecordId === record.id ? 'Deleting...' : 'Delete'}
              </Button>
            ) : null}
          </div>
        )
      }
    ],
    [allowDelete, allowEdit, deletingRecordId]
  );

  if (loading) return <Loader />;

  return (
    <main className="page records-page">
      {allowCreate ? (
        <section className="panel record-form-panel">
          <div className="records-heading">
            <div>
              <h3>{isEditing ? 'Edit Financial Record' : 'Add Financial Record'}</h3>
              <p>
                {isEditing
                  ? 'Update the selected record. Charts and totals refresh after save.'
                  : 'Create a new income or expense entry. Charts and totals refresh automatically.'}
              </p>
            </div>
            {refreshing ? <span className="records-sync-status">Refreshing data...</span> : null}
          </div>

          <form className="record-form" onSubmit={submitRecord}>
            <Input
              label="Amount"
              min="0.01"
              name="amount"
              onChange={(event) => handleFormChange('amount', event.target.value)}
              placeholder="2500"
              step="0.01"
              type="number"
              value={form.amount}
            />

            <label className="input-field">
              <span>Type</span>
              <select value={form.type} onChange={(event) => handleFormChange('type', event.target.value)}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </label>

            <Input
              label="Category"
              name="category"
              onChange={(event) => handleFormChange('category', event.target.value)}
              placeholder="Salary, Rent, Marketing"
              value={form.category}
            />

            <Input
              label="Date"
              max={getTodayInputValue()}
              name="date"
              onChange={(event) => handleFormChange('date', event.target.value)}
              type="date"
              value={form.date}
            />

            <label className="input-field record-form-notes">
              <span>Notes</span>
              <textarea
                maxLength={1000}
                onChange={(event) => handleFormChange('notes', event.target.value)}
                placeholder="Optional description"
                rows={3}
                value={form.notes}
              />
            </label>

            <div className="record-form-actions">
              <Button disabled={submitting} type="submit">
                {submitting ? (isEditing ? 'Updating...' : 'Saving...') : isEditing ? 'Update Record' : 'Add Record'}
              </Button>
              {isEditing ? (
                <Button variant="secondary" onClick={resetFormState} type="button">
                  Cancel Edit
                </Button>
              ) : null}
              {formError ? <p className="form-feedback error">{formError}</p> : null}
              {formSuccess ? <p className="form-feedback success">{formSuccess}</p> : null}
            </div>
          </form>
        </section>
      ) : null}

      <section className="panel records-filters-panel">
        <div className="records-heading records-heading-compact">
          <div>
            <h3>Records</h3>
            <p>
              {meta.total
                ? `Showing ${rangeStart}-${rangeEnd} of ${meta.total} records`
                : 'No records match the current filters'}
            </p>
          </div>
          {refreshing ? <span className="records-sync-status">Refreshing data...</span> : null}
        </div>

        <div className="records-filters">
          <Input
            label="Search"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search notes or category"
            value={searchInput}
          />

          <label className="input-field">
            <span>Type</span>
            <select value={filters.type} onChange={(event) => setFilter('type', event.target.value)}>
              <option value="">All types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </label>

          <Input
            label="Category"
            onChange={(event) => setFilter('category', event.target.value)}
            placeholder="Filter by category"
            value={filters.category}
          />

          <Input
            label="Start Date"
            onChange={(event) => setFilter('startDate', event.target.value)}
            type="date"
            value={filters.startDate}
          />

          <Input
            label="End Date"
            max={getTodayInputValue()}
            onChange={(event) => setFilter('endDate', event.target.value)}
            type="date"
            value={filters.endDate}
          />

          <label className="input-field">
            <span>Rows Per Page</span>
            <select
              value={filters.limit}
              onChange={(event) => setFilters((prev) => ({ ...prev, page: 1, limit: Number(event.target.value) }))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className="records-filter-actions">
          <Button onClick={clearFilters} type="button" variant="secondary">
            Clear Filters
          </Button>
        </div>
      </section>

      {selectedRecord ? (
        <section className="panel record-detail-panel">
          <div className="records-heading records-heading-compact">
            <div>
              <h3>Record Details</h3>
              <p>{selectedRecord.notes || 'No notes added for this record.'}</p>
            </div>
            <div className="records-actions">
              {allowEdit ? (
                <Button onClick={() => editRecord(selectedRecord)} type="button" variant="secondary">
                  Edit
                </Button>
              ) : null}
              {allowDelete ? (
                <Button
                  disabled={deletingRecordId === selectedRecord.id}
                  onClick={() => removeRecord(selectedRecord)}
                  type="button"
                  variant="danger"
                >
                  {deletingRecordId === selectedRecord.id ? 'Deleting...' : 'Delete'}
                </Button>
              ) : null}
              <Button onClick={() => setSelectedRecord(null)} type="button" variant="secondary">
                Close
              </Button>
            </div>
          </div>

          <div className="record-detail-grid">
            <div className="record-detail-item">
              <span>Amount</span>
              <strong>{formatCurrency(selectedRecord.amount)}</strong>
            </div>
            <div className="record-detail-item">
              <span>Type</span>
              <strong>{selectedRecord.type}</strong>
            </div>
            <div className="record-detail-item">
              <span>Category</span>
              <strong>{selectedRecord.category}</strong>
            </div>
            <div className="record-detail-item">
              <span>Date</span>
              <strong>{formatDate(selectedRecord.date)}</strong>
            </div>
            <div className="record-detail-item">
              <span>Created By</span>
              <strong>{selectedRecord.createdBy?.name || 'Unknown'}</strong>
            </div>
            <div className="record-detail-item">
              <span>Created At</span>
              <strong>{formatDate(selectedRecord.createdAt)}</strong>
            </div>
          </div>
        </section>
      ) : null}

      {records.length ? (
        <>
          <div className="records-desktop-table">
            <Table columns={columns} rows={records} />
          </div>

          <div className="records-mobile-list">
            {records.map((record) => (
              <article className="record-card" key={record.id}>
                <div className="record-card-top">
                  <div>
                    <h4>{record.category}</h4>
                    <p>{formatDate(record.date)}</p>
                  </div>
                  <strong className={`record-amount ${record.type === 'INCOME' ? 'income' : 'expense'}`}>
                    {formatCurrency(record.amount)}
                  </strong>
                </div>

                <div className="record-card-grid">
                  <span>Type: {record.type}</span>
                  <span>Created By: {record.createdBy?.name || 'Unknown'}</span>
                </div>

                <p className="record-card-notes">{record.notes || 'No notes added.'}</p>

                <div className="records-actions">
                  <Button onClick={() => viewRecord(record)} type="button" variant="secondary">
                    View
                  </Button>
                  {allowEdit ? (
                    <Button onClick={() => editRecord(record)} type="button" variant="secondary">
                      Edit
                    </Button>
                  ) : null}
                  {allowDelete ? (
                    <Button
                      disabled={deletingRecordId === record.id}
                      onClick={() => removeRecord(record)}
                      type="button"
                      variant="danger"
                    >
                      {deletingRecordId === record.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <section className="panel records-empty-state">
          <h3>No records found</h3>
          <p>Try adjusting the search term or filters to find matching transactions.</p>
        </section>
      )}

      <div className="records-pagination">
        <Button
          disabled={filters.page <= 1 || refreshing}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
          type="button"
          variant="secondary"
        >
          Previous
        </Button>
        <span>
          Page {filters.page} of {totalPages}
        </span>
        <Button
          disabled={filters.page >= totalPages || refreshing}
          onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
          type="button"
          variant="secondary"
        >
          Next
        </Button>
      </div>
    </main>
  );
};

export default Records;
