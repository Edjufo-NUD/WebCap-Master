import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "../supabasebaseClient";
import Sidebar from '../Admin/Sidebar';
import './Analytics.css';

const BINUNGEY_FIGS = [
  "BinungeyBoyFig1.json", "BinungeyBoyFig2.json", "BinungeyBoyFig3.json",
  "BinungeyBoyFig4.json", "BinungeyBoyFig5.json", "BinungeyBoyFig6.json", "BinungeyBoyFig7.json"
];
const PAHID_FIGS = [
  "PahidBoyFig1.json", "PahidBoyFig2.json", "PahidBoyFig3.json",
  "PahidBoyFig4.json", "PahidBoyFig5.json", "PahidBoyFig6.json"
];
const SUAKUSUA_FIGS = [
  "SuaKuSuaBoyFig1.json", "SuaKuSuaBoyFig2.json", "SuaKuSuaBoyFig3.json", "SuaKuSuaBoyFig4.json",
  "SuaKuSuaBoyFig5.json", "SuaKuSuaBoyFig6.json", "SuaKuSuaBoyFig7.json", "SuaKuSuaBoyFig8.json",
  "SuaKuSuaBoyFig9.json", "SuaKuSuaBoyFig10.json"
];
const TIKLOS_FIGS = [
  "TiklosBoyFig1.json", "TiklosBoyFig2.json", "TiklosBoyFig3.json", "TiklosBoyFig4.json"
];

const Analytics = () => {
  const [activeItem, setActiveItem] = useState('analytics');
  const [chartData, setChartData] = useState([]);
  const [binungeyScores, setBinungeyScores] = useState([]);
  const [pahidScores, setPahidScores] = useState([]);
  const [suaScores, setSuaScores] = useState([]);
  const [tiklosScores, setTiklosScores] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalDances, setTotalDances] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Total users (role = 'user')
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');
      setTotalUsers(usersCount || 0);

      // New users in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: newUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
        .gte('created_at', sevenDaysAgo.toISOString());
      setActiveUsers(newUsersCount || 0);

      // Total dances
      const { count: dancesCount } = await supabase
        .from('dances')
        .select('*', { count: 'exact', head: true });
      setTotalDances(dancesCount || 0);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchPopularDances = async () => {
      const { data: history } = await supabase.from('user_history').select('dance_name');
      const counts = {};
      history?.forEach(row => {
        if (row.dance_name) counts[row.dance_name] = (counts[row.dance_name] || 0) + 1;
      });
      const danceNames = ['Binungey', 'Pahid', 'Sua Ku Sua', 'Tiklos'];
      const chartData = danceNames.map(name => ({
        name,
        dances: counts[name] || 0,
      }));
      setChartData(chartData);
    };
    fetchPopularDances();
    const intervalId = setInterval(fetchPopularDances, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchAverageScores = async (danceName, figureList, setScores) => {
      const { data: history } = await supabase
        .from('user_history')
        .select('figure_name, score')
        .eq('dance_name', danceName);

      const figureMap = {};
      history?.forEach(row => {
        if (!row.figure_name) return;
        if (!figureMap[row.figure_name]) figureMap[row.figure_name] = [];
        figureMap[row.figure_name].push(row.score || 0);
      });

      const scores = figureList.map((figName, idx) => {
        const arr = figureMap[figName] || [];
        const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        return { name: `Fig ${idx + 1}`, dances: avg };
      });

      setScores(scores);
    };

    fetchAverageScores('Binungey', BINUNGEY_FIGS, setBinungeyScores);
    fetchAverageScores('Pahid', PAHID_FIGS, setPahidScores);
    fetchAverageScores('Sua Ku Sua', SUAKUSUA_FIGS, setSuaScores);
    fetchAverageScores('Tiklos', TIKLOS_FIGS, setTiklosScores);
  }, []);

  return (
    <div className="analytics-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="analytics-content">
        {/* Top Dashboard */}
        <div className="top-dashboard">
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="stat-number">{totalUsers}</div>
            </div>
            <div className="stat-card">
              <h3>New Registered Users</h3>
              <div className="stat-subtitle">Last 7 Days</div>
              <div className="stat-number">{activeUsers}</div>
            </div>
            <div className="stat-card">
              <h3>Total Dances</h3>
              <div className="stat-number">{totalDances}</div>
            </div>
          </div>
        </div>

        {/* Popular Dances Chart */}
        <div className="chart-section">
          <h2 className="popular-dance-heading">Popular Dances</h2>
          <p className="chart-subtext">Most Performed Dance Activities</p>
          <div className="dashboard-chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend wrapperStyle={{ color: '#000000' }} />
                <Bar dataKey="dances" name="Folk Dances">
                  {chartData.map((entry, idx) => (
                    <Cell key={`main-cell-${idx}`} fill={['#6b3916', '#e1a94f', '#4caf50', '#2196f3'][idx % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Score Charts */}
        <div className="chart-section">
          <h2 className="popular-dance-heading">Average Score</h2>
          <p className="chart-subtext">Performance Analytics Per Dance Figure</p>
          <div className="grid-chart-section">
            {/* Binungey Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">Binungey</h4>
              <p className="chart-subtext">Average Score Per Figure</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={binungeyScores}
                  margin={{ left: 20, right: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={90}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    tickFormatter={v => `${v}`}
                    allowDataOverflow={true}
                  />
                  <Tooltip />
                  <Bar dataKey="dances" name="Average Score" fill="#6b3916" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pahid Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">Pahid</h4>
              <p className="chart-subtext">Average Score Per Figure</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={pahidScores}
                  margin={{ left: 20, right: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={90}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    tickFormatter={v => `${v}`}
                    allowDataOverflow={true}
                  />
                  <Tooltip />
                  <Bar dataKey="dances" name="Average Score" fill="#e1a94f" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sua Ku Sua Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">Sua Ku Sua</h4>
              <p className="chart-subtext">Average Score Per Figure</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={suaScores}
                  margin={{ left: 20, right: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={90}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    tickFormatter={v => `${v}`}
                    allowDataOverflow={true}
                  />
                  <Tooltip />
                  <Bar dataKey="dances" name="Average Score" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tiklos Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">Tiklos</h4>
              <p className="chart-subtext">Average Score Per Figure</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={tiklosScores}
                  margin={{ left: 20, right: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={90}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    tickFormatter={v => `${v}`}
                    allowDataOverflow={true}
                  />
                  <Tooltip />
                  <Bar dataKey="dances" name="Average Score" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;