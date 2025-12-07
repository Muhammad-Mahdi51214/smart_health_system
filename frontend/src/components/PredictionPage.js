
import { useNavigate } from "react-router-dom";
import "../App.css";

const PredictionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="prediction-page">
      <h2 className="prediction-title">Disease Prediction Center</h2>

      <div className="prediction-card-container">

        {/* Heart Disease Card */}
        <div 
          className="prediction-card"
          onClick={() => navigate("/predict/heart")}
        >
          <h3>❤️ Heart Disease Prediction</h3>
          <p>
            Predict the risk of heart disease using AI-based medical analysis.
          </p>
          <button>Start Prediction</button>
        </div>

        {/* Diabetes Disease Card */}
        <div 
          className="prediction-card"
          onClick={() => navigate("/predict/diabetes")}
        >
          <h3>🩸 Diabetes Disease Prediction</h3>
          <p>
            Check your diabetes risk based on medical health indicators.
          </p>
          <button>Start Prediction</button>
        </div>

      </div>
    </div>
  );
};

export default PredictionPage;
