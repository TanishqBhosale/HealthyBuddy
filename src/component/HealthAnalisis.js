import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth, db } from "../Config/FireBase";
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import {onAuthStateChanged} from 'firebase/auth';
import { AlertCircle, Activity, HeartPulse, Loader2 } from 'lucide-react';

const HealthAnalysisHistory = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState('');
  const [user, setUser] = useState(null);

  const genAI = new GoogleGenerativeAI("AIzaSyCNJcZT4sGpJzkOZ6NqXnf6Rhicev4N68o");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
              setUser(currentUser);
            } else {
              setUser(null);
            }})

      const analysesRef = collection(db, 'users', user.uid, 'analyses');
      const q = query(analysesRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const analysisData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));

      setAnalyses(analysisData);
      if (analysisData.length > 0) {
        getPrediction(analysisData);
      }
    } catch (error) {
      setError('Error fetching health history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = async (analysisData) => {
    setPredicting(true);
    try {
      const consolidatedData = analysisData.map(analysis => ({
        date: analysis.timestamp?.toLocaleDateString(),
        height: analysis.inputs.height,
        weight: analysis.inputs.weight,
        bmi: (analysis.inputs.weight / Math.pow(analysis.inputs.height / 100, 2)).toFixed(1),
        gender: analysis.inputs.gender,
        waterIntake: analysis.inputs.waterIntake,
        foodItems: analysis.inputs.foodItems,
        analysis: analysis.analysis
      }));

      const prompt = `As a medical professional, analyze this person's health data over time and identify potential health risks or diseases they might be susceptible to. Consider their BMI trends, dietary habits, and overall health patterns. Here's their health data:

${JSON.stringify(consolidatedData, null, 2)}

Please provide:
1. List of potential health risks based on their patterns
2. Specific disease susceptibilities
3. Preventive recommendations
4. Areas requiring immediate attention

Format the response with clear sections and bullet points.`;

      const result = await model.generateContent(prompt);
      const predictionText = await result.response.text();
      setPrediction(predictionText);
    } catch (error) {
      setError('Error generating health prediction: ' + error.message);
    } finally {
      setPredicting(false);
    }
  };

  const formatPrediction = (text) => {
    if (!text) return null;
    
    const sections = text.split('\n\n');
    return sections.map((section, index) => {
      if (section.trim().startsWith('#') || section.trim().startsWith('Health')) {
        return (
          <h3 key={index} className="text-xl font-bold mt-8 mb-4 text-purple-600 flex items-center gap-2">
            <HeartPulse className="h-6 w-6" />
            {section.replace('#', '').trim()}
          </h3>
        );
      }
      
      if (section.includes('•') || section.includes('-')) {
        const points = section.split(/[•-]/);
        return (
          <div key={index} className="space-y-3">
            {points.map((point, i) => (
              point.trim() && (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <Activity className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{point.trim()}</p>
                </div>
              )
            ))}
          </div>
        );
      }
      
      return (
        <p key={index} className="text-gray-600 mb-4">
          {section}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          <span className="text-lg text-purple-700">Loading your health history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">Your Health Analysis</h2>
            <p className="text-gray-600">Comprehensive analysis of your health data over time</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            </div>
          )}

          {predicting ? (
            <div className="flex items-center justify-center gap-3 p-8">
              <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
              <span className="text-purple-700">Analyzing your health patterns...</span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              {formatPrediction(prediction)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthAnalysisHistory;