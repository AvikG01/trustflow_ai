'use client';

import React from 'react';
import ClassicTemplate from './templates/ClassicTemplate';
import TechnicalTemplate from './templates/TechnicalTemplate';
import MinimalTemplate from './templates/MinimalTemplate';

/**
 * Dedicated Printable Resume Component
 * Renders ONLY the actual resume content with no navbar, sidebars, builder UI, or controls.
 */
export default function ResumePrintable({ resume, template }) {
  if (!resume) return null;

  const activeTemplate = template || resume.template || resume.template_id || 'TechnicalTemplate';

  const renderTemplate = () => {
    switch (activeTemplate) {
      case 'ClassicTemplate':
      case 'classic':
      case 'classic_clean':
        return <ClassicTemplate data={resume} />;
      case 'MinimalTemplate':
      case 'minimal':
      case 'minimal_clean':
        return <MinimalTemplate data={resume} />;
      case 'TechnicalTemplate':
      case 'technical':
      case 'modern_clean':
      default:
        return <TechnicalTemplate data={resume} />;
    }
  };

  return (
    <div className="resume-printable-root w-full bg-white text-slate-900">
      {renderTemplate()}
    </div>
  );
}
