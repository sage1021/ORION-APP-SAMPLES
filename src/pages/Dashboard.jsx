import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import Avatar from '../components/common/Avatar';

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
          subtitle="Real-time analytics & performance"
        />

        {/* Dashboard Header Filter Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px', margin: '20px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar src={userProfile?.avatar} size="medium" />
            <div>
              <b style={{ fontSize: '16px', display: 'block' }}>{userProfile?.name || 'Creator Studio'}</b>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Overview & Insights</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: 'all', label: 'All Time' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setTimeRange(r.id)}
                style={{
                  padding: '6px 14px', borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: timeRange === r.id ? 'var(--primary)' : 'var(--surface)',
                  color: timeRange === r.id ? '#fff' : 'var(--text)',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px', marginBottom: '24px'
        }}>
          {/* Card 1: Followers */}
          <div style={kpiCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Total Followers</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i></div>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '8px 0 4px' }}>{stats.followers}</h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
              <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }}></i>{stats.followersGrowth} this month
            </span>
          </div>

          {/* Card 2: Views */}
          <div style={kpiCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Impressions / Reach</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-eye" style={{ color: '#6366f1' }}></i></div>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '8px 0 4px' }}>{stats.views}</h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
              <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }}></i>{stats.viewsGrowth} vs last cycle
            </span>
          </div>

          {/* Card 3: Engagement */}
          <div style={kpiCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Engagement Rate</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-bolt" style={{ color: '#deb887' }}></i></div>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '8px 0 4px' }}>{stats.engagement}</h3>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
              <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }}></i>{stats.engagementGrowth} above average
            </span>
          </div>

          {/* Card 4: Creator Points */}
          <div style={kpiCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Creator Points</span>
              <div style={iconBadgeStyle}><i className="fa-solid fa-coins" style={{ color: '#f59e0b' }}></i></div>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '8px 0 4px' }}>{stats.points}</h3>
            <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>
              <i className="fa-solid fa-gift" style={{ marginRight: '4px' }}></i>{stats.pointsGrowth} earned
            </span>
          </div>
        </div>

        {/* Analytics Growth Chart */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Audience Growth & Traffic</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>Aggregated telemetry over {timeRange} days</p>
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
          <div style={{ width: '100%', height: '160px', position: 'relative' }}>
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#deb887" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#deb887" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Horizontal Grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.08)" strokeDasharray="4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.08)" strokeDasharray="4" />
              
              {/* Filled Area */}
              <polygon
                points={`0,150 ${points} 500,150`}
                fill="url(#chartGradient)"
              />
              
              {/* Trend Line */}
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>

        {/* Top Performing Content Section */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>Top Performing Content</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topPosts.length > 0 ? (
              topPosts.map(post => (
                <div
                  key={post.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px', borderRadius: '8px', background: 'var(--surface-soft)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: '14px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title}
                    </b>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      <span>{post.type}</span>
                      <span>•</span>
                      <span>{post.date}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', textAlign: 'right' }}>
                    <div>
                      <b style={{ fontSize: '14px', color: 'var(--text)', display: 'block' }}>{post.views}</b>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Views</span>
                    </div>
                    <div>
                      <b style={{ fontSize: '14px', color: '#ef4444', display: 'block' }}>{post.likes}</b>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Likes</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '13px' }}>
                No published content yet. Create your first post or reel to track performance analytics!
              </div>
            )}
          </div>
        </div>
      </main>

      <Sidebar />
    </div>
  );
}

const kpiCardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '18px',
  boxShadow: 'var(--shadow)'
};

const iconBadgeStyle = {
  width: '34px',
  height: '34px',
  borderRadius: '8px',
  background: 'var(--surface-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px'
};
