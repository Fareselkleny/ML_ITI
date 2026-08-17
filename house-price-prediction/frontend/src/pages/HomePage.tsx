import PredictionForm from "../components/PredictionForm";

export default function HomePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>House Price Prediction</h1>
        <p className="subtitle">
          Estimate the median house value for a California census block group,
          powered by a trained scikit-learn model served through FastAPI.
        </p>
      </header>

      <PredictionForm />

      <footer className="disclaimer">
        Trained on 1990 U.S. Census data — predictions are illustrative of the
        ML pipeline, not current market valuations.
      </footer>
    </div>
  );
}
