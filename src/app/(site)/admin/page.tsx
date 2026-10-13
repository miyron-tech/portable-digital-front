// src/app/(site)/admin/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Brand } from '@/components/Brand';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'pipeline' | 'media'>('overview');
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="viewport" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000', color: '#fff' }}>
      
      {/* Шапка Администратора */}
      <header className="header" style={{ position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link className="brand" href="/" aria-label="Portable digital — home">
          <Brand />
        </Link>

        <div className="header-actions">
          <div className="time-panel">
            <span className="time-label">Mode</span>
            <span className="time-value" style={{ color: maintenance ? '#f87171' : '#4ade80' }}>
              {maintenance ? 'MAINTENANCE' : 'LIVE OPERATIONAL'}
            </span>
          </div>

          <button
            type="button"
            className="sign-up"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => setMaintenance(!maintenance)}
          >
            {maintenance ? 'Disable Maintenance' : 'Toggle Maintenance'}
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        <Container className="store-home-section" style={{ paddingTop: '3rem' }}>
          
          <div className="store-heading" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span className="store-eyebrow">00 / ADMINISTRATION</span>
              <h2 className="store-display">
                Engine Control.<br />
                <span>Quiet Execution.</span>
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {([
                ['overview', '01 / Telemetry'],
                ['services', '02 / Services'],
                ['pipeline', '03 / Pipeline'],
                ['media', '04 / Video Reel'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    border: '1px solid',
                    borderColor: activeTab === key ? '#fff' : 'rgba(255,255,255,0.1)',
                    background: activeTab === key ? '#fff' : 'rgba(255,255,255,0.03)',
                    color: activeTab === key ? '#000' : '#fff',
                    fontWeight: activeTab === key ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                
                <div className="store-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                  <span className="store-eyebrow" style={{ marginBottom: '0.5rem', display: 'block' }}>API STATUS</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Featured Services API</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>`getFeaturedServices()` status monitor</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Latency: 18ms</span>
                    <span style={{ color: '#4ade80' }}>● Operational</span>
                  </div>
                </div>

                <div className="store-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                  <span className="store-eyebrow" style={{ marginBottom: '0.5rem', display: 'block' }}>BACKGROUND REEL</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Video CDN Stream</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>4 clips active in rotation (`SLOT_MS: 25s`)</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Cloudfront CDN</span>
                    <span style={{ color: '#4ade80' }}>● Healthy</span>
                  </div>
                </div>

                <div className="store-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                  <span className="store-eyebrow" style={{ marginBottom: '0.5rem', display: 'block' }}>CLIENT ORDERS</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Active Deliveries</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>Projects currently in build phase</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>In progress: 3</span>
                    <span style={{ color: '#60a5fa' }}>● Shipping</span>
                  </div>
                </div>

              </div>

              <div>
                <span className="store-eyebrow" style={{ marginBottom: '0.75rem', display: 'block' }}>LIVE AUDIT STREAM</span>
                <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>[11:42:01]</span> <span style={{ color: '#4ade80' }}>SUCCESS</span> Vantage Motion Script initialized.</div>
                  <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>[11:42:05]</span> <span style={{ color: '#60a5fa' }}>INFO</span> BackgroundReel loaded slot 0</div>
                  <div><span style={{ color: 'rgba(255,255,255,0.3)' }}>[11:43:10]</span> <span style={{ color: '#4ade80' }}>SUCCESS</span> `getFeaturedServices()` cache hit.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                <span>Service Name</span>
                <span>Type</span>
                <span>Home Visibility</span>
                <span>Actions</span>
              </div>
              {[
                { name: 'Legacy Modernization & Refactoring', type: 'Architecture', featured: true },
                { name: 'High-Load API Integration Bridge', type: 'Backend', featured: true },
                { name: 'Zero-Drama Crisis Delivery', type: 'Execution', featured: false },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{item.type}</span>
                  <span>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: item.featured ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.05)', color: item.featured ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
                      {item.featured ? 'Featured on Home' : 'Hidden'}
                    </span>
                  </span>
                  <div>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Edit Scope
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[
                { client: 'Fintech Core Migration', step: '02 / Make it yours', status: 'In Review', date: 'Today' },
                { client: 'ERP Integration Layer', step: '03 / Build what comes next', status: 'In Delivery', date: 'Yesterday' },
              ].map((card, i) => (
                <div key={i} className="store-panel" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem' }}>
                  <span className="store-eyebrow">{card.step}</span>
                  <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{card.client}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Received: {card.date}</span>
                    <span style={{ color: '#60a5fa' }}>{card.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'media' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Vantage Original' },
                { title: 'Rocket Launch' },
                { title: 'Robot Portrait' },
                { title: 'Robot Arm' },
              ].map((video, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ width: '100%', height: '120px', background: '#111', borderRadius: '4px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    [{video.title} Preview]
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{video.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>Slot {idx + 1} • 25s duration</div>
                </div>
              ))}
            </div>
          )}

        </Container>
      </main>

    </div>
  );
}
