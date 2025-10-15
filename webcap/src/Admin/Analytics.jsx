import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie } from "recharts";
import { TrendingUp, Users, Activity, Trophy, BarChart3, Star, Download } from 'lucide-react';
import { supabase } from "../supabasebaseClient";
import Sidebar from '../Admin/Sidebar';
import './Analytics.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  
  // New states for additional features
  const [averageAge, setAverageAge] = useState(0);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [popularDanceTrend, setPopularDanceTrend] = useState([]);
  const [trendDateRange, setTrendDateRange] = useState("30");
  
  // PDF Download Modal State
  const [showDownloadModal, setShowDownloadModal] = useState(false);

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

  // Fetch average age and gender distribution of users who attempted dancing
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        // Get unique user IDs from user_history
        const { data: historyData } = await supabase
          .from('user_history')
          .select('user_id');
        
        if (historyData && historyData.length > 0) {
          const uniqueUserIds = [...new Set(historyData.map(row => row.user_id))];
          
          // Fetch age and gender for these users
          const { data: userData } = await supabase
            .from('users')
            .select('age, gender')
            .in('id', uniqueUserIds);
          
          if (userData) {
            // Calculate average age
            const validAges = userData.filter(u => u.age != null && u.age > 0).map(u => u.age);
            const avgAge = validAges.length > 0 
              ? Math.round(validAges.reduce((sum, age) => sum + age, 0) / validAges.length)
              : 0;
            setAverageAge(avgAge);
            
            // Calculate gender distribution
            const genderCounts = {
              'Male': 0,
              'Female': 0,
              'Other': 0,
              'Prefer not to say': 0
            };
            
            userData.forEach(u => {
              if (u.gender) {
                if (genderCounts.hasOwnProperty(u.gender)) {
                  genderCounts[u.gender]++;
                } else {
                  genderCounts['Other']++;
                }
              }
            });
            
            const genderData = Object.entries(genderCounts).map(([name, count]) => ({
              name: name === 'Prefer not to say' ? 'Prefer not\nto say' : name,
              count,
              percentage: userData.length > 0 ? ((count / userData.length) * 100).toFixed(1) : 0
            }));
            
            setGenderDistribution(genderData);
            
            // Calculate age distribution (group by age ranges)
            const ageRanges = {
              '13-17': 0,
              '18-24': 0,
              '25-34': 0,
              '35-44': 0,
              '45-54': 0,
              '55+': 0
            };
            
            validAges.forEach(age => {
              if (age >= 13 && age <= 17) ageRanges['13-17']++;
              else if (age >= 18 && age <= 24) ageRanges['18-24']++;
              else if (age >= 25 && age <= 34) ageRanges['25-34']++;
              else if (age >= 35 && age <= 44) ageRanges['35-44']++;
              else if (age >= 45 && age <= 54) ageRanges['45-54']++;
              else if (age >= 55) ageRanges['55+']++;
            });
            
            const ageData = Object.entries(ageRanges).map(([range, count]) => ({
              range,
              count,
              percentage: validAges.length > 0 ? ((count / validAges.length) * 100).toFixed(1) : 0
            }));
            
            setAgeDistribution(ageData);
          }
        }
      } catch (error) {
        console.error('Error fetching demographics:', error);
      }
    };
    
    fetchDemographics();
    const intervalId = setInterval(fetchDemographics, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch trend data for most popular dance
  useEffect(() => {
    const fetchPopularDanceTrend = async () => {
      if (mostPopularDance === 'N/A') return;
      
      try {
        const { data: trendData } = await supabase
          .from('user_history')
          .select('attempted_at, score')
          .eq('dance_name', mostPopularDance)
          .order('attempted_at', { ascending: true });
        
        if (trendData && trendData.length > 0) {
          // Filter by date range
          const now = new Date();
          let filteredData = trendData;
          
          if (trendDateRange !== "all") {
            const daysAgo = parseInt(trendDateRange);
            const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
            filteredData = trendData.filter(item => new Date(item.attempted_at) >= cutoffDate);
          }
          
          // Group by date and calculate average score
          const dateMap = {};
          filteredData.forEach(item => {
            const date = new Date(item.attempted_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            if (!dateMap[date]) {
              dateMap[date] = { total: 0, count: 0 };
            }
            dateMap[date].total += item.score || 0;
            dateMap[date].count += 1;
          });
          
          const chartData = Object.entries(dateMap).map(([date, data]) => ({
            date,
            score: parseFloat((data.total / data.count).toFixed(2))
          }));
          
          setPopularDanceTrend(chartData);
        }
      } catch (error) {
        console.error('Error fetching popular dance trend:', error);
      }
    };
    
    fetchPopularDanceTrend();
  }, [mostPopularDance, trendDateRange]);

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

  // PDF Download Function
  const downloadAnalyticsPDF = () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Data check:', { 
        totalUsers, 
        activeUsers, 
        totalSessions, 
        mostPopularDance,
        totalDances,
        averageAge,
        genderDistributionLength: genderDistribution.length,
        ageDistributionLength: ageDistribution.length,
        chartDataLength: chartData.length
      });
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;
      
      console.log('PDF document initialized');

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Analytics Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Summary Statistics
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Users', totalUsers.toString()],
        ['New Users (7 days)', activeUsers.toString()],
        ['Total Sessions', totalSessions.toString()],
        ['Most Popular Dance', mostPopularDance],
        ['Total Dances', totalDances.toString()],
        ['Average Age (Dancers)', averageAge > 0 ? averageAge.toString() : 'N/A']
      ],
      theme: 'grid',
      headStyles: { fillColor: [160, 133, 91] },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Gender Distribution
    if (genderDistribution.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Gender Distribution', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Gender', 'Count', 'Percentage']],
        body: genderDistribution.map(item => [
          item.name,
          item.count.toString(),
          `${item.percentage}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [160, 133, 91] },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Age Distribution
    if (ageDistribution.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Age Distribution', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Age Range', 'Count', 'Percentage']],
        body: ageDistribution.map(item => [
          item.range,
          item.count.toString(),
          `${item.percentage}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [160, 133, 91] },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Popular Dances
    if (chartData.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Dance Popularity', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Dance Name', 'Attempts']],
        body: chartData.map(item => [
          item.name,
          item.dances.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [160, 133, 91] },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Top Performers
    if (topPerformers.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Top Performers', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Rank', 'Name', 'Avg Score', 'Sessions']],
        body: topPerformers.map((performer, idx) => [
          `#${idx + 1}`,
          performer.name,
          `${performer.avgScore}%`,
          performer.sessions.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [160, 133, 91] },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Recent Activity
    if (recentActivity.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Recent Activity', 14, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['User', 'Action', 'Score', 'Time']],
        body: recentActivity.slice(0, 20).map(activity => [
          activity.userName,
          activity.action,
          activity.score ? `${activity.score}%` : '-',
          activity.timeAgo
        ]),
        theme: 'grid',
        headStyles: { fillColor: [160, 133, 91] },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Average Scores per Dance
    const danceScores = [
      { name: 'Binungey', scores: binungeyScores },
      { name: 'Pahid', scores: pahidScores },
      { name: 'Sua Ku Sua', scores: suaScores },
      { name: 'Tiklos', scores: tiklosScores },
      { name: 'Tiklos: Step-by-Step', scores: tiklosStepByStepScores }
    ];

    danceScores.forEach(dance => {
      if (dance.scores.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${dance.name} - Average Scores`, 14, yPos);
        yPos += 10;

        autoTable(doc, {
          startY: yPos,
          head: [['Figure', 'Average Score']],
          body: dance.scores.map(item => [
            item.name,
            `${item.dances}%`
          ]),
          theme: 'grid',
          headStyles: { fillColor: [160, 133, 91] },
          margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }
    });

    // Save the PDF
    console.log('Saving PDF...');
    doc.save(`Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('PDF saved successfully');
    setShowDownloadModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check the console for details.');
      setShowDownloadModal(false);
    }
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
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{averageAge > 0 ? averageAge : 'N/A'}</div>
                <div className="stat-label">Avg Age (Dancers)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed, Top Performers, Gender and Age Distribution - 2x2 Grid */}
        <div className="analytics-two-column-row">
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

          {/* Gender Distribution */}
<div className="analytics-gender-distribution-card">
  <div className="section-header">
    <Users size={24} />
    <h3>Gender Distribution</h3>
  </div>
  <div className="analytics-gender-chart-content">
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={genderDistribution.filter(item => item.count > 0)}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius={120}
          innerRadius={0}
          fill="#8884d8"
          dataKey="count"
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
          activeShape={{
            outerRadius: 135,
            stroke: '#fff',
            strokeWidth: 3,
            filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
          }}
        >
          {genderDistribution.filter(item => item.count > 0).map((entry, idx) => (
            <Cell 
              key={`gender-cell-${idx}`} 
              fill={['#3b82f6', '#ec4899', '#8b5cf6', '#6b7280'][idx % 4]}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '12px'
          }}
          formatter={(value, name, props) => {
            const item = props.payload;
            return [
              `${value} (${item.percentage}%)`,
              item.name
            ];
          }}
        />
        <Legend 
          formatter={(value, entry) => {
            const { payload } = entry;
            return `${value}: ${payload.count} (${payload.percentage}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

          {/* Age Distribution */}
<div className="analytics-age-distribution-card">
  <div className="section-header">
    <Users size={24} />
    <h3>Age Distribution</h3>
  </div>
  <div className="analytics-age-chart-content">
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={ageDistribution.filter(item => item.count > 0)}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius={120}
          innerRadius={0}
          fill="#8884d8"
          dataKey="count"
          nameKey="range"
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
          activeShape={{
            outerRadius: 135,
            stroke: '#fff',
            strokeWidth: 3,
            filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))'
          }}
        >
          {ageDistribution.filter(item => item.count > 0).map((entry, idx) => (
            <Cell 
              key={`age-cell-${idx}`} 
              fill={['#ff6b6b', '#ffa500', '#ffd700', '#32cd32', '#1e90ff', '#9370db'][idx % 6]}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '12px'
          }}
          formatter={(value, name, props) => {
            const item = props.payload;
            return [
              `${value} (${item.percentage}%)`,
              `Age ${item.range}`
            ];
          }}
        />
        <Legend 
          formatter={(value, entry) => {
            const { payload } = entry;
            return `Age ${value}: ${payload.count} (${payload.percentage}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>
        </div>

        {/* Popular Dances Chart - Side by Side with Trend */}
        <div className="chart-section">
          <h2 className="popular-dance-heading">Popular Dances Analysis</h2>
          <p className="chart-subtext">Most Performed Dance Activities & Trends</p>
          
          {/* Two Charts Side by Side Container */}
          <div className="analytics-dual-chart-container">
            {/* Popular Dances Bar Chart */}
            <div className="analytics-chart-card">
              <h3 className="analytics-chart-title">Dance Popularity</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend wrapperStyle={{ color: '#000000' }} />
                  <Bar dataKey="dances" name="Attempts">
                    {chartData.map((entry, idx) => (
                      <Cell key={`main-cell-${idx}`} fill={['#6b3916', '#e1a94f', '#4caf50', '#2196f3', '#9c27b0'][idx % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Most Popular Dance Trend Chart */}
            <div className="analytics-chart-card">
              <div className="analytics-chart-header">
                <h3>{mostPopularDance} Trend</h3>
                <select 
                  value={trendDateRange}
                  onChange={(e) => setTrendDateRange(e.target.value)}
                  className="analytics-date-select"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div className="trend-chart-scroll">
                <ResponsiveContainer width="100%" height={350} minWidth={600}>
                  <LineChart data={popularDanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-15} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend wrapperStyle={{ color: '#000000' }} />
                    <Line type="monotone" dataKey="score" name="Avg Score" stroke="#8b4513" strokeWidth={2} dot={{ fill: '#8b4513', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
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
              <h4 className="chart-subtitle">Tiklos: Step-by-Step</h4>
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

        {/* Floating Download Button */}
        <button 
          className="floating-download-btn" 
          onClick={() => setShowDownloadModal(true)}
          title="Download Analytics Report"
        >
          <Download size={24} />
        </button>

        {/* Download Confirmation Modal */}
        {showDownloadModal && (
          <div className="modal-overlay" onClick={() => setShowDownloadModal(false)}>
            <div className="download-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="download-modal-content">
                <div className="download-modal-header">
                  <Download size={32} />
                  <h2>Download Analytics Report</h2>
                </div>
                
                <div className="download-modal-body">
                  <p>This will generate a comprehensive PDF report containing:</p>
                  <ul>
                    <li>Summary statistics</li>
                    <li>Gender and age distribution</li>
                    <li>Dance popularity data</li>
                    <li>Top performers</li>
                    <li>Recent activity</li>
                    <li>Average scores per dance and figure</li>
                  </ul>
                  <p>Do you want to continue?</p>
                </div>
                
                <div className="download-modal-footer">
                  <button 
                    className="download-modal-btn cancel-btn" 
                    onClick={() => setShowDownloadModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="download-modal-btn confirm-btn" 
                    onClick={downloadAnalyticsPDF}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;