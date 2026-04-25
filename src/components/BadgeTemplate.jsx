import React, { forwardRef } from 'react';
import { Mail, BookOpen, User } from 'lucide-react';

const BadgeTemplate = forwardRef(({ student, group, qrCodeDataUrl }, ref) => {
  if (!student) return null;
  const studentName = student.name || 'Student Name';
  const studentEmail = student.email || 'No email available';
  const badgeId = student.id != null ? `STU-${String(student.id).padStart(5, '0')}` : 'STU-00000';
  const rawAcademicYear = group
    ? [group.academic_year, group.academicYear, group.year]
        .find((value) => value && String(value).trim() && String(value).trim().toLowerCase() !== 'n/a')
    : null;
  const academicYear = (() => {
    if (!rawAcademicYear) return null;
    const yearText = String(rawAcademicYear).trim();
    if (yearText.includes('/')) return yearText;
    const parsedYear = Number(yearText);
    if (Number.isInteger(parsedYear)) {
      return `${parsedYear}/${parsedYear + 1}`;
    }
    return yearText;
  })();
  const groupLabel = group
    ? `${group.name}${academicYear ? ` (${academicYear})` : ''}`
    : 'No group assigned';

  return (
    <div 
      ref={ref}
      style={{
        width: '400px',
        height: '600px',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        fontFamily: "'Outfit', sans-serif",
        border: '1px solid #e2e8f0',
        color: '#14213d'
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '48px 32px 32px', // Balanced padding
        flex: 1,
        justifyContent: 'space-between' // Distributes sections evenly
      }}>
        
        {/* Top Section: Photo & Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ 
            width: '130px', 
            height: '130px', 
            borderRadius: '24px', 
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            background: '#f1f5f9',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            marginBottom: '16px'
          }}>
            {student.personal_image ? (
              <img 
                src={student.personal_image} 
                alt={studentName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                <User size={50} color="#94a3b8" />
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#14213d', margin: '0 0 6px 0', letterSpacing: '-0.02em', textAlign: 'center' }}>
            {studentName}
          </h2>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#2563eb',
            background: '#eff6ff',
            padding: '4px 12px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Student
          </span>
        </div>

        {/* Middle Section: Contact Details */}
        <div style={{ 
          width: '100%', 
          background: '#ffffff', 
          borderRadius: '20px', 
          padding: '20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%' }}>
            <Mail size={16} color="#64748b" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {studentEmail}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%' }}>
            <BookOpen size={16} color="#64748b" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {groupLabel}
            </span>
          </div>
        </div>

        {/* Bottom Section: QR Code */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            background: '#ffffff', 
            padding: '10px', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex', // Ensures children are centered without baseline gaps
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="QR" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  display: 'block' // Removes the bottom inline whitespace
                }} 
              />
            ) : (
              <div style={{ width: '74px', height: '74px', background: '#f1f5f9', borderRadius: '8px' }} />
            )}
          </div>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Portfolio Access
          </p>
        </div>
      </div>

      {/* Static Footer */}
      <div style={{ 
        background: '#f1f5f9', 
        padding: '16px 32px', 
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Official ID</span>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#14213d' }}>{badgeId}</span>
      </div>
    </div>
  );
});

export default BadgeTemplate;