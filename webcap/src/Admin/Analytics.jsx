import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie } from "recharts";
import { TrendingUp, Users, Activity, Trophy, BarChart3, Star } from 'lucide-react';
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
// Based on Profile.jsx and UserRatings.jsx - Tiklos: Step-by-Step has 16 figures (TiklosTutFig1.json to TiklosTutFig16.json)
const TIKLOS_STEPBYSTEP_FIGS = [
  "TiklosTutFig1.json", "TiklosTutFig2.json", "TiklosTutFig3.json", "TiklosTutFig4.json",
  "TiklosTutFig5.json", "TiklosTutFig6.json", "TiklosTutFig7.json", "TiklosTutFig8.json",
  "TiklosTutFig9.json", "TiklosTutFig10.json", "TiklosTutFig11.json", "TiklosTutFig12.json",
  "TiklosTutFig13.json", "TiklosTutFig14.json", "TiklosTutFig15.json", "TiklosTutFig16.json"
];

console.log('🔢 TIKLOS_STEPBYSTEP_FIGS count:', TIKLOS_STEPBYSTEP_FIGS.length); // Should be 16
console.log('📋 Full TIKLOS_STEPBYSTEP_FIGS array:', TIKLOS_STEPBYSTEP_FIGS);

const Analytics = () => {
  const [activeItem, setActiveItem] = useState('analytics');
  const [chartData, setChartData] = useState([]);
  const [binungeyScores, setBinungeyScores] = useState([]);
  const [pahidScores, setPahidScores] = useState([]);
  const [suaScores, setSuaScores] = useState([]);
  const [tiklosScores, setTiklosScores] = useState([]);
  const [tiklosStepByStepScores, setTiklosStepByStepScores] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalDances, setTotalDances] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [mostPopularDance, setMostPopularDance] = useState('N/A');

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

      // Total approved dances only
      const { count: dancesCount } = await supabase
        .from('dances')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
      setTotalDances(dancesCount || 0);

      // Total sessions from user_history
      const { count: sessionsCount } = await supabase
        .from('user_history')
        .select('*', { count: 'exact', head: true });
      setTotalSessions(sessionsCount || 0);

      // Most popular dance
      const { data: danceData } = await supabase
        .from('user_history')
        .select('dance_name');
      
      if (danceData && danceData.length > 0) {
        const danceCounts = {};
        danceData.forEach(item => {
          if (item.dance_name) {
            danceCounts[item.dance_name] = (danceCounts[item.dance_name] || 0) + 1;
          }
        });
        
        const mostPopular = Object.entries(danceCounts)
          .sort(([,a], [,b]) => b - a)[0];
        setMostPopularDance(mostPopular ? mostPopular[0] : 'N/A');
      }
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
      
      // Debug: log all unique dance names in database
      const uniqueDanceNames = [...new Set(history?.map(row => row.dance_name).filter(Boolean))];
      console.log('All dance names in database:', uniqueDanceNames);
      
      const danceNames = ['Binungey', 'Pahid', 'Sua Ku Sua', 'Tiklos', 'Tiklos: Step-by-Step'];
      const chartData = danceNames.map(name => ({
        name,
        dances: counts[name] || 0,
      }));
      console.log('Chart data for popular dances:', chartData);
      setChartData(chartData);
    };
    fetchPopularDances();
    const intervalId = setInterval(fetchPopularDances, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchAverageScores = async (danceName, figureList, setScores) => {
      try {
        const { data: history, error } = await supabase
          .from('user_history')
          .select('figure_name, score')
          .eq('dance_name', danceName);

        console.log(`=== ${danceName} Analysis ===`);
        
        // For Tiklos: Step-by-Step, let's see what figure names actually exist
        if (danceName === 'Tiklos: Step-by-Step') {
          // Check all figure names that exist for this dance
          const allFigures = history?.map(row => row.figure_name).filter(Boolean) || [];
          const uniqueFigures = [...new Set(allFigures)];
          console.log('🎯 Tiklos: Step-by-Step actual figure names in DB:', uniqueFigures);
          console.log('📝 Expected figure names (first 4):', figureList.slice(0, 4));
          
          // Let's also check if the scores are null/undefined
          const scoresInfo = history?.map(row => ({ figure: row.figure_name, score: row.score })) || [];
          console.log('💯 Sample score data:', scoresInfo.slice(0, 5));
        }

        if (error) {
          console.error(`Error fetching ${danceName}:`, error);
          setScores([]);
          return;
        }

        if (!history || history.length === 0) {
          console.log(`No data found for ${danceName}`);
          // Create empty scores array but still show ALL figures as 0%
          const emptyScores = figureList.map((figName, idx) => {
            let displayLabel;
            if (danceName === 'Tiklos: Step-by-Step') {
              const figNum = idx + 1;
              if (figNum >= 1 && figNum <= 5) displayLabel = `F1S${figNum}`;
              else if (figNum >= 6 && figNum <= 8) displayLabel = `F2S${figNum - 5}`;
              else if (figNum >= 9 && figNum <= 12) displayLabel = `F3S${figNum - 8}`;
              else if (figNum >= 13 && figNum <= 16) displayLabel = `F4S${figNum - 12}`;
              else displayLabel = `Step ${figNum}`;
            } else {
              displayLabel = `Fig ${idx + 1}`;
            }
            return { name: displayLabel, dances: 0 };
          });
          setScores(emptyScores);
          return;
        }

        const uniqueFigures = [...new Set(history.map(row => row.figure_name).filter(Boolean))];
        console.log(`Unique figure names in DB:`, uniqueFigures);
        console.log(`Expected figure names:`, figureList.slice(0, 3)); // Show first 3 to avoid console clutter

        const figureMap = {};
        history.forEach(row => {
          if (!row.figure_name) return;
          if (!figureMap[row.figure_name]) figureMap[row.figure_name] = [];
          figureMap[row.figure_name].push(row.score || 0);
        });

        // For Tiklos: Step-by-Step, ALWAYS show all 16 figures regardless of data availability
        if (danceName === 'Tiklos: Step-by-Step') {
          const dbFigures = Object.keys(figureMap);
          console.log(`🎯 ${danceName}: ALWAYS showing all ${figureList.length} figures`);
          console.log('🔄 Expected figures:', figureList);
          console.log('🔄 DB figures with data:', dbFigures.length, 'out of', figureList.length);
          
          const missingData = figureList.filter(fig => !dbFigures.includes(fig));
          if (missingData.length > 0) {
            console.log('📊 Figures with no data (will show as 0%):', missingData);
          }
        }

        // ALWAYS show ALL 16 figures, even if no data (0% score)
        const scores = figureList.map((figName, idx) => {
          const arr = figureMap[figName] || [];
          const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
          
          // For Tiklos: Step-by-Step, use the correct 5+3+4+4 pattern labels
          let displayLabel;
          if (danceName === 'Tiklos: Step-by-Step') {
            const figNum = idx + 1;
            // Match the exact pattern from your data: F1(5) + F2(3) + F3(4) + F4(4) = 16 total
            if (figNum >= 1 && figNum <= 5) displayLabel = `F1S${figNum}`;
            else if (figNum >= 6 && figNum <= 8) displayLabel = `F2S${figNum - 5}`;
            else if (figNum >= 9 && figNum <= 12) displayLabel = `F3S${figNum - 8}`;
            else if (figNum >= 13 && figNum <= 16) displayLabel = `F4S${figNum - 12}`;
            else displayLabel = `F?S${figNum}`;
          } else {
            displayLabel = `Fig ${idx + 1}`;
          }
          
          return { name: displayLabel, dances: parseFloat(avg.toFixed(2)) };
        });

        console.log(`Final scores for ${danceName}:`, scores.slice(0, 3)); // Show first 3
        setScores(scores);

      } catch (err) {
        console.error(`Failed to fetch ${danceName}:`, err);
        setScores([]);
      }
    };

    console.log('🚀 Starting to fetch all dance scores...');
    fetchAverageScores('Binungey', BINUNGEY_FIGS, setBinungeyScores);
    fetchAverageScores('Pahid', PAHID_FIGS, setPahidScores);
    fetchAverageScores('Sua Ku Sua', SUAKUSUA_FIGS, setSuaScores);
    fetchAverageScores('Tiklos', TIKLOS_FIGS, setTiklosScores);
    fetchAverageScores('Tiklos: Step-by-Step', TIKLOS_STEPBYSTEP_FIGS, setTiklosStepByStepScores);
    console.log('✅ All dance score fetches initiated');
  }, []);

  // Fetch recent activity feed
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { data: recentHistory, error } = await supabase
          .from('user_history')
          .select('user_id, dance_name, figure_name, score, attempted_at, users:users(username)')
          .order('attempted_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Recent activity fetch error:', error);
          // Fallback: try without user join
          const { data: fallbackData } = await supabase
            .from('user_history')
            .select('user_id, dance_name, figure_name, score, attempted_at')
            .order('attempted_at', { ascending: false })
            .limit(10);
          
          if (fallbackData) {
            const formattedActivity = fallbackData.map(item => ({
              id: `${item.user_id}-${item.attempted_at}`,
              userName: item.user_id || 'Unknown User',
              action: `Completed ${item.dance_name}${item.figure_name ? ` - ${item.figure_name.replace('.json', '')}` : ''}`,
              score: item.score,
              timestamp: new Date(item.attempted_at).toLocaleString(),
              timeAgo: getTimeAgo(new Date(item.attempted_at))
            }));
            setRecentActivity(formattedActivity);
          }
          return;
        }

      if (recentHistory) {
        const formattedActivity = recentHistory.map(item => ({
          id: `${item.user_id}-${item.attempted_at}`,
          userName: item.users?.username || item.user_id || 'Unknown User',
          action: `Completed ${item.dance_name}${item.figure_name ? ` - ${item.figure_name.replace('.json', '')}` : ''}`,
          score: item.score,
          timestamp: new Date(item.attempted_at).toLocaleString(),
          timeAgo: getTimeAgo(new Date(item.attempted_at))
        }));
        setRecentActivity(formattedActivity);
      }
      } catch (err) {
        console.error('Activity fetch failed:', err);
        // Set mock data for testing
        setRecentActivity([
          {
            id: 'mock-1',
            userName: 'Test User 1',
            action: 'Completed Binungey - Figure 1',
            score: 85,
            timestamp: new Date().toLocaleString(),
            timeAgo: '2m ago'
          },
          {
            id: 'mock-2',
            userName: 'Test User 2',
            action: 'Completed Pahid - Figure 3',
            score: 92,
            timestamp: new Date().toLocaleString(),
            timeAgo: '5m ago'
          }
        ]);
      }
    };

    // Fetch top performers
    const fetchTopPerformers = async () => {
      try {
        const { data: performers, error } = await supabase
          .from('user_history')
          .select('user_id, score, users:users(username)')
          .not('score', 'is', null);
        
        if (error) {
          console.error('Top performers fetch error:', error);
          // Fallback: try without user join
          const { data: fallbackData } = await supabase
            .from('user_history')
            .select('user_id, score')
            .not('score', 'is', null);
          
          if (fallbackData) {
            const userScores = {};
            fallbackData.forEach(p => {
              const userName = p.user_id || 'Unknown User';
              if (!userScores[userName]) {
                userScores[userName] = { scores: [], totalSessions: 0 };
              }
              userScores[userName].scores.push(p.score);
              userScores[userName].totalSessions++;
            });

            const topUsers = Object.entries(userScores)
              .map(([name, data]) => ({
                name,
                avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
                sessions: data.totalSessions,
                maxScore: Math.max(...data.scores)
              }))
              .sort((a, b) => b.avgScore - a.avgScore)
              .slice(0, 5);

            setTopPerformers(topUsers);
          }
          return;
        }

      if (performers) {
        // Group by user and calculate average score
        const userScores = {};
        performers.forEach(p => {
          const userName = p.users?.username || p.user_id || 'Unknown User';
          if (!userScores[userName]) {
            userScores[userName] = { scores: [], totalSessions: 0 };
          }
          userScores[userName].scores.push(p.score);
          userScores[userName].totalSessions++;
        });

        // Calculate averages and sort
        const topUsers = Object.entries(userScores)
          .map(([name, data]) => ({
            name,
            avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
            sessions: data.totalSessions,
            maxScore: Math.max(...data.scores)
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 5);

        setTopPerformers(topUsers);
      }
      } catch (err) {
        console.error('Top performers fetch failed:', err);
        // Set mock data for testing
        setTopPerformers([
          { name: 'User123', avgScore: 95, sessions: 12, maxScore: 100 },
          { name: 'DanceProFan', avgScore: 88, sessions: 8, maxScore: 95 },
          { name: 'NewLearner', avgScore: 76, sessions: 15, maxScore: 85 }
        ]);
      }
    };

    fetchRecentActivity();
    fetchTopPerformers();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRecentActivity();
      fetchTopPerformers();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="analytics-container">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="analytics-content">
        {/* Top Dashboard */}
        <div className="top-dashboard">
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{activeUsers}</div>
                <div className="stat-label">New Users (7d)</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Activity size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{mostPopularDance}</div>
                <div className="stat-label">Popular Dance</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <BarChart3 size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalDances}</div>
                <div className="stat-label">Total Dances</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed and Top Performers Row */}
        <div className="activity-row">
          {/* Recent Activity Feed */}
          <div className="activity-feed">
            <div className="section-header">
              <Activity size={24} />
              <h3>Recent Activity</h3>
            </div>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-main">
                      <div className="activity-user">{activity.userName}</div>
                      <div className="activity-action">{activity.action}</div>
                    </div>
                    <div className="activity-meta">
                      {activity.score && (
                        <span className="activity-score">{activity.score}%</span>
                      )}
                      <span className="activity-time">{activity.timeAgo}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activity">No recent activity</div>
              )}
            </div>
          </div>

          {/* Top Performers */}
          <div className="top-performers">
            <div className="section-header">
              <Trophy size={24} />
              <h3>Top Performers</h3>
            </div>
            <div className="performers-list">
              {topPerformers.map((performer, index) => (
                <div key={performer.name} className="performer-item">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-info">
                    <div className="performer-name">{performer.name}</div>
                    <div className="performer-stats">
                      Avg: {performer.avgScore}% • {performer.sessions} sessions
                    </div>
                  </div>
                  <div className="performer-badge">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && <Trophy size={16} />}
                  </div>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <div className="no-performers">No performance data yet</div>
              )}
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
                    <Cell key={`main-cell-${idx}`} fill={['#6b3916', '#e1a94f', '#4caf50', '#2196f3', '#9c27b0'][idx % 5]} />
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
              <div className="mobile-chart-scroll">
                <ResponsiveContainer width="100%" height={400} minWidth={750}>
                <BarChart
                  data={binungeyScores}
                  margin={{ left: 40, right: 40, bottom: 80, top: 30 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Bar 
                    dataKey="dances" 
                    name="Average Score" 
                    fill="url(#binungeyGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="binungeyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6b3916" />
                      <stop offset="100%" stopColor="#8b4513" />
                    </linearGradient>
                  </defs>
                </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pahid Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">Pahid</h4>
              <div className="mobile-chart-scroll">
                <ResponsiveContainer width="100%" height={400} minWidth={750}>
                <BarChart
                  data={pahidScores}
                  margin={{ left: 40, right: 40, bottom: 80, top: 30 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Bar 
                    dataKey="dances" 
                    name="Average Score" 
                    fill="url(#pahidGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="pahidGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e1a94f" />
                      <stop offset="100%" stopColor="#f4c563" />
                    </linearGradient>
                  </defs>
                </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sua Ku Sua Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">Sua Ku Sua</h4>
              <div className="mobile-chart-scroll">
                <ResponsiveContainer width="100%" height={400} minWidth={750}>
                <BarChart
                  data={suaScores}
                  margin={{ left: 40, right: 40, bottom: 80, top: 30 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Bar 
                    dataKey="dances" 
                    name="Average Score" 
                    fill="url(#suaGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="suaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4caf50" />
                      <stop offset="100%" stopColor="#66bb6a" />
                    </linearGradient>
                  </defs>
                </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tiklos Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">Tiklos</h4>
              <div className="mobile-chart-scroll">
                <ResponsiveContainer width="100%" height={400} minWidth={750}>
                <BarChart
                  data={tiklosScores}
                  margin={{ left: 40, right: 40, bottom: 80, top: 30 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Bar 
                    dataKey="dances" 
                    name="Average Score" 
                    fill="url(#tiklosGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="tiklosGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2196f3" />
                      <stop offset="100%" stopColor="#42a5f5" />
                    </linearGradient>
                  </defs>
                </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tiklos: Step-by-Step Chart */}
            <div className="mini-chart-wrapper">
              <h4 className="chart-subtitle">👣 Tiklos: Step-by-Step</h4>
              <div className="mobile-chart-scroll">
                <ResponsiveContainer width="100%" height={450} minWidth={750}>
                <BarChart
                  data={tiklosStepByStepScores}
                  margin={{ left: 40, right: 40, bottom: 90, top: 30 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={90}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Bar 
                    dataKey="dances" 
                    name="Average Score" 
                    fill="url(#tiklosStepGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="tiklosStepGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9c27b0" />
                      <stop offset="100%" stopColor="#ba68c8" />
                    </linearGradient>
                  </defs>
                </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '8px' }}>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;