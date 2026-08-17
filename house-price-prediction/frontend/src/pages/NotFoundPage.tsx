import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page">
      <div className="result-card">
        <h2>404 — Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link className="btn btn-primary" to="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
