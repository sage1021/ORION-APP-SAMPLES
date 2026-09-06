import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import Avatar from '../components/common/Avatar';
import MobileNav from '../components/layout/MobileNav';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [timeRange, setTimeRange] = useState('30');
  const [activeMetricTab, setActiveMetricTab] = useState('views');

  const stats = {
    followers: userProfile?.followersCount || '0',
    followersGrowth: '0% this month',
    views: userProfile?.viewsCount || '0',
    viewsGrowth: '0% vs last cycle',
    engagement: '0.0%',
    engagementGrowth: '0% average',
    points: userProfile?.points || '0',
    pointsGrowth: '0 pts earned'
  };

  const topPosts = [];

  // Dynamic Chart points based on active tab
  const chartData = activeMetricTab === 'views'
    ? [20, 35, 28, 55, 48, 70, 65, 88, 78, 105, 98, 130]
    : activeMetricTab === 'followers'
    ? [10, 18, 25, 30, 42, 50, 62, 75, 88, 102, 120, 148]
    : [5, 12, 10, 22, 18, 30, 28, 42, 38, 55, 60, 78];

  const maxVal = Math.max(...chartData);
  const points = chartData.map((val, idx) => {
    const x = (idx / (chartData.length - 1)) * 500;
    const y = 140 - (val / maxVal) * 110;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="app-shell">
      <Navbar />

      <main className="content">
        <Topbar
          title="Creator Studio"
          subtitle="Real-time telemetry & analytics"
        />

        {/* Dashboard Header Filter Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px', margin: '18px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar src={userProfile?.avatar} size="medium" />
            <div>
              <b style={{ fontSize: '1rem', display: 'block' }}>{userProfile?.name || 'Creator Studio'}</b>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Live Audience Telemetry</span>
            </div>
          </div>

          <div className="tabs" role="tablist">
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: 'all', label: 'All Time' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                className={timeRange === r.id ? 'active' : ''}
                onClick={() => setTimeRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px', marginBottom: '20px'
        }}>
          {/* Card 1: Followers */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>Total Followers</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i></div>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 4px' }}>{stats.followers}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
              <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }}></i>{stats.followersGrowth}
            </span>
          </div>

          {/* Card 2: Views */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>Impressions / Reach</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-eye" style={{ color: 'var(--accent)' }}></i></div>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 4px' }}>{stats.views}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
              <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }}></i>{stats.viewsGrowth}
            </span>
          </div>

          {/* Card 3: Engagement */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>Engagement Rate</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-bolt" style={{ color: 'var(--accent-cyan)' }}></i></div>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 4px' }}>{stats.engagement}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
              <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }}></i>{stats.engagementGrowth}
            </span>
          </div>

          {/* Card 4: Creator Points */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>Creator Points</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-coins" style={{ color: 'var(--gold)' }}></i></div>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 4px' }}>{stats.points}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
              <i className="fa-solid fa-gift" style={{ marginRight: '4px' }}></i>{stats.pointsGrowth}
            </span>
          </div>
        </div>

        {/* Analytics Growth Chart */}
        <div className="panel" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Audience Growth</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>Aggregated telemetry over {timeRange} days</p>
            </div>
            <div className="tabs" role="tablist">
              {[
                { id: 'views', label: 'Views' },
                { id: 'followers', label: 'Followers' },
                { id: 'interactions', label: 'Interactions' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={activeMetricTab === tab.id ? 'active' : ''}
                  onClick={() => setActiveMetricTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive SVG Line Chart */}
          <div style={{ width: '100%', height: '150px', position: 'relative' }}>
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeDasharray="4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="var(--border)" strokeDasharray="4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="var(--border)" strokeDasharray="4" />
              
              <polygon
                points={`0,150 ${points} 500,150`}
                fill="url(#chartGradient)"
              />
              
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>

        {/* Content Performance Section */}
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 700 }}>Top Performing Content</h3>
          
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '0.86rem' }}>
            <i className="fa-solid fa-chart-simple" style={{ fontSize: '1.6rem', marginBottom: '8px', display: 'block', color: 'var(--primary)' }}></i>
            No published content yet. Create posts and reels to track performance metrics!
          </div>
        </div>
      </main>

      <Sidebar />
      <MobileNav />
    </div>
  );
}

const iconBadgeStyle = {
  width: '32px',
  height: '32px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--surface-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem'
};
