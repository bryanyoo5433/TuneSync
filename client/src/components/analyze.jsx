import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

const Analyze = () => {
  const location = useLocation();
  const { userWaveform, referenceWaveform } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (userWaveform && referenceWaveform) {
      fetchAnalysis();
    }
  }, [userWaveform, referenceWaveform]);

  // API call to match `generate_advice.py`
  const fetchAnalysis = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/compare-audio", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to analyze");

      const textData = await response.text(); // Gemini returns raw text
      const formattedData = parseGeminiOutput(textData); // Parse raw text into structured JSON
      setAnalysis(formattedData);
    } catch (error) {
      console.error(error);
      alert("Error analyzing audio.");
    } finally {
      setLoading(false);
    }
  };

  // Function to parse raw Gemini output into structured JSON
  const parseGeminiOutput = (text) => {
    const recommendations = [];
    const lines = text.split("\n");

    lines.forEach((line) => {
      const match = line.match(/timestamp: ([\d.]+) - discrepancy: (.+) - suggestion: (.+)/);
      if (match) {
        recommendations.push({
          timestamp: parseFloat(match[1]),
          discrepancy: match[2].trim(),
          suggestion: match[3].trim(),
        });
      }
    });

    return { recommendations };
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {loading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin w-8 h-8" />
          <p>Processing audio analysis...</p>
        </div>
      ) : analysis ? (
        <>
          <Card className="w-full max-w-4xl">
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip recommendations={analysis.recommendations} />} />
                  <Line type="monotone" data={referenceWaveform} dataKey="dynamics" stroke="#8884d8" />
                  <Line type="monotone" data={userWaveform} dataKey="dynamics" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <div className="mt-4">
            <h3 className="text-xl font-bold">Performance Recommendations</h3>
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec, index) => (
                <div key={index} className="p-3 border-b">
                  <p><strong>Time:</strong> {rec.timestamp}s</p>
                  <p><strong>Issue:</strong> {rec.discrepancy}</p>
                  <p><strong>Suggestion:</strong> {rec.suggestion}</p>
                </div>
              ))
            ) : (
              <p>No discrepancies found.</p>
            )}
          </div>
        </>
      ) : (
        <Button onClick={fetchAnalysis}>Analyze Again</Button>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, recommendations }) => {
  if (active && payload && payload.length) {
    const time = payload[0].payload.time;
    const recommendation = recommendations?.find((r) => Math.abs(r.timestamp - time) < 0.1);

    return recommendation ? (
      <div className="bg-white p-2 shadow-lg rounded">
        <p className="text-sm font-bold">{recommendation.discrepancy}</p>
        <p className="text-xs text-gray-600">{recommendation.suggestion}</p>
      </div>
    ) : null;
  }

  return null;
};

export default Analyze;