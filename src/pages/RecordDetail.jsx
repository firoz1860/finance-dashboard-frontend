import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { getRecordRequest } from "../services/recordsService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

const RecordDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecord = async () => {
      try {
        setError("");
        setRecord(await getRecordRequest(id));
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load record"));
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <main className="page">
      <section className="panel record-detail-panel">
        <div className="records-heading">
          <div>
            <h3>Record Detail</h3>
            <p>{error || "Detailed view for the selected transaction."}</p>
          </div>
          <Button
            onClick={() => navigate("/records")}
            type="button"
            variant="secondary"
          >
            Back to Records
          </Button>
        </div>

        {record ? (
          <div className="record-detail-full">
            <div className="record-detail-section">
              <div className="record-detail-grid">
                <div className="record-detail-item">
                  <span>Amount</span>
                  <strong>{formatCurrency(record.amount)}</strong>
                </div>
                <div className="record-detail-item">
                  <span>Type</span>
                  <strong>{record.type}</strong>
                </div>
                <div className="record-detail-item">
                  <span>Category</span>
                  <strong>{record.category}</strong>
                </div>
                <div className="record-detail-item">
                  <span>Date</span>
                  <strong>{formatDate(record.date)}</strong>
                </div>
                <div className="record-detail-item">
                  <span>Created By</span>
                  <strong>{record.createdBy?.name || "Unknown"}</strong>
                </div>
                <div className="record-detail-item">
                  <span>Created Date</span>
                  <strong>{formatDate(record.createdAt)}</strong>
                </div>
              </div>
            </div>

            <div className="record-detail-section">
              <h4 className="record-details-heading">Notes</h4>
              <div className="record-detail-notes">
                <p>{record.notes || "No notes added for this record."}</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default RecordDetail;
